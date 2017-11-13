var preloadState = (function() {

  function preload() {
    this.game.load.image('adenine', 'assets/adenine.png');
    this.game.load.image('cytosine', 'assets/cytosine.png');
    this.game.load.image('guanine', 'assets/guanine.png');
    this.game.load.image('uracil', 'assets/uracil.png');
    this.game.load.shader('bacteria', 'assets/bacteria.frag');
  }

  function create() {
    this.state.start('homeState');
  }

  return {
    preload: preload,
    create: create
  };

})();
