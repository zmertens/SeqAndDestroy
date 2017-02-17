var nucleotides = (function() {

  var createNucleotideFactory = function(options) {
    return new NucleotideFactory(options);
  };

  var Nucleotide = function(options) {
  };

  var NucleotideFactory = function(options) {
    if (options === undefined) throw "NucleotideFactory: no options";
    if (options.game === undefined) throw "NucleotideFactory: no game";

    this._game = options.game;
  };

  // from colorbrewer. red, blue, green, purple
  var colors = [0xe41a1c, 0x377eb8, 0x4daf4a, 0x984ea3];

  NucleotideFactory.prototype.createAdenine = function(options) {
    options.color = colors[0];
    return this._createPurine(options);
  };

  NucleotideFactory.prototype.createCytosine = function(options) {
    options.color = colors[1];
    return this._createPyrimidine(options);
  };

  NucleotideFactory.prototype.createGuanine = function(options) {
    options.color = colors[2];
    return this._createPurine(options);
  };

  NucleotideFactory.prototype.createThymine = function(options) {
    options.color = colors[3];
    return this._createPyrimidine(options);
  };

  NucleotideFactory.prototype.createRandomNucleotide = function(options) {
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
      return this.createThymine(options);
    }
    else {
      throw "Invalid index";
    }
  };

  NucleotideFactory.prototype._createPurine = function(options) {
    if (options === undefined) throw "_createPurine: no options";
    if (options.x === undefined) throw "_createPurine: no x";
    if (options.y === undefined) throw "_createPurine: no y";
    if (options.color === undefined) throw "_createPurine: no color";

    var purine = this._game.add.sprite(options.x, options.y, 'square');
    purine.anchor.set(0.5);
    purine.scale.setTo(0.3);
    purine.tint = options.color;

    return purine;
  };

  NucleotideFactory.prototype._createPyrimidine = function(options) {
    if (options === undefined) throw "_createPyrimidine: no options";
    if (options.x === undefined) throw "_createPyrimidine: no x";
    if (options.y === undefined) throw "_createPyrimidine: no y";
    if (options.color === undefined) throw "_createPyrimidine: no color";

    var pyrimidine = this._game.add.sprite(options.x, options.y, 'ball');
    pyrimidine.anchor.set(0.5);
    pyrimidine.scale.setTo(0.3);
    pyrimidine.tint = options.color;

    return pyrimidine;
  };

  return {
    createNucleotideFactory: createNucleotideFactory
  };

})();
