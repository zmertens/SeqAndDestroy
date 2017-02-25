var playState = (function() {

  var columnsCount = 20;

  var spriteWidth = config.gameWidth / columnsCount;
  var spriteHeight = 1.5 * spriteWidth;

  //var rowsCount = Math.floor((config.gameHeight / spriteHeight) / 2);
  var rowsCount = 1;

  var nucFac;

  var rt = null;

  var rowMan = null;

  var nrtiMan = null;

  var bacteriaFilter;
  var bacteriaSprite;

  var active = true;

  function create() {
    this.stage.backgroundColor = "#333333";
    this.physics.startSystem(Phaser.Physics.ARCADE);

    bacteriaFilter = new Phaser.Filter(this, null, config.bacteriaShaderStr);
    bacteriaFilter.setResolution(config.gameWidth, config.gameHeight);
    bacteriaSprite = this.add.sprite();
    bacteriaSprite.width = config.gameWidth;
    bacteriaSprite.height = config.gameHeight;
    bacteriaSprite.filters = [bacteriaFilter];
    bacteriaSprite.inputEnabled = true;
    bacteriaSprite.events.onInputDown.add(stageClicked, this);

    var factoryOptions = {
      game: this.game,
      spriteWidth: spriteWidth,
      spriteHeight: spriteHeight
    };
    nucFac = nucleobases.createNucleobaseFactory(factoryOptions);

    var rowManOptions = {
      game: this.game,
      columnsCount: columnsCount,
      rowsCount: rowsCount,
      columnWidth: spriteWidth,
      rowHeight: spriteHeight,
      elementConstructor: nucFac.createRandomNucleobase.bind(nucFac),
      gameWinCallback: gameWinCallback
    };
    rowMan = rowManager.createRowManager(rowManOptions);

    var nrtiOptions = {
      game: this.game,
      nucFac: nucFac,
      gameWidth: config.gameWidth,
      gameHeight: config.gameHeight,
      columnWidth: spriteWidth,
      rowHeight: spriteHeight 
    };
    nrtiMan = nrtiManager.createNRTIManager(nrtiOptions);

    var rtOptions = {
      game: this.game,
      nucFac: nucFac,
      rowManager: rowMan,
      nrtiManager: nrtiMan,
      blockedCallback: rtBlockedCallback
    };

    rt = reverseTranscriptase.createReverseTranscriptase(rtOptions);
    rt.activate();

    nrtiMan.createNRTI();

    this.game.time.events.loop(Phaser.Timer.SECOND * 5, addRow);
  }

  function update() {
    bacteriaFilter.update();
    
    this.game.physics.arcade.overlap(nrtiMan.getNRTI(), rowMan.getActiveRow(),
      gridOverlapHandler, null, this);
    this.game.physics.arcade.overlap(nrtiMan.getNRTI(),
      rt.getComplementStrand(), dnaOverlapHandler, null, this);

    if (!nrtiMan.getMatched()) {
      checkMatches();
    }
  }

  function gridOverlapHandler(nucleotide, rna) {
    nrtiMan.gridOverlapHandler();
  }

  function dnaOverlapHandler(dna, nrti) {
    nrtiMan.resetNRTI();
  }

  function matchedBase(obj1, obj2) {
    return nucleobases.rnaComplement(obj1.data.nucleobaseType) ===
      obj2.data.nucleobaseType;
  }

  function checkMatches() {
    if (nrtiMan.getNRTI().data.overlapping) {

      var nearestRNA;
      var column;
      for (column = 0; column < rowMan.getActiveRow().length; column++) {
        var rowRNA = rowMan.getActiveRow().getAt(column);

        if (floatCloseEnough(rowRNA.x, nrtiMan.getNRTI().x)) {
          nearestRNA = rowRNA;
          break;
        }
      }

      if (matchedBase(nrtiMan.getNRTI(), nearestRNA)) {
        nrtiMan.setMatched(true);
        nearestRNA.data.matched = true;
      }
      else {
        nrtiMan.resetNRTI();
      }
    }
  }

  function rtBlockedCallback() {

    rowMan.nextRow();
    if (active) {
      nrtiMan.resetNRTI();
      nrtiMan.setMatched(false);
    }

  }

  function gameWinCallback(game) {
    active = false;
    var textOptions = {
      font: '45px Arial',
      align: 'center',
      fill: '#ff8300'
    }
    var text = game.add.text(game.world.centerX, game.world.centerY,
      "You Win! Tap to play again", textOptions);
    text.anchor.setTo(0.5);

    rt.deactivate();
    nrtiMan.destroyNRTI();

    bacteriaSprite.events.onInputDown.removeAll();
    bacteriaSprite.events.onInputDown.add(function() {
      game.state.start('playState');
    });
  }

  function addRow() {
    if (active) {
      rowMan.addRow();
      rt.shiftDown();

      if (nrtiMan.getMatched()) {
        nrtiMan.getNRTI().y += spriteHeight;
      }
    }
  }

  function stageClicked(sprite, pointer) {
    nrtiMan.moveNRTI(pointer.clientX, pointer.clientY);
  }

  function floatCloseEnough(a, b) {
    return Math.abs(a - b) < 0.0001;
  }

  return {
    create: create,
    update: update
  };
})();
