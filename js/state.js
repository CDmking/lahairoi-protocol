    var state = {
        board: [],
        score: 0,
        highScore: 0,
        difficulty: 'easy',
        isDemoMode: false,
        attrScores: Object.assign({}, DEFAULT_ATTR_SCORES),
        availableShapes: [null, null, null],
        isGameOver: false
    };

    var leaderboardData = {
        records: [],
        attrHighScores: Object.assign({}, DEFAULT_ATTR_SCORES)
    };
