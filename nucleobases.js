var nucleobases = (function() {

  var nucleobaseTypes = [
    'adenine',
    'cytosine',
    'guanine',
    'uracil'
  ];

  // from colorbrewer 8-class Set 1. red, green, blue, yellow
  var colors = {
    'adenine': 0xe41a1c,
    'cytosine': 0x4daf4a,
    'guanine': 0x377eb8,
    'uracil': 0xffff33
  };

  var compMap = {
    'adenine': 'uracil',
    'cytosine': 'guanine',
    'guanine': 'cytosine',
    'uracil': 'adenine'
  };

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

  
  NucleobaseFactory.prototype.createAdenine = function(options) {
    options.type = 'adenine';
    return this.createNucleobaseWithType(options);
  };

  NucleobaseFactory.prototype.createCytosine = function(options) {
    options.type = 'cytosine';
    return this.createNucleobaseWithType(options);
  };

  NucleobaseFactory.prototype.createGuanine = function(options) {
    options.type = 'guanine';
    return this.createNucleobaseWithType(options);
  };

  NucleobaseFactory.prototype.createUracil = function(options) {
    options.type = 'uracil';
    return this.createNucleobaseWithType(options);
  };

  NucleobaseFactory.prototype.createRandomNucleobase = function(options) {
    var index = Math.floor(Math.random() * 4);

    options.type = nucleobaseTypes[index];
    return this.createNucleobaseWithType(options);
  };

  NucleobaseFactory.prototype.createNucleobaseWithType = function(options) {
    if (options.type === undefined) throw "createNucleobaseWithType: no type";

    return this._createNucleobase(options);
  };

  NucleobaseFactory.prototype._createNucleobase = function(options) {
    if (options === undefined) throw "_createNucleobase: no options";
    if (options.x === undefined) throw "_createNucleobase: no x";
    if (options.y === undefined) throw "_createNucleobase: no y";
    if (options.type === undefined) throw "_createNucleobase: no type";

    var nuc = this._game.add.sprite(options.x, options.y, options.type);
    nuc.anchor.set(0.5);
    nuc.width = this._spriteWidth;
    nuc.height = this._spriteHeight;
    nuc.tint = colors[options.type];
    nuc.data.nucleobaseType = options.type;

    return nuc;
  };

  var rnaComplement = function(rna) {
    return compMap[rna];
  };

  return {
    createNucleobaseFactory: createNucleobaseFactory,
    rnaComplement: rnaComplement
  };

})();
