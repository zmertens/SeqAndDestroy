var nrtiManager = (function() {
  "use strict";

  var createNRTIManager = function(options) {
    return new NRTIManager(options);
  };

  var NRTIManager = function(options) {
    if (options === undefined) throw "no options";
    if (options.game === undefined) throw "no game";
    if (options.nucFac === undefined) throw "no nucFac";
    if (options.gameWidth === undefined) throw "no gameWidth";
    if (options.gameHeight === undefined) throw "no gameHeight";
    if (options.columnWidth === undefined) throw "no columnWidth";
    if (options.rowHeight === undefined) throw "no rowHeight";

    this._game = options.game;
    this._nucFac = options.nucFac;
    this._snapped = false;
    this._nrtiMoving = false;
    this._fireRate = 100;
    this._nextFire = this._game.time.now + this._fireRate;
    this._columnWidth = options.columnWidth;
    this._rowHeight = options.rowHeight;
    this._matched = false;

    var halfwayAcrossScreen = options.gameWidth/2;
    this._nrtiPos = {
      x: halfwayAcrossScreen,
      y: options.gameHeight - options.rowHeight/2 };
  };

  NRTIManager.prototype.createNRTI = function() {

    if (!this._nrti) {
      // use adenine the first time
      this._nrti = this._nucFac.createAdenine(this._nrtiPos);
    }
    else {
      // reuse whatever the player had last fired
      var options = {
        x: this._nrtiPos.x,
        y: this._nrtiPos.y,
        type: this._nrti.data.nucleobaseType
      };
      this._nrti = this._nucFac.createNucleobaseFromType(options);
    }
    this._setCommonSettings(this._nrti);
  }

  NRTIManager.prototype.getNRTI = function() {
    return this._nrti;
  };
  
  NRTIManager.prototype.resetNRTI = function() {
    this.stopMovingNRTI();
    this._nrti.kill();
    this.createNRTI();
  };

  NRTIManager.prototype.moveNRTI = function(x, y) {
    if (!this._nrtiMoving) {
      this._game.physics.arcade.moveToXY(this._nrti, x, y, 1000);
      this._nrtiMoving = true;
    }
  };

  NRTIManager.prototype.stopMovingNRTI = function() {
    this._nrti.body.velocity.x = 0;
    this._nrti.body.velocity.y = 0;
    this._nrtiMoving = false;
  }

  NRTIManager.prototype.gridOverlapHandler = function() {
    this._nrti.data.overlapping = true;
    this._snapToGrid();
  };

  NRTIManager.prototype.getMatched = function() {
    return this._matched;
  };

  NRTIManager.prototype.setMatched = function(matched) {
    this._matched = matched;
  };


  // Cycles through the available rna
  NRTIManager.prototype._nrtiOnDown = function(sprite) {
    if (!this._nrtiMoving && !this._matched) {
      this._nextFire = this._game.time.now + this._fireRate;

      // Once you've switched away from the placeholder, there's no way to get
      // back to it.
      if (sprite.data.nucleobaseType === 'placeholder' ||
          sprite.data.nucleobaseType === 'uracil') {
        this._replaceNRTI(sprite,
          this._nucFac.createAdenine.bind(this._nucFac));
      }
      else if (sprite.data.nucleobaseType === 'adenine') {
        this._replaceNRTI(sprite,
          this._nucFac.createCytosine.bind(this._nucFac));
      }
      else if (sprite.data.nucleobaseType === 'cytosine') {
        this._replaceNRTI(sprite,
          this._nucFac.createGuanine.bind(this._nucFac));
      }
      else if (sprite.data.nucleobaseType === 'guanine') {
        this._replaceNRTI(sprite,
          this._nucFac.createUracil.bind(this._nucFac));
      }
      else {
        throw "Invalid nucleobaseType";
      }
    }
  };

  NRTIManager.prototype._replaceNRTI = function(sprite, constructor) {
    sprite.destroy();
    var newNRTI = constructor({ x: sprite.x, y: sprite.y });
    this._setCommonSettings(newNRTI);

    this._nrti = newNRTI;
  };

  NRTIManager.prototype._setCommonSettings = function(nrti) {
    // flip vertically
    nrti.scale.y *= -1;

    nrti.enableBody = true;
    this._game.physics.enable(nrti, Phaser.Physics.ARCADE);
    nrti.inputEnabled = true;
    nrti.events.onInputDown.add(this._nrtiOnDown, this);
  };

  NRTIManager.prototype._snapToGrid = function() {

    this.stopMovingNRTI();

    var gridCorrection = this._computeGridCorrection(this.getNRTI());

    var x = gridCorrection.x - this._columnWidth/2;
    // TODO: .84 is a magic number reached by trial and error. Figure out the
    // proper way to calculate it.
    var y = gridCorrection.y - (.84)*this._rowHeight;// + this._rowHeight;

    this.getNRTI().body.reset(x, y);

    this.getNRTI().x = x;
    this.getNRTI().y = y;
  };

  NRTIManager.prototype._computeGridCorrection = function(nucleotide) {
    var xCorrectionPixels = this._computeAxisCorrection(nucleotide.x,
      this._columnWidth);
    var yCorrectionPixels = this._computeAxisCorrection(nucleotide.y,
      this._rowHeight);

    return { x: xCorrectionPixels, y: yCorrectionPixels };
  };

  NRTIManager.prototype._computeAxisCorrection = function(value,
                                                          divisionSize) {
    var globalOffset = divisionSize / 2;
    var axisRatio = (value + globalOffset) / divisionSize;
    var divisionsCount = Math.floor(axisRatio);
    var axisOffset = axisRatio - divisionsCount;

    var snapNegative = axisOffset < 0.5;

    var axisCorrection;
    if (snapNegative) {
      axisCorrection = divisionsCount;
    }
    else {
      axisCorrection = divisionsCount + 1;
    }

    var axisCorrectionPixels = divisionSize * axisCorrection;

    return axisCorrectionPixels;
  };

  return {
    createNRTIManager: createNRTIManager
  };

})();
