var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', 
	{ preload: preload, create: create, update: update, render: render });


var objects = {};


function preload() {
  game.load.image('ball', 'assets/ball_grayscale.png');
  game.load.image('square', 'assets/block_solid.png');
}

function create() {

  game.stage.backgroundColor = "#333333";
  var nucFac = nucleotides.createNucleotideFactory({ game: game });

  var rowsCount = 5;
  var colsCount = 20;

  for (var i = 0; i < rowsCount; i++) {
    for (var j = 0; j < colsCount; j++) {
      nucFac.createRandomNucleotide({ x: j*40 + 20, y: i*40 + 20 });
    }
  }

  for (var i = 0; i < 6; i++) {
    nucFac.createRandomNucleotide({ x: i*40 + 300, y: 580 });
  }
}

function update() {
}

function render() {
}
