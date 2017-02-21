(function() {
  "use strict";

  var gameWidth = 800;
  var gameHeight = 600;

  var spriteWidth = 40;
  var spriteHeight = 40;

  var nucFac;
  var fireRate = 100;
  var nextFire;
  var matched = false;
  var nrtiMoving = false;
  var nrti;
  var rna;
  var snapped = false;
  var activeRow = null;

  var bacteriaFilter;
  var bacteriaSprite;

  var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS,
    'SeqAndDestroy', 
	  { preload: preload, create: create, update: update, render: render });

  var ReverseTranscriptase = function(nucFac, row) {
    this._nucFac = nucFac;
    this._row = row;
    this._col = 0;
  };

  ReverseTranscriptase.prototype.activate = function() {
    this.addNextNucleotide();
  };

  ReverseTranscriptase.prototype.addNextNucleotide = function() {

    var rna = this._row.getAt(this._col); 
    var x = computeXFromColumn(this._col);
    var y = rna.y + spriteHeight/2;
    var comp = complement(rna.data.nucleobaseType);
    this._nucFac.createNucleobaseFromType({ type: comp, x: x, y: y });
    this._col++;

    game.time.events.add(Phaser.Timer.SECOND * 0.5, this.addNextNucleotide,
      this);
  };

  function preload() {
    game.load.image('ball', 'assets/ball_grayscale.png');
    game.load.image('square', 'assets/block_solid.png');
    game.load.shader('bacteria', 'assets/bacteria.frag');
  }

  function create() {
    game.stage.backgroundColor = "#333333";
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.gravity.y = 100;

    bacteriaFilter = new Phaser.Filter(game, null,
      game.cache.getShader('bacteria'));
    bacteriaFilter.setResolution(gameWidth, gameHeight);
    bacteriaSprite = game.add.sprite();
    bacteriaSprite.width = gameWidth;
    bacteriaSprite.height = gameHeight;
    bacteriaSprite.filters = [bacteriaFilter];

    nextFire = game.time.now + fireRate;

    var factoryOptions = {
      game: game,
      spriteWidth: spriteWidth,
      spriteHeight: spriteHeight
    };
    nucFac = nucleobases.createNucleobaseFactory(factoryOptions);

    var rowsCount = 5;
    var rows = [];
    for (var i = 0; i < rowsCount; i++) {
      var rowHeight = computeYFromRow(i);
      rows.push(createRow(rowHeight));
    }
    activeRow = rows[rows.length-1];

    var trans = new ReverseTranscriptase(nucFac, activeRow);
    trans.activate();

    var halfwayAcrossScreen = gameWidth/2;
    nrti = nucFac.createRandomNucleobase(
        { x: halfwayAcrossScreen, y: 580 });
    nrti.enableBody = true;

    game.physics.enable(nrti, Phaser.Physics.ARCADE);
  }

  function update() {
    bacteriaFilter.update();
    
    if (!nrtiMoving) {

      if (game.time.now > nextFire && game.input.activePointer.isDown) {
        var allChosen = true;

        if (nrti.data.nucleobaseType !== 'placeholder') {

          nrtiMoving = true;
          game.physics.arcade.moveToXY(nrti, game.input.x, game.input.y, 500);
        }
      }
    }

    game.physics.arcade.overlap(nrti, activeRow, overlapHandler, null, this);

    if (!matched) {
      checkMatches();
    }
  }

  function render() {
  }

  function overlapHandler(nucleotide, rna) {

    if (!snapped) {
      snapToGrid();
      snapped = true;
    }

    nucleotide.data.overlapping = true;

    if (matchedBase(rna, nucleotide)) {
      nucleotide.data.matched = true;
    }
  }

  function rnaOnDown(sprite) {
  }

  // Cycles through the available rna
  function nrtiOnDown(sprite) {
    if (!nrtiMoving) {
      nextFire = game.time.now + fireRate;

      // Once you've switched away from the placeholder, there's no way to get
      // back to it.
      if (sprite.data.nucleobaseType === 'placeholder' ||
          sprite.data.nucleobaseType === 'uracil') {
        replacePlaceholder(sprite, nucFac.createAdenine.bind(nucFac));
      }
      else if (sprite.data.nucleobaseType === 'adenine') {
        replacePlaceholder(sprite, nucFac.createCytosine.bind(nucFac));
      }
      else if (sprite.data.nucleobaseType === 'cytosine') {
        replacePlaceholder(sprite, nucFac.createGuanine.bind(nucFac));
      }
      else if (sprite.data.nucleobaseType === 'guanine') {
        replacePlaceholder(sprite, nucFac.createUracil.bind(nucFac));
      }
      else {
        throw "Invalid nucleobaseType";
      }
    }
  };

  function replacePlaceholder(sprite, constructor) {
    var newNuc = constructor({ x: sprite.x, y: sprite.y });
    nrti = newNuc;
    sprite.destroy();
  }

  function matchedBase(obj1, obj2) {
    return complement(obj1.data.nucleobaseType) === obj2.data.nucleobaseType;
  }

  var compMap = {
    'adenine': 'uracil',
    'cytosine': 'guanine',
    'guanine': 'cytosine',
    'uracil': 'adenine'
  };

  function complement(nucleobaseType) {
    return compMap[nucleobaseType];
  }

  function checkMatches() {
    if (nrti.data.overlapping) {
      if (nrti.data.matched) {
        matched = true;
      }
      else {
        nrti.destroy();
      }
    }
  }

  function snapToGrid() {

    var gridCorrection = computeGridCorrection(nrti);

    nrti.body.velocity.x = 0;
    nrti.body.velocity.y = 0;
    nrti.x = nrti.x + gridCorrection.x;
    nrti.y = nrti.y + gridCorrection.y - spriteHeight/2;
  }

  function computeGridCorrection(nucleotide) {
    var xCorrectionPixels = computeAxisCorrection(nucleotide.x, spriteWidth);
    var yCorrectionPixels = computeAxisCorrection(nucleotide.y, spriteHeight);

    return { x: xCorrectionPixels, y: yCorrectionPixels };
  }

  function computeAxisCorrection(value, divisionSize) {
    var globalOffset = divisionSize / 2;
    var axisRatio = (value + globalOffset) / divisionSize;
    var divisionsCount = Math.floor(axisRatio);
    var axisOffset = axisRatio - divisionsCount;

    var snapNegative = axisOffset < 0.5;

    var axisCorrection;
    if (snapNegative) {
      axisCorrection = -axisOffset;
    }
    else {
      axisCorrection = 1 - axisOffset;
    }

    var axisCorrectionPixels = divisionSize * axisCorrection;

    return axisCorrectionPixels;
  }

  function createRow(height) {
    var colsCount = gameWidth / spriteWidth;
    var row = game.add.group();
    row.inputEnableChildren = true;
    row.onChildInputDown.add(rnaOnDown, this);

    for (var i = 0; i < colsCount; i++) {
      var x = computeXFromColumn(i);
      var nuc = nucFac.createRandomNucleobase({ x: x, y: height });
      row.add(nuc);
      game.physics.enable(row, Phaser.Physics.ARCADE);
      row.setAll('body.immovable', true);
    }

    return row;
  }

  function computeXFromColumn(col) {
    return col*spriteWidth + spriteWidth/2;
  }

  function computeYFromRow(row) {
    return row*spriteHeight + spriteHeight/2;
  }

})();
