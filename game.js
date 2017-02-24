(function() {
  "use strict";

  var bacteriaShaderStr = `
    /*
    shader from: http://phaser.io/examples/v2/filters/multiple-shaders
    */

    precision mediump float;

    uniform float     time;
    uniform vec2      resolution;
    uniform vec2      mouse;

    float length2(vec2 p) { return dot(p, p); }

    float noise(vec2 p){
        return fract(sin(fract(sin(p.x) * (43.13311)) + p.y) * 31.0011);
    }

    float worley(vec2 p) {
        float d = 1e30;
        for (int xo = -1; xo <= 1; ++xo) {
            for (int yo = -1; yo <= 1; ++yo) {
                vec2 tp = floor(p) + vec2(xo, yo);
                d = min(d, length2(p - tp - vec2(noise(tp))));
            }
        }
        return 3.0*exp(-4.0*abs(2.0*d - 1.0));
    }

    float fworley(vec2 p) {
        return sqrt(sqrt(sqrt(
        1.1 * // light
        worley(p*5. + .3 + time*.0525) *
        sqrt(worley(p * 50. + 0.3 + time * -0.15)) *
        sqrt(sqrt(worley(p * -10. + 9.3))))));
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float t = fworley(uv * resolution.xy / 1500.0);
        t *= exp(-length2(abs(0.7*uv - 1.0)));
        gl_FragColor = vec4(t * vec3(0.1, 1.5*t, 1.2*t + pow(t, 0.5-t)), 1.0);
    }
  `;

  var gameWidth = 800;
  var gameHeight = 600;

  var columnsCount = 20;

  var spriteWidth = gameWidth / columnsCount;
  var spriteHeight = 1.5 * spriteWidth;

  var rowsCount = Math.floor((gameHeight / spriteHeight) / 2);

  var nucFac;

  var rt = null;

  var rowMan = null;

  var nrtiMan = null;

  var bacteriaFilter;
  var bacteriaSprite;

  var game = new Phaser.Game(gameWidth, gameHeight, Phaser.WEBGL,
    'SeqAndDestroy', 
	  { preload: preload, create: create, update: update, render: render });

  function preload() {
    game.load.image('adenine', 'assets/adenine.png');
    game.load.image('cytosine', 'assets/cytosine.png');
    game.load.image('guanine', 'assets/guanine.png');
    game.load.image('uracil', 'assets/uracil.png');
    game.load.shader('bacteria', 'assets/bacteria.frag');
  }

  function create() {
    game.stage.backgroundColor = "#333333";
    game.physics.startSystem(Phaser.Physics.ARCADE);

    bacteriaFilter = new Phaser.Filter(game, null, bacteriaShaderStr);
    bacteriaFilter.setResolution(gameWidth, gameHeight);
    bacteriaSprite = game.add.sprite();
    bacteriaSprite.width = gameWidth;
    bacteriaSprite.height = gameHeight;
    bacteriaSprite.filters = [bacteriaFilter];
    bacteriaSprite.inputEnabled = true;
    bacteriaSprite.events.onInputDown.add(stageClicked, this);

    var factoryOptions = {
      game: game,
      spriteWidth: spriteWidth,
      spriteHeight: spriteHeight
    };
    nucFac = nucleobases.createNucleobaseFactory(factoryOptions);

    var rowManOptions = {
      game: game,
      columnsCount: columnsCount,
      rowsCount: rowsCount,
      columnWidth: spriteWidth,
      rowHeight: spriteHeight,
      elementConstructor: nucFac.createRandomNucleobase.bind(nucFac)
    };
    rowMan = rowManager.createRowManager(rowManOptions);

    var nrtiOptions = {
      game: game,
      nucFac: nucFac,
      gameWidth: gameWidth,
      gameHeight: gameHeight,
      columnWidth: spriteWidth,
      rowHeight: spriteHeight 
    };
    nrtiMan = nrtiManager.createNRTIManager(nrtiOptions);

    var rtOptions = {
      game: game,
      nucFac: nucFac,
      rowManager: rowMan,
      nrtiManager: nrtiMan,
      blockedCallback: rtBlockedCallback
    };

    rt = reverseTranscriptase.createReverseTranscriptase(rtOptions);
    rt.activate();

    nrtiMan.createNRTI();

    game.time.events.loop(Phaser.Timer.SECOND * 5, function() {
      addRow();
    });
  }

  function update() {
    bacteriaFilter.update();
    
    game.physics.arcade.overlap(nrtiMan.getNRTI(), rowMan.getActiveRow(),
      gridOverlapHandler, null, this);
    game.physics.arcade.overlap(nrtiMan.getNRTI(), rt.getComplementStrand(),
      dnaOverlapHandler, null, this);

    if (!nrtiMan.getMatched()) {
      checkMatches();
    }
  }

  function render() {
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
    nrtiMan.resetNRTI();
    rowMan.nextRow();
    nrtiMan.setMatched(false);
  }

  function addRow() {
    rowMan.addRow();
    rt.shiftDown();

    if (nrtiMan.getMatched()) {
      nrtiMan.getNRTI().y += spriteHeight;
    }
  }

  function stageClicked(sprite, pointer) {
    nrtiMan.moveNRTI(pointer.clientX, pointer.clientY);
  }

  function floatCloseEnough(a, b) {
    return Math.abs(a - b) < 0.0001;
  }

})();
