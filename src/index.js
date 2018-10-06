module.exports = function solveSudoku(matrix) {
    var Sudoku = function(input_value) {
        var solved = [];

        initSolved(input_value);
        solve();

        function initSolved(input_value) {
            var suggest = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (var i = 0; i < 9; i++) {
                solved[i] = [];
                for (var j = 0; j < 9; j++) {
                    if (input_value[i][j]) {
                        solved[i][j] = [input_value[i][j], 'in', []];
                    }
                    else {
                        solved[i][j] = [0, 'unknown', suggest];
                    }
                }
            }
        }

        function solve() {
            var changed = 0;
            do {
                changed = updateSuggests();
            } while (changed);

            if (!isSolved() && !isFailed()) {
                backtracking();
            }
        }

        function updateSuggests() {
            var changed = 0;
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if ('unknown' !== solved[i][j][1]) {
                        continue;
                    }

                    changed += solveSingle(i, j);

                    changed += solveHiddenSingle(i, j);
                }
            }
            return changed;
        }

        function solveSingle(i, j) {
            solved[i][j][2] = arrayDiff(solved[i][j][2], rowContent(i));
            solved[i][j][2] = arrayDiff(solved[i][j][2], colContent(j));
            solved[i][j][2] = arrayDiff(solved[i][j][2], sectContent(i, j));
            if (1 === solved[i][j][2].length) {
                markSolved(i, j, solved[i][j][2][0]);
                return 1;
            }
            return 0;
        }

        function solveHiddenSingle(i, j) {
            var less_suggest = lessRowSuggest(i, j);
            var changed = 0;
            if (1 === less_suggest.length) {
                markSolved(i, j, less_suggest[0]);
                changed++;
            }
            less_suggest = lessColSuggest(i, j);
            if (1 === less_suggest.length) {
                markSolved(i, j, less_suggest[0]);
                changed++;
            }
            less_suggest = lessSectSuggest(i, j);
            if (1 === less_suggest.length) {
                markSolved(i, j, less_suggest[0]);
                changed++;
            }
            return changed;
        }

        function markSolved(i, j, solve) {
            solved[i][j][0] = solve;
            solved[i][j][1] = 'solved';
        }

        function rowContent(i) {
            var content = [];
            for (var j = 0; j < 9; j++) {
                if ('unknown' !== solved[i][j][1]) {
                    content.push(solved[i][j][0]);
                }
            }
            return content;
        }

        function colContent(j) {
            var content = [];
            for (var i = 0; i < 9; i++) {
                if ('unknown' !== solved[i][j][1]) {
                    content.push(solved[i][j][0]);
                }
            }
            return content;
        }

        function sectContent(i, j) {
            var content = [];
            var offset = sectOffset(i, j);
            for (var k = 0; k < 3; k++) {
                for (var l = 0; l < 3; l++) {
                    if ('unknown' !== solved[offset.i + k][offset.j + l][1]) {
                        content.push(solved[offset.i + k][offset.j + l][0]);
                    }
                }
            }
            return content;
        }

        function lessRowSuggest(i, j) {
            var less_suggest = solved[i][j][2];
            for (var k = 0; k < 9; k++) {
                if (k === j || 'unknown' !== solved[i][k][1]) {
                    continue;
                }
                less_suggest = arrayDiff(less_suggest, solved[i][k][2]);
            }
            return less_suggest;
        }

        function lessColSuggest(i, j) {
            var less_suggest = solved[i][j][2];
            for (var k = 0; k < 9; k++) {
                if (k === i || 'unknown' !== solved[k][j][1]) {
                    continue;
                }
                less_suggest = arrayDiff(less_suggest, solved[k][j][2]);
            }
            return less_suggest;
        }

        function lessSectSuggest(i, j) {
            var less_suggest = solved[i][j][2];
            var offset = sectOffset(i, j);
            for (var k = 0; k < 3; k++) {
                for (var l = 0; l < 3; l++) {
                    if (((offset.i + k) === i && (offset.j + l) === j) || 'unknown' !== solved[offset.i + k][offset.j + l][1]) {
                        continue;
                    }
                    less_suggest = arrayDiff(less_suggest, solved[offset.i + k][offset.j + l][2]);
                }
            }
            return less_suggest;
        }

        function arrayDiff(array1, array2) {
            return array1.filter(function(elm) {
                return array2.indexOf(elm) === -1;
            })
        }

        function sectOffset(i, j) {
            return {
                j: Math.floor(j / 3) * 3,
                i: Math.floor(i / 3) * 3
            }
        }

        function isSolved() {
            var is_solved = true;
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if ('unknown' === solved[i][j][1]) {
                        is_solved = false;
                    }
                }
            }
            return is_solved;
        }

        this.isSolved = function () {
            return isSolved();
        };

        function isFailed() {
            var is_failed = false;
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if ('unknown' === solved[i][j][1] && !solved[i][j][2].length) {

                        is_failed = true;
                    }
                }
            }
            return is_failed;
        }

        function backtracking() {
            var input_value = [[], [], [], [], [], [], [], [], []];
            var i_min = -1, j_min = -1, suggests_cnt = 0;
            for (var i = 0; i < 9; i++) {
                input_value[i].length = 9;
                for (var j = 0; j < 9; j++) {
                    input_value[i][j] = solved[i][j][0];
                    if ('unknown' === solved[i][j][1] && (solved[i][j][2].length < suggests_cnt || !suggests_cnt)) {
                        suggests_cnt = solved[i][j][2].length;
                        i_min = i;
                        j_min = j;
                    }
                }
            }

            for (var k = 0; k < suggests_cnt; k++) {
                input_value[i_min][j_min] = solved[i_min][j_min][2][k];
                var sudoku = new Sudoku(input_value);
                if (sudoku.isSolved()) {
                    out_val = sudoku.getSolved();
                    for (var i = 0; i < 9; i++) {
                        for (var j = 0; j < 9; j++) {
                            if ('unknown' === solved[i][j][1]) {
                                markSolved(i, j, out_val[i][j][0])
                            }
                        }
                    }
                    return;
                }
            }
        }

        this.getSolved = function () {
            return solved;
        };

        this.solution = function () {
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    matrix[i][j] = solved[i][j][0];
                }
            }
            return matrix;
        }
    };

    var sudoku = new Sudoku(matrix);

    return sudoku.solution();
};

