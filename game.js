var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', 
	{ create: create, render: render });

var circle = [];
var floor;
var offsetX = 70; // roughly the diameter
var offsetY = 70;

function create() {
	for (var i = 0; i != 25; ++i) {
		for (var j = 0; j != 10; ++j) {
			circle = new Phaser.Circle(/*game.world.centerX*/i * offsetX, j * offsetY, 64)
		}

	}
}

function render() {
	for (var i = 0; i != 250; ++i) {
		game.debug.geom(circle[i], '#cfffff');
	}
	// game.debug.text('Diameter: ' + circle.diameter, 50, 200);
	// game.debug.text('Circumference : ' + circle.circumference(), 50, 250);
}