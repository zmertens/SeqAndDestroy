(function() {
  "use strict";

  var game = new Phaser.Game(config.gameWidth, config.gameHeight, Phaser.WEBGL,
    'SeqAndDestroy');

  game.state.add('preloadState', preloadState);
  game.state.add('homeState', homeState);
  game.state.add('playState', playState);
  game.state.start('preloadState');
})();
