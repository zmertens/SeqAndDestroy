(function() {
  "use strict";

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'SeqAndDestroy', 
	  { preload: preload, create: create, update: update, render: render });

  var width = 38.4;
  var height = 38.4;

  var nucFac;
  var fireRate = 100;
  var nextFire;
  var matched = false;
  var siRNAsMoving = false;
  var siRNAs;
  var rna;
  var snapped = false;


  function preload() {
    game.load.image('ball', 'assets/ball_grayscale.png');
    game.load.image('square', 'assets/block_solid.png');
  }

  function create() {
    game.stage.backgroundColor = "#333333";
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.gravity.y = 100;
    nextFire = game.time.now + fireRate;

    nucFac = nucleobases.createNucleobaseFactory({ game: game });

    var rowsCount = 5;
    var colsCount = 20;

    rna = game.add.group();
    rna.inputEnableChildren = true;
    rna.onChildInputDown.add(nucOnDown, this);
    for (var i = 0; i < rowsCount; i++) {
      for (var j = 0; j < colsCount; j++) {
        var nuc = nucFac.createRandomNucleobase(
          { x: j*width + width/2, y: i*height + height/2 });
        rna.add(nuc);
      }
    }

    siRNAs = game.add.group();
    siRNAs.inputEnableChildren = true;
    siRNAs.onChildInputDown.add(siRNAsOnDown, this);
    siRNAs.enableBody = true;
    for (var i = 0; i < 3; i++) {
      var nuc = nucFac.createRandomNucleobase({ x: i*width + 350, y: 580 });
      siRNAs.add(nuc);
    }

    game.physics.enable(rna, Phaser.Physics.ARCADE);
    rna.setAll('body.immovable', true);

    game.physics.enable(siRNAs, Phaser.Physics.ARCADE);
  }

  function update() {
    if (!siRNAsMoving) {

      if (game.time.now > nextFire && game.input.activePointer.isDown) {
        var allChosen = true;

        siRNAs.forEach(function(rna) {
          if (rna.data.nucleobaseType === 'placeholder') {
            allChosen = false;
          }
        });

        if (allChosen) {

          siRNAsMoving = true;

          for (var i = 0; i < siRNAs.length; i++) {
            var x = game.input.x + i*width;
            game.physics.arcade.moveToXY(siRNAs.getAt(i), x, game.input.y,
              500);
          }
        }

      }
    }

    game.physics.arcade.overlap(rna, siRNAs, overlapHandler,
      null, this);

    if (!matched) {
      checkMatches();
    }
  }

  function render() {
  }

  function overlapHandler(rna, siRNA) {

    if (!snapped) {
      snapToGrid();
      snapped = true;
    }

    siRNA.data.overlapping = true;

    if (matchedBase(rna, siRNA)) {
      siRNA.data.matched = true;
    }
  }

  function nucOnDown(sprite) {
  }

  // Cycles through the available rna
  function siRNAsOnDown(sprite) {
    if (!siRNAsMoving) {
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
    var index = siRNAs.getIndex(sprite);
    siRNAs.addAt(newNuc, index);
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
    var allOverlapped = true;

    for (var i = 0; i < siRNAs.length; i++ ) {
      var rna = siRNAs.getAt(i);

      if (!rna.data.overlapping) {
        allOverlapped = false;
        break;
      }
    }

    if (allOverlapped) {
      var allMatched = true;

      for (var i = 0; i < siRNAs.length; i++) {
        var rna = siRNAs.getAt(i);

        if (!rna.data.matched) {
          allMatched = false;
          break;
        }
      }

      if (allMatched) {
        matched = true;
      }
      else {
        siRNAs.destroy();
      }
    }
  }

  function snapToGrid() {

    siRNAs.forEach(function(siRNA) {
      var gridCorrection = computeGridCorrection(siRNA);

      siRNA.body.velocity.x = 0;
      siRNA.body.velocity.y = 0;
      siRNA.x = siRNA.x + gridCorrection.x;
      siRNA.y = siRNA.y + gridCorrection.y - height/2;
    });
  }

  function computeGridCorrection(siRNA) {
    var xCorrectionPixels = computeAxisCorrection(siRNA.x, width);
    var yCorrectionPixels = computeAxisCorrection(siRNA.y, height);

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

})();
