(function() {
  "use strict";

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', 
	  { preload: preload, create: create, update: update, render: render });


  var nucFac;
  var obj = {};
  var fireRate = 100;
  var nextFire;
  var matched = false;


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

    obj.nucleobases = game.add.group();
    obj.nucleobases.inputEnableChildren = true;
    obj.nucleobases.onChildInputDown.add(nucOnDown, this);
    for (var i = 0; i < rowsCount; i++) {
      for (var j = 0; j < colsCount; j++) {
        var nuc = nucFac.createRandomNucleobase({ x: j*40 + 20, y: i*40 + 20 });
        obj.nucleobases.add(nuc);
      }
    }

    obj.miRNA = game.add.group();
    obj.miRNA.inputEnableChildren = true;
    obj.miRNA.onChildInputDown.add(miRNAOnDown, this);
    obj.miRNA.enableBody = true;
    for (var i = 0; i < 6; i++) {
      var nuc = nucFac.createRandomNucleobase({ x: i*40 + 300, y: 580 });
      obj.miRNA.add(nuc);
    }

    game.physics.enable(obj.nucleobases, Phaser.Physics.ARCADE);
    obj.nucleobases.setAll('body.immovable', true);

    game.physics.enable(obj.miRNA, Phaser.Physics.ARCADE);
  }

  function update() {
    if (game.time.now > nextFire && game.input.activePointer.isDown) {
      var allChosen = true;

      obj.miRNA.forEach(function(rna) {
        if (rna.data.nucleobaseType === 'placeholder') {
          allChosen = false;
        }
      });

      if (allChosen) {
        for (var i = 0; i < obj.miRNA.length; i++) {
          var x = game.input.x + i*40;
          game.physics.arcade.moveToXY(obj.miRNA.getAt(i), x, game.input.y, 500);
          //game.add.tween(obj.miRNA.getAt(i)).to({ x: x, y: game.input.y }, 2000).start();
        }
      }

    }

    game.physics.arcade.overlap(obj.nucleobases, obj.miRNA, overlapHandler,
      null, this);

    if (!matched) {
      checkMatches();
    }
  }

  function render() {
  }

  function overlapHandler(obj1, obj2) {
    if (matchedBase(obj1, obj2)) {
      //obj2.body.velocity.x = 0;
      //obj2.body.velocity.y = 0;
      obj2.data.matched = true;
      obj2.data.complementX = obj1.body.x;
      obj2.data.complementY = obj1.body.y;
    }
  }

  function nucOnDown(sprite) {
  }

  // Cycles through the available nucleobases
  function miRNAOnDown(sprite) {
    nextFire = game.time.now + fireRate;

    // Once you've switched away from the placeholder, there's no way to get back
    // to it.
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
  };

  function replacePlaceholder(sprite, constructor) {
    var newNuc = constructor({ x: sprite.x, y: sprite.y });
    var index = obj.miRNA.getIndex(sprite);
    obj.miRNA.addAt(newNuc, index);
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
    var allMatched = true;

    for (var i = 0; i < obj.miRNA.length; i++) {
      var rna = obj.miRNA.getAt(i);

      if (!rna.data.matched) {
        allMatched = false;
        break;
      }
    }

    if (allMatched) {
      matched = true;
      //obj.miRNA.setAll('body.velocity.x', 0);
      //obj.miRNA.setAll('body.velocity.y', 0);
      obj.miRNA.forEach(function(rna) {
        rna.body.moves = false;
        game.add.tween(rna).to({ x: rna.data.complementX, y: rna.data.complementY }, 1000).start();
      });
    }
  }

})();
