(function() {
  "use strict";

  var game = new Phaser.Game(config.gameWidth, config.gameHeight, Phaser.WEBGL,
    'SeqAndDestroy');

  game.state.add('preloadState', preloadState);
  game.state.add('homeState', homeState);
  game.state.add('playState', playState);
  game.state.start('preloadState');

  // Test DAWG functionality
  var low = 0;
  var high = 10000;
  console.log(Module.getRandomInt(low,high));
  console.log(Module.getRandomInt(low,high));
  console.log(Module.getRandomInt(low,high));
  console.log(Module.getRandomInt(low,high));
  console.log(Module.getRandomFloat(low,high));
  console.log(Module.getRandomFloat(low,high));
  console.log(Module.getRandomFloat(low,high));

  var dawgWrapper = new Module.DawgWrapper(4);
  console.log("getRandom(0, 10000)", dawgWrapper.getRandom(0, 10000));
  console.log("getRandom(0, 10000)", dawgWrapper.getRandom(0, 10000));
  console.log("getRandom(0, 10000)", dawgWrapper.getRandom(0, 10000));
  console.log("getRandom(0, 10000)", dawgWrapper.getRandom(0, 10000));
  dawgWrapper.delete();

})();
