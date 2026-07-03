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

    function countPlacements(matrix) {
        var count = 0;
        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                if (canPlaceShape(matrix, x, y)) count++;
            }
        }
        return count;
    }

    function getShapeWeight(placements, area, difficulty) {
        var p = placements + 1;
        switch (difficulty) {
            case 'easy':   return Math.pow(p, 2) / area;
            case 'normal': return p;
            case 'hard':   return Math.pow(p, 0.3) * area;
        }
    }
