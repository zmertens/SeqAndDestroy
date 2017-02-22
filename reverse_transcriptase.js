var reverseTranscriptase = (function() {
  "use strict";

  var createReverseTranscriptase = function(options) {
    return new ReverseTranscriptase(options);
  };

  var ReverseTranscriptase = function(options) {
    if (options === undefined) throw "no options";
    if (options.game === undefined) throw "no game";
    if (options.nucFac === undefined) throw "no nucFac";
    if (options.rowManager === undefined) throw "no rowManger";
    if (options.nrtiManager === undefined) throw "no nrtiManager";

    this._game = options.game;
    this._nucFac = options.nucFac;
    this._rowMan = options.rowManager;
    this._nrtiMan = options.nrtiManager;
    this._col = 0;
    this._dnaComp = this._game.add.group();
    this._game.physics.enable(this._dnaComp, Phaser.Physics.ARCADE);
    this._blockedCallback = options.blockedCallback;
  };

  ReverseTranscriptase.prototype.activate = function() {
    this.addNextNucleotide();
  };

  ReverseTranscriptase.prototype.addNextNucleotide = function() {

    if (this._col !== this._rowMan.getActiveRow().length) {
      var rna = this._rowMan.getActiveRow().getAt(this._col); 
      if (rna.data.matched) {
        this._dnaComp.destroy();
        this._dnaComp = this._game.add.group();
        this._col = 0;

        this._blockedCallback();
      }
      else {
        var x = this._rowMan.computeXFromColumn(this._col);
        var y = rna.y + (this._rowMan.getRowHeight() / 2);
        var comp = nucleobases.rnaComplement(rna.data.nucleobaseType);

        var compOptions = {
          type: comp,
          x: x,
          y: y
        };
        var dna = this._nucFac.createNucleobaseFromType(compOptions);
        dna.enableBody = true;
        this._game.physics.enable(dna, Phaser.Physics.ARCADE);
        this._dnaComp.add(dna);

        this._col++;

      }
    }
    else {
      this._dnaComp.destroy();
      this._dnaComp = this._game.add.group();
      this._col = 0;

      this._blockedCallback();
    }

    this._game.time.events.add(Phaser.Timer.SECOND * 0.5,
      this.addNextNucleotide, this);
  };

  ReverseTranscriptase.prototype.getComplementStrand = function() {
    return this._dnaComp;
  };

  ReverseTranscriptase.prototype.shiftDown = function() {
    this.getComplementStrand().forEach(function(dna) {
      dna.y += this._rowMan.getRowHeight();
    }, this);
  };

  return {
    createReverseTranscriptase: createReverseTranscriptase
  };

})();
