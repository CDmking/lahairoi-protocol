    var scaleFactor = 1;
    if (window.innerHeight < 700 || window.innerWidth < 900) {
        var scaleH = window.innerHeight / 700;
        var scaleW = window.innerWidth / 900;
        scaleFactor = Math.min(scaleH, scaleW);
        if (scaleFactor > 1) scaleFactor = 1;
    }

    var CONFIG = {
        BOARD_SIZE: 8,
        CELL_SIZE: Math.floor(54 * scaleFactor),
        GAP: Math.floor(2 * scaleFactor) || 1,
        SCORE_BLOCK: 10,
        SCORE_LINE: 100,
        SCORE_MULTI_MULTIPLIER: 50,
        ATTR_SCORE_BONUS: 5
    };

    var TRAY_CELL_RATIO = 0.65;
    var TRAY_CELL_SIZE = Math.floor(CONFIG.CELL_SIZE * TRAY_CELL_RATIO);

    document.documentElement.style.setProperty('--cell-size', CONFIG.CELL_SIZE + 'px');
    document.documentElement.style.setProperty('--grid-gap', CONFIG.GAP + 'px');

    var ATTRIBUTES = [
        { id: 'glacio', icon: '<img src="img/attribute/Glacio.svg" class="attr-icon">' },
        { id: 'fusion', icon: '<img src="img/attribute/Fusion.svg" class="attr-icon">' },
        { id: 'electro', icon: '<img src="img/attribute/Electro.svg" class="attr-icon">' },
        { id: 'aero', icon: '<img src="img/attribute/Aero.svg" class="attr-icon">' },
        { id: 'spectro', icon: '<img src="img/attribute/Spectro.svg" class="attr-icon">' },
        { id: 'havoc', icon: '<img src="img/attribute/Havoc.svg" class="attr-icon">' }
    ];

    var SHAPES_EASY = [
        [[1]],
        [[1, 1]], [[1], [1]],
        [[1, 1, 1]], [[1], [1], [1]],
        [[1, 1], [1, 1]],
        [[1, 1, 1, 1]], [[1], [1], [1], [1]],
        [[1, 1], [1, 0]], [[1, 1], [0, 1]], [[0, 1], [1, 1]], [[1, 0], [1, 1]]
    ];

    var SHAPES_ALL = [
        [[1]],
        [[1, 1]], [[1], [1]],
        [[1, 1, 1]], [[1], [1], [1]],
        [[1, 1, 1, 1]], [[1], [1], [1], [1]],
        [[1, 1], [1, 1]],
        [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
        [[1, 1], [1, 0]], [[1, 1], [0, 1]], [[0, 1], [1, 1]], [[1, 0], [1, 1]],
        [[1, 1, 1], [1, 0, 0], [1, 0, 0]], [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
        [[1, 0, 0], [1, 0, 0], [1, 1, 1]], [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 1, 1], [0, 1, 0]],
        [[1, 0], [1, 1], [1, 0]],
        [[0, 1], [1, 1], [0, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 0], [1, 1], [0, 1]],
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1], [1, 1], [1, 0]]
    ];

    var SHAPES_HARD = [
        [[1, 1, 1, 1]], [[1], [1], [1], [1]],
        [[1, 1], [1, 0]], [[1, 1], [0, 1]], [[0, 1], [1, 1]], [[1, 0], [1, 1]],
        [[1, 1, 1], [1, 0, 0], [1, 0, 0]], [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
        [[1, 0, 0], [1, 0, 0], [1, 1, 1]], [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 1, 1], [0, 1, 0]],
        [[1, 0], [1, 1], [1, 0]],
        [[0, 1], [1, 1], [0, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 0], [1, 1], [0, 1]],
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1], [1, 1], [1, 0]],
        [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
    ];

    var DEFAULT_ATTR_SCORES = { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 };

    var DIFFICULTY_CONFIG = {
        easy:   { scoreMultiplier: 0.7 },
        normal: { scoreMultiplier: 1.0 },
        hard:   { scoreMultiplier: 1.5 }
    };
