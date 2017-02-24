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

  var rnaComplement = function(rna) {
    return compMap[rna];
  };

  // TODO: Pretty hacky
  var unflipLetter = function(options) {
    if (options === undefined) throw "no options";
    if (options.nucleobase === undefined) throw "no nucleobase";

    var letter = options.nucleobase.getChildAt(0);
    letter.scale.y *= -1;
    letter.y += letter.height/5;
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

    var letter = options.type[0].toUpperCase();
    var textStyle = {
      font: "24px Courier New",
      fill: "#000000",
      align: "center"
    };
    var textOverlay = this._game.add.text(0, -this._spriteHeight/10, letter,
      textStyle);
    textOverlay.anchor.set(0.5);

    nuc.addChild(textOverlay);

    return nuc;
  };

  return {
    createNucleobaseFactory: createNucleobaseFactory,
    rnaComplement: rnaComplement,
    unflipLetter: unflipLetter
  };

})();
