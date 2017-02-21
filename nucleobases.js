var nucleobases = (function() {

  var createNucleobaseFactory = function(options) {
    return new NucleobaseFactory(options);
  };

  var NucleobaseFactory = function(options) {
    if (options === undefined) throw "NucleobaseFactory: no options";
    if (options.game === undefined) throw "NucleobaseFactory: no game";
    if (options.spriteWidth === undefined) {
      throw "NucleobaseFactory: no spriteWidth";
    }
    if (options.spriteHeight === undefined) {
      throw "NucleobaseFactory: no spriteHeight";
    }

    this._game = options.game;
    this._spriteWidth = options.spriteWidth;
    this._spriteHeight = options.spriteHeight;
  };

  // from colorbrewer. red, blue, green, purple
  var colors = [0xe41a1c, 0x377eb8, 0x4daf4a, 0x984ea3];

  NucleobaseFactory.prototype.createAdenine = function(options) {
    options.color = colors[0];
    var adenine = this._createPurine(options);
    adenine.data.nucleobaseType = 'adenine';
    return adenine;
  };

  NucleobaseFactory.prototype.createCytosine = function(options) {
    options.color = colors[1];
    var cytosine = this._createPyrimidine(options);
    cytosine.data.nucleobaseType = 'cytosine';
    return cytosine;
  };

  NucleobaseFactory.prototype.createGuanine = function(options) {
    options.color = colors[2];
    var guanine = this._createPurine(options);
    guanine.data.nucleobaseType = 'guanine';
    return guanine;
  };

  NucleobaseFactory.prototype.createUracil = function(options) {
    options.color = colors[3];
    var uracil = this._createPyrimidine(options);
    uracil.data.nucleobaseType = 'uracil';
    return uracil;
  };

  NucleobaseFactory.prototype.createRandomNucleobase = function(options) {
    var index = Math.floor(Math.random() * 4);

    if (index === 0) {
      return this.createAdenine(options);
    }
    else if (index === 1) {
      return this.createCytosine(options);
    }
    else if (index === 2) {
      return this.createGuanine(options);
    }
    else if (index === 3) {
      return this.createUracil(options);
    }
    else {
      throw "Invalid index";
    }
  };

  NucleobaseFactory.prototype.createNucleobaseFromType = function(options) {
    if (options.type === undefined) throw "createNucleobaseFromType: no type";

    if (options.type === 'adenine') {
      return this.createAdenine(options);
    }
    else if (options.type === 'cytosine') {
      return this.createCytosine(options);
    }
    else if (options.type === 'guanine') {
      return this.createGuanine(options);
    }
    else if (options.type === 'uracil') {
      return this.createUracil(options);
    }
    else {
      throw "Invalid index";
    }
  };

  NucleobaseFactory.prototype.createPlaceholderNucleobase = function(options) {
    options.color = 0x999999;
    var placeholder = this._createPyrimidine(options);
    placeholder.data.nucleobaseType = 'placeholder';
    return placeholder;
  };

  NucleobaseFactory.prototype._createPurine = function(options) {
    if (options === undefined) throw "_createPurine: no options";
    if (options.x === undefined) throw "_createPurine: no x";
    if (options.y === undefined) throw "_createPurine: no y";
    if (options.color === undefined) throw "_createPurine: no color";

    var purine = this._game.add.sprite(options.x, options.y, 'square');
    purine.anchor.set(0.5);
    purine.width = this._spriteWidth;
    purine.height = this._spriteHeight;
    purine.tint = options.color;

    return purine;
  };

  NucleobaseFactory.prototype._createPyrimidine = function(options) {
    if (options === undefined) throw "_createPyrimidine: no options";
    if (options.x === undefined) throw "_createPyrimidine: no x";
    if (options.y === undefined) throw "_createPyrimidine: no y";
    if (options.color === undefined) throw "_createPyrimidine: no color";

    var pyrimidine = this._game.add.sprite(options.x, options.y, 'ball');
    pyrimidine.anchor.set(0.5);
    pyrimidine.width = this._spriteWidth;
    pyrimidine.height = this._spriteHeight;
    pyrimidine.tint = options.color;

    return pyrimidine;
  };

  return {
    createNucleobaseFactory: createNucleobaseFactory
  };

})();
