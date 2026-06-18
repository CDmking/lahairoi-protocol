window.WUWA = window.WUWA || {};
(function () {
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
        { id: 'glacio', name: '冷凝', icon: '<img src="img/attribute/Glacio.svg" class="attr-icon">' },
        { id: 'fusion', name: '热熔', icon: '<img src="img/attribute/Fusion.svg" class="attr-icon">' },
        { id: 'electro', name: '导电', icon: '<img src="img/attribute/Electro.svg" class="attr-icon">' },
        { id: 'aero', name: '气动', icon: '<img src="img/attribute/Aero.svg" class="attr-icon">' },
        { id: 'spectro', name: '衍射', icon: '<img src="img/attribute/Spectro.svg" class="attr-icon">' },
        { id: 'havoc', name: '湮灭', icon: '<img src="img/attribute/Havoc.svg" class="attr-icon">' }
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

    var DIFFICULTY_CONFIG = {
        easy: { shapes: SHAPES_EASY, scoreMultiplier: 0.7, label: 'SIMPLE' },
        normal: { shapes: SHAPES_ALL, scoreMultiplier: 1.0, label: 'STANDARD' },
        hard: { shapes: SHAPES_HARD, scoreMultiplier: 1.5, label: 'CHALLENGE' }
    };

    var state = {
        board: [],
        score: 0,
        highScore: 0,
        difficulty: 'easy',
        isDemoMode: false,
        attrScores: { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 },
        availableShapes: [null, null, null],
        isGameOver: false
    };

    var leaderboardData = {
        records: [],
        attrHighScores: { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 }
    };

    var boardEl, traySlots, currentScoreEl, highScoreEl, gameOverOverlay, restartBtn;
    var leaderboardListEl, exportBtn, importBtn, toastBox, importModal, importDataInput;
    var cancelImportBtn, confirmImportBtn, clearBtn, clearModal, cancelClearBtn, confirmClearBtn;
    var attrScoreEls;
    var helpBtn;
    var draggedElement = null;
    var draggedShapeData = null;
    var draggedSlotIndex = -1;
    var dragOffsetX = 0;
    var dragOffsetY = 0;

    function showToast(message) {
        toastBox.innerText = message;
        toastBox.classList.add('show');
        setTimeout(function () {
            toastBox.classList.remove('show');
        }, 2500);
    }

    function loadLeaderboard() {
        try {
            var stored = localStorage.getItem('lahairo_v3_leaderboard');
            if (stored) {
                var parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    leaderboardData = {
                        records: parsed,
                        attrHighScores: { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 }
                    };
                } else {
                    leaderboardData = parsed;
                    if (!leaderboardData.attrHighScores) {
                        leaderboardData.attrHighScores = { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 };
                    }
                }
            } else {
                leaderboardData = {
                    records: [],
                    attrHighScores: { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 }
                };
            }
        } catch (e) {
            leaderboardData = {
                records: [],
                attrHighScores: { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 }
            };
        }
        state.highScore = leaderboardData.records.length > 0 ? leaderboardData.records[0].score : 0;
        highScoreEl.innerText = state.highScore;
    }

    function saveLeaderboard() {
        localStorage.setItem('lahairo_v3_leaderboard', JSON.stringify(leaderboardData));
        state.highScore = leaderboardData.records.length > 0 ? leaderboardData.records[0].score : 0;
        highScoreEl.innerText = state.highScore;
        renderLeaderboard();
    }

    function renderLeaderboard() {
        leaderboardListEl.innerHTML = '';
        if (leaderboardData.records.length === 0) {
            var emptyLi = document.createElement('li');
            emptyLi.className = 'leaderboard-item';
            emptyLi.style.justifyContent = 'center';
            emptyLi.innerHTML = '<span style="color: #666;">NO DATA</span>';
            leaderboardListEl.appendChild(emptyLi);
            return;
        }
        leaderboardData.records.slice(0, 10).forEach(function (record, index) {
            var li = document.createElement('li');
            li.className = 'leaderboard-item';
            li.innerHTML = '<span class="rank-score">#' + (index + 1) + ' &nbsp; ' + record.score + '</span><span class="date">' + record.date + '</span>';
            leaderboardListEl.appendChild(li);
        });
    }

    function addScoreToLeaderboard(finalScore) {
        if (finalScore <= 0) return;
        var today = new Date();
        var dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        leaderboardData.records.push({ score: finalScore, date: dateStr });
        leaderboardData.records.sort(function (a, b) { return b.score - a.score; });
        if (leaderboardData.records.length > 10) {
            leaderboardData.records = leaderboardData.records.slice(0, 10);
        }
        saveLeaderboard();
    }

    function init() {
        if (state.isDemoMode) {
            state.isDemoMode = false;
            var overlay = document.getElementById('demoOverlay');
            if (overlay) overlay.classList.remove('show');
        }
        loadLeaderboard();
        renderLeaderboard();

        state.board = Array.from({ length: CONFIG.BOARD_SIZE }, function () {
            return Array(CONFIG.BOARD_SIZE).fill(null);
        });
        state.score = 0;
        state.isGameOver = false;
        Object.keys(state.attrScores).forEach(function (k) { state.attrScores[k] = 0; });

        updateScoreDisplay();
        updateAttrScoreDisplay();
        highScoreEl.innerText = state.highScore;
        gameOverOverlay.style.display = 'none';

        boardEl.innerHTML = '';
        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                var cell = document.createElement('div');
                cell.className = 'cell';
                boardEl.appendChild(cell);
            }
        }

        fillTray(true);
    }

    function fillTray(force) {
        if (force === undefined) force = false;
        var isEmpty = state.availableShapes.every(function (s) { return s === null; });
        if (!isEmpty && !force) return;

        var pool = DIFFICULTY_CONFIG[state.difficulty].shapes;
        for (var i = 0; i < 3; i++) {
            var randomMatrix = pool[Math.floor(Math.random() * pool.length)];
            var randomAttr = ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)];
            var shapeData = { matrix: randomMatrix, attribute: randomAttr };
            state.availableShapes[i] = shapeData;
            renderShapeInSlot(shapeData, i);
        }
        checkGameOver();
    }

    function renderShapeInSlot(shapeData, slotIndex) {
        var slotEl = traySlots[slotIndex];
        slotEl.innerHTML = '';
        if (!shapeData) return;

        var shapeEl = document.createElement('div');
        shapeEl.className = 'shape-element';
        var matrix = shapeData.matrix;
        var attr = shapeData.attribute;
        var rows = matrix.length;
        var cols = matrix[0].length;

        shapeEl.style.gridTemplateColumns = 'repeat(' + cols + ', ' + TRAY_CELL_SIZE + 'px)';
        shapeEl.style.gridTemplateRows = 'repeat(' + rows + ', ' + TRAY_CELL_SIZE + 'px)';
        shapeEl.style.setProperty('--cell-size', TRAY_CELL_SIZE + 'px');
        shapeEl.dataset.slotIndex = slotIndex;
        shapeEl.shapeData = shapeData;

        for (var sy = 0; sy < rows; sy++) {
            for (var sx = 0; sx < cols; sx++) {
                var block = document.createElement('div');
                if (matrix[sy][sx] === 1) {
                    block.className = 'shape-cell attr-' + attr.id + '-bg';
                    block.innerHTML = attr.icon;
                    block.style.boxShadow = 'inset 0 0 5px rgba(255,255,255,0.8), 0 0 10px var(--attr-' + attr.id + ')';
                } else {
                    block.className = 'shape-cell empty';
                }
                shapeEl.appendChild(block);
            }
        }

        shapeEl.style.left = 'calc(50% - ' + (cols * TRAY_CELL_SIZE + (cols - 1) * CONFIG.GAP) / 2 + 'px)';
        shapeEl.style.top = 'calc(50% - ' + (rows * TRAY_CELL_SIZE + (rows - 1) * CONFIG.GAP) / 2 + 'px)';

        shapeEl.addEventListener('mousedown', onDragStart);
        shapeEl.addEventListener('touchstart', onDragStart, { passive: false });

        slotEl.appendChild(shapeEl);
    }

    function onDragStart(e) {
        if (state.isGameOver || state.isDemoMode) return;
        e.preventDefault();

        draggedElement = e.currentTarget;
        draggedShapeData = draggedElement.shapeData;
        draggedSlotIndex = parseInt(draggedElement.dataset.slotIndex);

        var matrix = draggedShapeData.matrix;
        var rows = matrix.length;
        var cols = matrix[0].length;
        draggedElement.style.gridTemplateColumns = 'repeat(' + cols + ', ' + CONFIG.CELL_SIZE + 'px)';
        draggedElement.style.gridTemplateRows = 'repeat(' + rows + ', ' + CONFIG.CELL_SIZE + 'px)';
        draggedElement.style.setProperty('--cell-size', CONFIG.CELL_SIZE + 'px');
        draggedElement.style.left = '';
        draggedElement.style.top = '';

        var isTouch = e.type.indexOf('touch') !== -1;
        var clientX = isTouch ? e.touches[0].clientX : e.clientX;
        var clientY = isTouch ? e.touches[0].clientY : e.clientY;

        var rect = draggedElement.getBoundingClientRect();

        if (isTouch) {
            dragOffsetX = rect.width / 2;
            dragOffsetY = rect.height + (40 * scaleFactor);
        } else {
            dragOffsetX = clientX - rect.left;
            dragOffsetY = clientY - rect.top;
        }

        draggedElement.classList.add('dragging');
        document.body.appendChild(draggedElement);
        moveElement(clientX, clientY);

        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
    }

    function onDragMove(e) {
        if (!draggedElement) return;
        e.preventDefault();
        var clientX = e.type.indexOf('mouse') !== -1 ? e.clientX : e.touches[0].clientX;
        var clientY = e.type.indexOf('mouse') !== -1 ? e.clientY : e.touches[0].clientY;
        moveElement(clientX, clientY);
        highlightBoard(clientX, clientY);
    }

    function moveElement(clientX, clientY) {
        draggedElement.style.left = (clientX - dragOffsetX) + 'px';
        draggedElement.style.top = (clientY - dragOffsetY) + 'px';
    }

    function onDragEnd(e) {
        if (!draggedElement) return;

        var clientX = e.type.indexOf('mouse') !== -1 ? e.clientX : e.changedTouches[0].clientX;
        var clientY = e.type.indexOf('mouse') !== -1 ? e.clientY : e.changedTouches[0].clientY;

        var boardPos = getBoardCoordinates(clientX, clientY);
        clearBoardHighlight();

        if (boardPos && canPlaceShape(draggedShapeData.matrix, boardPos.x, boardPos.y)) {
            placeShape(draggedShapeData, boardPos.x, boardPos.y);
            state.availableShapes[draggedSlotIndex] = null;
            draggedElement.remove();

            checkLines();
            fillTray();
            if (!state.isGameOver) checkGameOver();

        } else {
            var matrix = draggedShapeData.matrix;
            var rows = matrix.length;
            var cols = matrix[0].length;
            draggedElement.style.gridTemplateColumns = 'repeat(' + cols + ', ' + TRAY_CELL_SIZE + 'px)';
            draggedElement.style.gridTemplateRows = 'repeat(' + rows + ', ' + TRAY_CELL_SIZE + 'px)';
            draggedElement.style.setProperty('--cell-size', TRAY_CELL_SIZE + 'px');
            draggedElement.style.left = 'calc(50% - ' + (cols * TRAY_CELL_SIZE + (cols - 1) * CONFIG.GAP) / 2 + 'px)';
            draggedElement.style.top = 'calc(50% - ' + (rows * TRAY_CELL_SIZE + (rows - 1) * CONFIG.GAP) / 2 + 'px)';
            draggedElement.classList.remove('dragging');
            traySlots[draggedSlotIndex].appendChild(draggedElement);
        }

        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);

        draggedElement = null;
        draggedShapeData = null;
        draggedSlotIndex = -1;
    }

    function getBoardCoordinates(clientX, clientY) {
        var boardRect = boardEl.getBoundingClientRect();
        var shapeLeft = clientX - dragOffsetX;
        var shapeTop = clientY - dragOffsetY;
        var threshold = CONFIG.CELL_SIZE / 2;

        if (shapeLeft > boardRect.left - threshold &&
            shapeLeft < boardRect.right + threshold &&
            shapeTop > boardRect.top - threshold &&
            shapeTop < boardRect.bottom + threshold) {

            var relativeX = shapeLeft - boardRect.left;
            var relativeY = shapeTop - boardRect.top;
            var step = CONFIG.CELL_SIZE + CONFIG.GAP;
            return { x: Math.round(relativeX / step), y: Math.round(relativeY / step) };
        }
        return null;
    }

    function canPlaceShape(matrix, startX, startY) {
        for (var cy = 0; cy < matrix.length; cy++) {
            for (var cx = 0; cx < matrix[0].length; cx++) {
                if (matrix[cy][cx] === 1) {
                    var bX = startX + cx;
                    var bY = startY + cy;
                    if (bX < 0 || bX >= CONFIG.BOARD_SIZE || bY < 0 || bY >= CONFIG.BOARD_SIZE) return false;
                    if (state.board[bY][bX] !== null) return false;
                }
            }
        }
        return true;
    }

    function placeShape(shapeData, startX, startY) {
        var matrix = shapeData.matrix;
        var attr = shapeData.attribute;
        var blocksPlaced = 0;

        for (var py = 0; py < matrix.length; py++) {
            for (var px = 0; px < matrix[0].length; px++) {
                if (matrix[py][px] === 1) {
                    var bX = startX + px;
                    var bY = startY + py;
                    state.board[bY][bX] = { attrId: attr.id, icon: attr.icon };
                    blocksPlaced++;

                    var cellIndex = bY * CONFIG.BOARD_SIZE + bX;
                    var cellEl = boardEl.children[cellIndex];
                    cellEl.className = 'cell filled attr-' + attr.id;
                    cellEl.innerHTML = attr.icon;
                }
            }
        }
        addScore(blocksPlaced * CONFIG.SCORE_BLOCK);
    }

    function highlightBoard(clientX, clientY) {
        clearBoardHighlight();
        if (!draggedShapeData) return;

        var boardPos = getBoardCoordinates(clientX, clientY);
        if (!boardPos) return;

        var matrix = draggedShapeData.matrix;
        var isValid = canPlaceShape(matrix, boardPos.x, boardPos.y);
        var classToAdd = isValid ? 'hover' : 'invalid';

        for (var hy = 0; hy < matrix.length; hy++) {
            for (var hx = 0; hx < matrix[0].length; hx++) {
                if (matrix[hy][hx] === 1) {
                    var bX = boardPos.x + hx;
                    var bY = boardPos.y + hy;
                    if (bX >= 0 && bX < CONFIG.BOARD_SIZE && bY >= 0 && bY < CONFIG.BOARD_SIZE) {
                        boardEl.children[bY * CONFIG.BOARD_SIZE + bX].classList.add(classToAdd);
                    }
                }
            }
        }
    }

    function clearBoardHighlight() {
        Array.from(boardEl.children).forEach(function (cell) { cell.classList.remove('hover', 'invalid'); });
    }

    function checkLines() {
        var cellsToClear = [];

        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            var rowData = [];
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                if (state.board[y][x] !== null) rowData.push({ x: x, y: y, attrId: state.board[y][x].attrId });
            }
            if (rowData.length === CONFIG.BOARD_SIZE) {
                cellsToClear.push.apply(cellsToClear, rowData);
            }
        }

        for (var cx = 0; cx < CONFIG.BOARD_SIZE; cx++) {
            var colData = [];
            for (var cy = 0; cy < CONFIG.BOARD_SIZE; cy++) {
                if (state.board[cy][cx] !== null) colData.push({ x: cx, y: cy, attrId: state.board[cy][cx].attrId });
            }
            if (colData.length === CONFIG.BOARD_SIZE) {
                colData.forEach(function (cell) {
                    if (!cellsToClear.some(function (c) { return c.x === cell.x && c.y === cell.y; })) {
                        cellsToClear.push(cell);
                    }
                });
            }
        }

        if (cellsToClear.length > 0) {
            var linesCleared = cellsToClear.length / CONFIG.BOARD_SIZE;
            var clearScore = CONFIG.SCORE_LINE * linesCleared;
            if (linesCleared > 1) clearScore += (linesCleared - 1) * CONFIG.SCORE_MULTI_MULTIPLIER;

            cellsToClear.forEach(function (cell) {
                state.board[cell.y][cell.x] = null;
                if (!state.isDemoMode) state.attrScores[cell.attrId] += 1;

                var cellEl = boardEl.children[cell.y * CONFIG.BOARD_SIZE + cell.x];
                cellEl.className = 'cell clearing';
                cellEl.innerHTML = '';

                setTimeout(function () {
                    cellEl.className = 'cell';
                }, 300);
            });

            if (!state.isDemoMode) {
                var isHighScoreUpdated = false;
                Object.keys(state.attrScores).forEach(function (attr) {
                    if (state.attrScores[attr] > leaderboardData.attrHighScores[attr]) {
                        leaderboardData.attrHighScores[attr] = state.attrScores[attr];
                        isHighScoreUpdated = true;
                    }
                });

                if (isHighScoreUpdated) {
                    saveLeaderboard();
                }

                addScore(Math.floor(clearScore));
                updateAttrScoreDisplay();
            }
        }
    }

    function checkGameOver() {
        var hasValidMove = false;
        for (var si = 0; si < state.availableShapes.length; si++) {
            var shapeData = state.availableShapes[si];
            if (!shapeData) continue;
            for (var gy = 0; gy < CONFIG.BOARD_SIZE; gy++) {
                for (var gx = 0; gx < CONFIG.BOARD_SIZE; gx++) {
                    if (canPlaceShape(shapeData.matrix, gx, gy)) {
                        hasValidMove = true;
                        break;
                    }
                }
                if (hasValidMove) break;
            }
            if (hasValidMove) break;
        }

        if (!hasValidMove) {
            state.isGameOver = true;
            gameOverOverlay.style.display = 'flex';
            if (state.score > 0 && !state.isDemoMode) {
                addScoreToLeaderboard(state.score);
            }
        }
    }

    function addScore(points) {
        state.score += Math.floor(points * DIFFICULTY_CONFIG[state.difficulty].scoreMultiplier);
        updateScoreDisplay();
    }

    function updateScoreDisplay() {
        currentScoreEl.innerText = state.score;
    }

    function updateAttrScoreDisplay() {
        Object.keys(attrScoreEls).forEach(function (key) {
            var current = state.attrScores[key];
            var highest = leaderboardData.attrHighScores[key];
            attrScoreEls[key].innerText = current + ' (' + highest + ')';
        });
    }

    var DEMO_SCENES = [
        { name:'单行消除',
          fills:[[7,0],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7]],
          shapeMatrix:[[1]], target:[7,1],
          desc:'填满任意整行即可触发消除' },
        { name:'多行连消',
          fills:[[4,0],[4,1],[4,2],[4,4],[4,5],[4,6],[4,7],
                 [5,0],[5,1],[5,2],[5,4],[5,5],[5,6],[5,7]],
          shapeMatrix:[[1],[1]], target:[4,3],
          desc:'同时消除多行获得额外连消加分' },
        { name:'交叉消除·角',
          fills:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
                 [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7]],
          shapeMatrix:[[1]], target:[0,7],
          desc:'角落交叉点填满可同时消除行与列' },
        { name:'交叉消除·内',
          fills:[[3,0],[3,1],[3,2],[3,3],[3,5],[3,6],[3,7],
                 [0,4],[1,4],[2,4],[4,4],[5,4],[6,4],[7,4]],
          shapeMatrix:[[1]], target:[3,4],
          desc:'内部交叉点填满可同时消除行与列' },
        { name:'游戏结束', fills:null, except:[[0,0],[1,3],[2,6],[3,1],[4,4],[5,7],[6,2],[7,5]],
          shapeMatrix:[[1,1,1],[1,1,1],[1,1,1]], target:[0,0],
          desc:'空缺位置分散，无合适空间容纳更大方块' }
    ];

    var currentScene = 0;
    var sceneVersion = 0;
    var autoPlayTimer = null;

    function animateShapeToBoard(shapeData, slotIndex, targetX, targetY, callback) {
        var matrix = shapeData.matrix;
        var rows = matrix.length;
        var cols = matrix[0].length;
        var cellSize = CONFIG.CELL_SIZE;
        var gap = CONFIG.GAP;

        var ghost = document.createElement('div');
        ghost.className = 'demo-ghost';
        ghost.style.position = 'fixed';
        ghost.style.zIndex = '9999';
        ghost.style.pointerEvents = 'none';
        ghost.style.display = 'grid';
        ghost.style.gridTemplateColumns = 'repeat(' + cols + ',' + cellSize + 'px)';
        ghost.style.gridTemplateRows = 'repeat(' + rows + ',' + cellSize + 'px)';
        ghost.style.gap = gap + 'px';
        ghost.style.transition = 'all 0.28s cubic-bezier(.2,.9,.3,1)';

        for (var gy = 0; gy < rows; gy++) {
            for (var gx = 0; gx < cols; gx++) {
                var block = document.createElement('div');
                if (matrix[gy][gx] === 1) {
                    block.style.width = cellSize + 'px';
                    block.style.height = cellSize + 'px';
                    block.style.borderRadius = '2px';
                    block.style.backgroundColor = 'var(--attr-' + shapeData.attribute.id + ')';
                    block.style.boxShadow = 'inset 0 0 5px rgba(255,255,255,0.8), 0 0 10px var(--attr-' + shapeData.attribute.id + ')';
                } else {
                    block.style.width = cellSize + 'px';
                    block.style.height = cellSize + 'px';
                    block.style.background = 'transparent';
                }
                ghost.appendChild(block);
            }
        }

        var slotRect = traySlots[slotIndex].getBoundingClientRect();
        var ghostW = cols * cellSize + (cols - 1) * gap;
        var ghostH = rows * cellSize + (rows - 1) * gap;
        var startX = slotRect.left + (slotRect.width - ghostW) / 2;
        var startY = slotRect.top + (slotRect.height - ghostH) / 2;

        var firstCellEl = boardEl.children[targetY * CONFIG.BOARD_SIZE + targetX];
        var cellRect = firstCellEl.getBoundingClientRect();

        ghost.style.left = startX + 'px';
        ghost.style.top = startY + 'px';
        document.body.appendChild(ghost);
        ghost.offsetHeight;

        ghost.style.left = cellRect.left + 'px';
        ghost.style.top = cellRect.top + 'px';
        ghost.style.transform = 'scale(0.85)';

        setTimeout(function () {
            ghost.remove();
            if (callback) callback();
        }, 340);
    }

    function clearTraySlot(index) {
        traySlots[index].innerHTML = '';
    }

    function fillBoardForScene(index) {
        var scene = DEMO_SCENES[index];
        for (var by = 0; by < CONFIG.BOARD_SIZE; by++) {
            for (var bx = 0; bx < CONFIG.BOARD_SIZE; bx++) {
                state.board[by][bx] = null;
                boardEl.children[by * CONFIG.BOARD_SIZE + bx].className = 'cell';
                boardEl.children[by * CONFIG.BOARD_SIZE + bx].innerHTML = '';
                boardEl.children[by * CONFIG.BOARD_SIZE + bx].style.opacity = '';
            }
        }

        var allAttrs = ['glacio','fusion','electro','aero','spectro','havoc'];
        var fillCells = scene.fills;
        if (fillCells === null) {
            fillCells = [];
            for (var fy = 0; fy < CONFIG.BOARD_SIZE; fy++) {
                for (var fx = 0; fx < CONFIG.BOARD_SIZE; fx++) {
                    var skip = false;
                    if (scene.except) {
                        for (var ek = 0; ek < scene.except.length; ek++) {
                            if (scene.except[ek][0] === fy && scene.except[ek][1] === fx) {
                                skip = true; break;
                            }
                        }
                    }
                    if (!skip) fillCells.push([fy, fx]);
                }
            }
        }
        for (var fi = 0; fi < fillCells.length; fi++) {
            var fy = fillCells[fi][0], fx = fillCells[fi][1];
            var aid = allAttrs[Math.floor(Math.random() * allAttrs.length)];
            state.board[fy][fx] = { attrId: aid, icon: '<img src="img/attribute/' + aid.charAt(0).toUpperCase() + aid.slice(1) + '.svg" class="attr-icon">' };
            var cel = boardEl.children[fy * CONFIG.BOARD_SIZE + fx];
            cel.className = 'cell filled attr-' + aid;
            cel.innerHTML = state.board[fy][fx].icon;
        }
    }

    function applyScene(index) {
        if (index < 0 || index >= DEMO_SCENES.length) return;
        gameOverOverlay.style.display = 'none';
        state.score = 0;
        updateScoreDisplay();
        updateAttrScoreDisplay();

        fillBoardForScene(index);

        for (var si = 0; si < 3; si++) clearTraySlot(si);
        state.availableShapes = [null, null, null];

        var scene = DEMO_SCENES[index];
        var sceneAttr = ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)];
        state.availableShapes[0] = { matrix: scene.shapeMatrix, attribute: sceneAttr };
        renderShapeInSlot(state.availableShapes[0], 0);

        currentScene = index;
        document.getElementById('demoTitle').innerHTML = scene.name;
        document.getElementById('demoDesc').innerHTML = scene.desc;

        var dots = document.querySelectorAll('.demo-dot');
        for (var di = 0; di < dots.length; di++) dots[di].classList.toggle('active', di === index);

        var playBtn = document.getElementById('demoPlayBtn');
        playBtn.innerHTML = '重播';
        playBtn.disabled = true;

        document.getElementById('demoPrevBtn').disabled = index === 0;
        document.getElementById('demoNextBtn').disabled = index === DEMO_SCENES.length - 1;
        sceneVersion++;
    }

    function playScene() {
        var scene = DEMO_SCENES[currentScene];
        var shapeData = state.availableShapes[0];
        if (!shapeData) return;
        var savedVersion = sceneVersion;

        var slotIdx = 0;
        clearTraySlot(slotIdx);
        state.availableShapes[slotIdx] = null;

        var targetY = scene.target[0], targetX = scene.target[1];

        if (currentScene < 4) {
            animateShapeToBoard(shapeData, slotIdx, targetX, targetY, function () {
                if (savedVersion !== sceneVersion) return;
                if (!state.isDemoMode) return;
                placeShape(shapeData, targetX, targetY);
                updateScoreDisplay();
                setTimeout(function () {
                    if (savedVersion !== sceneVersion) return;
                    if (!state.isDemoMode) return;
                    checkLines();
                    updateScoreDisplay();
                    updateAttrScoreDisplay();

                    var playBtn = document.getElementById('demoPlayBtn');
                    playBtn.innerHTML = '重播';
                    playBtn.disabled = false;
                }, 600);
            });
        } else {
            animateShapeToBoard(shapeData, slotIdx, targetX, targetY, function () {
                if (savedVersion !== sceneVersion) return;
                if (!state.isDemoMode) return;

                var cellEl = boardEl.children[0];
                var cellRect = cellEl.getBoundingClientRect();
                var xMark = document.createElement('div');
                xMark.style.cssText = 'position:fixed;z-index:10000;pointer-events:none;' +
                    'color:var(--danger-color);font-size:60px;' +
                    'text-shadow:0 0 15px var(--danger-color);' +
                    'transition:all 0.3s ease;opacity:0;';
                xMark.textContent = '✕';
                xMark.style.left = (cellRect.left + cellRect.width / 2 - 30) + 'px';
                xMark.style.top = (cellRect.top + cellRect.height / 2 - 30) + 'px';
                document.body.appendChild(xMark);
                xMark.offsetHeight;
                xMark.style.opacity = '1';
                xMark.style.transform = 'scale(1.3)';

                for (var ci = 0; ci < CONFIG.BOARD_SIZE * CONFIG.BOARD_SIZE; ci++) {
                    boardEl.children[ci].style.opacity = '0.3';
                }

                setTimeout(function () {
                    xMark.remove();
                    if (savedVersion !== sceneVersion) return;
                    if (!state.isDemoMode) return;
                    state.availableShapes = [null, null, null];
                    clearTraySlot(0);
                    checkGameOver();

                    var playBtn = document.getElementById('demoPlayBtn');
                    playBtn.innerHTML = '重播';
                    playBtn.disabled = false;
                }, 1500);
            });
        }
    }

    function openDemo() {
        state.isDemoMode = true;
        gameOverOverlay.style.display = 'none';
        var overlay = document.getElementById('demoOverlay');
        if (overlay) overlay.classList.add('show');
        applyScene(0);
        if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
        autoPlayTimer = setTimeout(playScene, 1000);
    }

    function closeDemo() {
        if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
        state.isDemoMode = false;
        var overlay = document.getElementById('demoOverlay');
        if (overlay) overlay.classList.remove('show');
        init();
    }

    var eventsBound = false;

    function setDifficulty(difficulty) {
        if (!DIFFICULTY_CONFIG[difficulty]) return;
        state.difficulty = difficulty;
        var buttons = document.querySelectorAll('.diff-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.toggle('active', buttons[i].dataset.diff === difficulty);
        }
        init();
    }

    document.addEventListener('DOMContentLoaded', function () {
        WUWA.initGame();
    });

    WUWA.initGame = function () {
        boardEl = document.getElementById('board');
        traySlots = [
            document.getElementById('slot-0'),
            document.getElementById('slot-1'),
            document.getElementById('slot-2')
        ];
        currentScoreEl = document.getElementById('currentScore');
        highScoreEl = document.getElementById('highScore');
        gameOverOverlay = document.getElementById('gameOverOverlay');
        restartBtn = document.getElementById('restartBtn');
        leaderboardListEl = document.getElementById('leaderboardList');
        exportBtn = document.getElementById('exportBtn');
        importBtn = document.getElementById('importBtn');
        toastBox = document.getElementById('toastBox');
        importModal = document.getElementById('importModal');
        importDataInput = document.getElementById('importDataInput');
        cancelImportBtn = document.getElementById('cancelImportBtn');
        confirmImportBtn = document.getElementById('confirmImportBtn');
        clearBtn = document.getElementById('clearBtn');
        clearModal = document.getElementById('clearModal');
        cancelClearBtn = document.getElementById('cancelClearBtn');
        confirmClearBtn = document.getElementById('confirmClearBtn');
        attrScoreEls = {
            glacio: document.getElementById('score-glacio'),
            fusion: document.getElementById('score-fusion'),
            electro: document.getElementById('score-electro'),
            aero: document.getElementById('score-aero'),
            spectro: document.getElementById('score-spectro'),
            havoc: document.getElementById('score-havoc')
        };

        helpBtn = document.getElementById('helpBtn');

        if (!eventsBound) {
            restartBtn.addEventListener('click', init);

            exportBtn.addEventListener('click', function () {
                if (leaderboardData.records.length === 0 && Object.values(leaderboardData.attrHighScores).every(function (v) { return v === 0; })) {
                    showToast('数据库为空，无需导出。');
                    return;
                }
                var dataStr = JSON.stringify(leaderboardData);
                var copyFallback = function () {
                    var textarea = document.createElement('textarea');
                    textarea.value = dataStr;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        showToast('数据已导出至剪贴板！');
                    } catch (err) {
                        showToast('系统拦截了剪贴板权限。');
                    }
                    document.body.removeChild(textarea);
                };
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(dataStr).then(function () {
                        showToast('数据已导出至剪贴板！');
                    }).catch(copyFallback);
                } else {
                    copyFallback();
                }
            });

            importBtn.addEventListener('click', function () {
                importDataInput.value = '';
                importModal.style.display = 'flex';
            });

            cancelImportBtn.addEventListener('click', function () {
                importModal.style.display = 'none';
            });

            confirmImportBtn.addEventListener('click', function () {
                var inputData = importDataInput.value.trim();
                if (!inputData) {
                    showToast('输入数据为空！');
                    return;
                }
                try {
                    var parsed = JSON.parse(inputData);
                    if (Array.isArray(parsed)) {
                        leaderboardData.records = parsed;
                    } else if (parsed && Array.isArray(parsed.records)) {
                        leaderboardData = parsed;
                        if (!leaderboardData.attrHighScores) {
                            leaderboardData.attrHighScores = { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 };
                        }
                    } else {
                        showToast('数据格式错误，解析失败。');
                        return;
                    }
                    leaderboardData.records.sort(function (a, b) { return b.score - a.score; });
                    leaderboardData.records = leaderboardData.records.slice(0, 10);
                    saveLeaderboard();
                    importModal.style.display = 'none';
                    showToast('数据覆写成功，系统已重启！');
                    init();
                } catch (e) {
                    showToast('JSON 语法错误！');
                }
            });

            clearBtn.addEventListener('click', function () {
                clearModal.style.display = 'flex';
            });

            cancelClearBtn.addEventListener('click', function () {
                clearModal.style.display = 'none';
            });

            confirmClearBtn.addEventListener('click', function () {
                leaderboardData = {
                    records: [],
                    attrHighScores: { glacio: 0, fusion: 0, electro: 0, aero: 0, spectro: 0, havoc: 0 }
                };
                saveLeaderboard();
                clearModal.style.display = 'none';
                showToast('核心数据已清空，系统已重启！');
                init();
            });

            var diffBtns = document.querySelectorAll('.diff-btn');
            for (var di = 0; di < diffBtns.length; di++) {
                diffBtns[di].addEventListener('click', function () {
                    var diff = this.dataset.diff;
                    if (diff === state.difficulty) return;
                    setDifficulty(diff);
                });
            }

            helpBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                openDemo();
            });

            document.getElementById('demoPrevBtn').addEventListener('click', function () {
                if (currentScene > 0) {
                    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                    applyScene(currentScene - 1);
                    autoPlayTimer = setTimeout(playScene, 1000);
                }
            });

            document.getElementById('demoNextBtn').addEventListener('click', function () {
                if (currentScene < DEMO_SCENES.length - 1) {
                    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                    applyScene(currentScene + 1);
                    autoPlayTimer = setTimeout(playScene, 1000);
                }
            });

            document.getElementById('demoOverlayClose').addEventListener('click', function () {
                closeDemo();
            });

            document.getElementById('demoPlayBtn').addEventListener('click', function () {
                if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                applyScene(currentScene);
                playScene();
            });

            document.getElementById('demoOverlay').addEventListener('click', function (e) {
                if (e.target === this) closeDemo();
            });

            (function bindDots() {
                var dots = document.querySelectorAll('.demo-dot');
                for (var dbi = 0; dbi < dots.length; dbi++) {
                    dots[dbi].addEventListener('click', function () {
                        var idx = parseInt(this.dataset.index);
                        if (!isNaN(idx) && idx !== currentScene) {
                            if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                            applyScene(idx);
                            autoPlayTimer = setTimeout(playScene, 1000);
                        }
                    });
                }
            })();

            eventsBound = true;
        }

        setDifficulty(state.difficulty);
    };
})();
