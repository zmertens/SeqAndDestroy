var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', 
	{ preload: preload, create: create, update: update, render: render });


var obj = {};
var fireRate = 100;
var nextFire;


function preload() {
  game.load.image('ball', 'assets/ball_grayscale.png');
  game.load.image('square', 'assets/block_solid.png');
}

function create() {
  game.stage.backgroundColor = "#333333";
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //game.physics.arcade.gravity.y = 100;
  nextFire = game.time.now + fireRate;

  var nucFac = nucleotides.createNucleotideFactory({ game: game });

  var rowsCount = 5;
  var colsCount = 20;

  obj.nucleotides = game.add.group();
  for (var i = 0; i < rowsCount; i++) {
    for (var j = 0; j < colsCount; j++) {
      var nuc = nucFac.createRandomNucleotide({ x: j*40 + 20, y: i*40 + 20 });
      obj.nucleotides.add(nuc);
    }
  }

  obj.rna = game.add.group();
  for (var i = 0; i < 6; i++) {
    var nuc = nucFac.createRandomNucleotide({ x: i*40 + 300, y: 580 });
    obj.rna.add(nuc);
  }

  game.physics.enable(obj.nucleotides, Phaser.Physics.ARCADE);
  obj.nucleotides.setAll('body.immovable', true);

  game.physics.enable(obj.rna, Phaser.Physics.ARCADE);
}

function update() {
  if (game.time.now > nextFire && game.input.activePointer.isDown) {
    nextFire = game.time.now + fireRate;

    for (var i = 0; i < obj.rna.length; i++) {
      var x = game.input.x + i*40;
      game.physics.arcade.moveToXY(obj.rna.getChildAt(i), x, game.input.y, 500);
    }
  }

  game.physics.arcade.collide(obj.nucleotides, obj.rna, collisionHandler, null,
    this);
}

function collisionHandler(obj1, obj2) {
  obj2.kill();
}

function render() {
}
