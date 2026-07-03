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
                        attrHighScores: Object.assign({}, DEFAULT_ATTR_SCORES)
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
                    attrHighScores: Object.assign({}, DEFAULT_ATTR_SCORES)
                };
            }
        } catch (e) {
            leaderboardData = {
                records: [],
                attrHighScores: Object.assign({}, DEFAULT_ATTR_SCORES)
            };
        }
        updateHighScore();
    }

    function updateHighScore() {
        state.highScore = leaderboardData.records.length > 0 ? leaderboardData.records[0].score : 0;
        highScoreEl.innerText = state.highScore;
    }

    function saveLeaderboard() {
        localStorage.setItem('lahairo_v3_leaderboard', JSON.stringify(leaderboardData));
        updateHighScore();
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

    function renderShapeInSlot(shapeData, slotIndex) {
        var slotEl = traySlots[slotIndex];
        slotEl.innerHTML = '';
        if (!shapeData) return;

        var matrix = shapeData.matrix;
        var attr = shapeData.attribute;
        var rows = matrix.length;
        var cols = matrix[0].length;

        var cells = '';
        for (var sy = 0; sy < rows; sy++) {
            for (var sx = 0; sx < cols; sx++) {
                var isFilled = matrix[sy][sx] === 1;
                var cls = isFilled ? 'shape-cell attr-' + attr.id + '-bg' : 'shape-cell empty';
                var sty = isFilled ? ' style="box-shadow:inset 0 0 5px rgba(255,255,255,0.8),0 0 10px var(--attr-' + attr.id + ')"' : '';
                var inner = isFilled ? attr.icon : '';
                cells += '<div class="' + cls + '"' + sty + '>' + inner + '</div>';
            }
        }

        var shapeEl = document.createElement('div');
        shapeEl.className = 'shape-element';
        shapeEl.style.cssText = 'grid-template-columns:repeat(' + cols + ',' + TRAY_CELL_SIZE + 'px);grid-template-rows:repeat(' + rows + ',' + TRAY_CELL_SIZE + 'px);--cell-size:' + TRAY_CELL_SIZE + 'px;left:calc(50% - ' + (cols * TRAY_CELL_SIZE + (cols - 1) * CONFIG.GAP) / 2 + 'px);top:calc(50% - ' + (rows * TRAY_CELL_SIZE + (rows - 1) * CONFIG.GAP) / 2 + 'px)';
        shapeEl.dataset.slotIndex = slotIndex;
        shapeEl.shapeData = shapeData;
        shapeEl.innerHTML = cells;
        shapeEl.addEventListener('mousedown', onDragStart);
        shapeEl.addEventListener('touchstart', onDragStart, { passive: false });

        slotEl.appendChild(shapeEl);
    }

    function setShapeGrid(size) {
        var m = draggedShapeData.matrix;
        var c = m[0].length, r = m.length;
        draggedElement.style.gridTemplateColumns = 'repeat(' + c + ', ' + size + 'px)';
        draggedElement.style.gridTemplateRows = 'repeat(' + r + ', ' + size + 'px)';
        draggedElement.style.setProperty('--cell-size', size + 'px');
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
