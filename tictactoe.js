$(document).ready(function() {
	var tiktakState = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	];
	$("#tiktakTable").delegate("td", "click", function() {
		var cell = $(this);
		cell.html("O");
		var pos = {
			x: cell[0].parentNode.rowIndex,
			y: cell[0].cellIndex
		};
		tiktakState[pos.x][pos.y] = -1;

		setTimeout(function() {
			var done = updateState(tiktakState, pos);
			if (done.done) {
				tiktakState[done.x][done.y] = 1;
				if (done.gameover) {
					$('#message').html('<h4>Game over</h4>');
					highlightWinningLine(tiktakState);

				}
			} else {
				$('#message').html('<h4>Game over</h4>');
				highlightWinningLine(tiktakState);
			}
			var rows = $("#tiktakTable").find('tr');
			$($(rows[done.x]).find('td')[done.y]).html('X');
		}, 500);
		console.log(pos);
	});

	function updateState(tiktakState, pos) {
		var updatedRow = tiktakState[pos.x];
		var updatedCol =
			[tiktakState[0][pos.y], tiktakState[1][pos.y], tiktakState[2][pos.y]];

		var done = priorityWiseUpdate(tiktakState, tryToWin);
		if (done.done) {
			done.gameover = true;
		} else if (!done.done) {
			done = priorityWiseUpdate(tiktakState, tryToDefend);
		}
		if (!done.done) {
			// row check
			var updateTo = randomUpdateTo(pos, tiktakState);
			if (typeof updateTo !== 'undefined') {
				tiktakState[updateTo.x][updateTo.y] = 1;
				done.done = true;
				done.x = updateTo.x;
				done.y = updateTo.y;
			} else {
				done.gameover = true;
			}
		}
		return done;
	}

	function priorityWiseUpdate(tiktakState, updateMethod) {
		var done = {
			done: false,
			x: undefined,
			y: undefined
		};
		// row check
		for (var i = 0; i < tiktakState.length; i++) {
			if (!done.done) {
				row = updateMethod(tiktakState[i], done);
				if (done.done) {
					done.x = i;
					return done;
				}
			}
		}
		// column check
		for (var i = 0; i < tiktakState[0].length; i++) {
			if (!done.done) {
				var column = [tiktakState[0][i], tiktakState[1][i], tiktakState[2][i]];
				column = updateMethod(column, done);
				if (done.done) {
					done.x = done.y;
					done.y = i;
					return done;
				}
			}
		}
		// diagonal check
		var diagonal1 = [tiktakState[0][0], tiktakState[1][1], tiktakState[2][2]];
		diagonal1 = updateMethod(diagonal1, done);
		if (done.done) {
			done.x = done.y;
			return done;
		}
		var diagonal2 = [tiktakState[2][0], tiktakState[1][1], tiktakState[0][2]];
		diagonal2 = updateMethod(diagonal2, done);
		if (done.done) {
			done.x = Math.abs(done.y - 2);
			return done;
		}
		return done;
	}

	function tryToDefend(row, done) {
		if (row.sum() == -2) {
			var emptyplace = row.indexOf(0);
			row[emptyplace] = 1;
			done.y = emptyplace;
			done.done = true;
		}
		return row;
	}

	function tryToWin(row, done) {
		if (row.sum() == 2) {
			var emptyplace = row.indexOf(0);
			if (emptyplace >= 0) {
				row[emptyplace] = 1;
				done.y = emptyplace;
				done.done = true;
			}
		}
		return row;
	}

	function randomUpdateTo(pos, tiktakState) {
		var cpRow = tiktakState[pos.x];
		var cpCol =
			[tiktakState[0][pos.y], tiktakState[1][pos.y], tiktakState[2][pos.y]];
		var possibilities = [];
		var idx = cpRow.lastIndexOf(0);
		if (idx !== -1) {
			possibilities.push({
				x: pos.x,
				y: idx
			});
		}
		idx = cpCol.lastIndexOf(0);
		if (idx !== -1) {
			possibilities.push({
				x: idx,
				y: pos.y
			});
		}
		var allDiagonals = findDiagonals(tiktakState, 3);
		var cpDiagonals = diagonalsAcrossPoint(pos, allDiagonals);
		if (cpDiagonals.length > 0) {
			cpDiagonals.forEach(function(diagonal) {
				var point = diagonal.find(function(pos) {
					return pos.val === 0;
				});
				possibilities.push({
					x: point.x,
					y: point.y
				});
			});
		}
		var randomIndex = Math.floor(Math.random() * possibilities.length - 1) + 1;
		return possibilities[randomIndex];
	}

	function possibleStraightLines(pos, state, length) {
		var lines = [];

		var row1 = [],
			row2 = [],
			col1 = [],
			col2 = [],
			dia1 = [],
			dia2 = [];
		for (var i = length - 1; i >= 0; i--) {
			row.push(state[pos.x + i][pos.y]);
		}
	}

	function isGameOver(pos, state, length) {
		var corrospondingRows = [],
			corrospondingColumns = []
		corrospondingDiagonals = [];

		var getRow = function(forward) {
			var row = [];
			var operators = {
				'+': function(x, y) {
					return x + y;
				},
				'-': function(x, y) {
					return x - y;
				}
			};
			var rowMove = forward ? operators['+'] : operators['-'];
			for (var i = 0; i < length; i++) {
				var x = rowMove(pos.x, i);
				row.push({
					val: state[x][pos.y],
					x: x,
					y: pos.y
				});
			}
			return row;
		};

		if ((pos.x + length - 1) < state[pos.x].length) {
			corrospondingRows.push(getRow(true));
		}
		if ((pos.x - (length - 1)) >= 0) {
			corrospondingRows.push(getRow(false));
		}
	}

	function highlightWinningLine(tiktakState) {
		$('#tiktakTable').off('click.mynamespace');
		var rows = $("#tiktakTable").children().children();
		for (var i = 0; i < tiktakState.length; i++) {
			var rowSum = tiktakState[i].sum();
			if (rowSum === -3 || tiktakState[i].sum() === 3) {
				rows[i].addClass('blink-green');
			}
			if (rowSum === 3) {
				rows[i].addClass('blink-red');
			}
		}
		// column check
		for (var i = 0; i < tiktakState[0].length; i++) {
			var column = [tiktakState[0][i], tiktakState[1][i], tiktakState[2][i]];
			if (column.sum() === -3 || column.sum() === 3) {
				var blinkClass = column.sum() === 3 ? 'blink-red' : 'blink-green';
				$($(rows[0]).children()[i]).addClass(blinkClass);
				$($(rows[1]).children()[i]).addClass(blinkClass);
				$($(rows[2]).children()[i]).addClass(blinkClass);
			}
		}
		var diagonal1 = [tiktakState[0][0], tiktakState[1][1], tiktakState[2][2]];
		var diagonal2 = [tiktakState[2][0], tiktakState[1][1], tiktakState[0][2]];
		if (diagonal1.sum() === 3 || diagonal1.sum() === -3) {
			var blinkClass = diagonal1.sum() === 3 ? 'blink-red' : 'blink-green';
			$($(rows[0]).children()[0]).addClass(blinkClass);
			$($(rows[1]).children()[1]).addClass(blinkClass);
			$($(rows[2]).children()[2]).addClass(blinkClass);
		}
		if (diagonal2.sum() === 3 || diagonal2.sum() === -3) {
			var blinkClass = diagonal2.sum() === 3 ? 'blink-red' : 'blink-green';
			$($(rows[2]).children()[0]).addClass(blinkClass);
			$($(rows[1]).children()[1]).addClass(blinkClass);
			$($(rows[0]).children()[2]).addClass(blinkClass);
		}
	}

	function diagonalsAcrossPoint(point, allDiagonals) {
		return allDiagonals.filter(function(item) {
			return item.includes(item.find(function(val) {
				return val.x === point.x && val.y === point.y;
			}));
		});
	}

	var findWinRow = function winRow(inArray, winLength) {
		var at = -1,
			winningSum = winLength * -1;

		inArray.sliding(winLength, undefined, function (arr, idx) {
			if(arr.sum() !== winningSum){ return; }
			at = idx;
			return true;
		});
		return at;
	}
	function isUserWon(state, winLength, pos) {
		var won;
		var winningSum = winLength * -1;

		//For row
		var start = Math.max(0, pos.y  - (winLength - 1)),
			end = pos.y + winLength;
		var rowMadeAt = findWinRow(state[pos.x].slice(start, end), winLength);
		if (rowMadeAt >= 0) {
			won = {
				from: { x: pos.x, y: rowMadeAt -1 },
				to: { x: pos.x, y: rowMadeAt + winLength -1 }
			}
			return won;
		}

		//For column
		var start = Math.max(0, pos.x  - (winLength - 1)),
			end = pos.x + winLength;
		
		var incolumn = state.map(function (row, idx) {
			return row[pos.y];
		}).slice(start, end);
		var colMadeAt = findWinRow(incolumn, winLength);
		if(colMadeAt >= 0){
			won = {
				from: { x: colMadeAt - 1, y: pos.y },
				to: { x: colMadeAt + winLength - 1, y: pos.y }
			}
			return won;
		}
		//For forward diagonal
		/*
		function getPositions(pos){
var dispacement = (3- 1), winLength = 3; 
		var tempX = pos.x - dispacement,
			tempY = pos.y - dispacement,
            tempeX = pos.x + winLength,
            tempeY = pos.y + winLength;
		var startX = Math.max(0, tempX),
			startY = Math.max(0, tempY),
			endX = Math.min(state.length, tempeX),
			endY = Math.min(state.length, tempeY);
		startX = tempY < 0 ? Math.max(0, startX + tempY): startX;
		startY = tempX < 0 ? Math.max(0, startY + tempX): startY;
        var xlen = state.length, ylen = state[0].length;
        var a = tempeY - ylen, b = tempeX - xlen;
        endX =  a > 0 ? endX - a: endX;
        endY = b > 0? endY - b: endY;
 console.log(startX, endX, startY, endY);
}
		*/
		var dispacement = (winLength - 1);
		var startX = Math.max(0, pos.x  - dispacement),
			startY = Math.max(0, pos.y - dispacement),
			endX = Math.min(state.length, pos.x + dispacement),
			endY = Math.min(state.length, pos.y + dispacement);
		
		var fdiagonal = state.slice(startX, endX).map(function (row, idx) {
			return row.slice(startY, endY);
		}).map(function (row, idx) {
			 return row[idx]; 
		});
		var colMadeAt = findWinRow(incolumn, winLength);
		if(colMadeAt >= 0){
			won = {
				from: { x: colMadeAt - 1, y: pos.y },
				to: { x: colMadeAt + winLength - 1, y: pos.y }
			}
			return won;
		}
		//For backward diagonal
		var tempX = pos.x - dispacement,
		tempY = pos.y - dispacement;
		startX = Math.min(state.length, pos.x - dispacement),
		startY = Math.max(0, pos.y - dispacement),
		endX = Math.max(0, pos.x  + winLength),
		endY = Math.min(state.length, pos.y + winLength);
		var yLen = state[0].length;
		startX = tempY > yLen ? Math.min(yLen, startX + (tempY - yLen)): startX;
		startY = tempX < 0 ? Math.max(0, startY - tempX): startX;
		var bdiagonal = state.slice(startX, endX).map(function (row, idx) {
			return row.slice(startY, endY);
		}).map(function (row, idx) {
			 return row[row.length - (idx +1)]; 
		});
		var backwardDiaAt = findWinRow(bdiagonal, winLength);
		console.log('backDia', bdiagonal , backwardDiaAt );
		if(backwardDiaAt >= 0){
			var xAt = startX - backwardDiaAt,
				yAt = startY + backwardDiaAt;
			won = {
				from: { x: xAt, y: yAt },
				to: { x: xAt - dispacement, y: yAt + dispacement }
			}
			return won;
		}

		return won;
	}

	function findDiagonals(state, daigonalLength) {
		var diagonals = [];
		if (state.length !== state[0].length) {
			throw "Two dimentional array must be square.";
		}
		for (var i = 0; i < state.length; i++) {
			for (var j = 0; j < state[0].length; j++) {
				var diagonal1 = [],
					x, y;
				var diagonal2 = [],
					w, z;
				for (var k = 0; k < daigonalLength; k++) {
					x = i + k;
					y = j + k;
					w = i + (daigonalLength - 1) - k;
					z = j + k;
					if (x < state.length && y < state[0].length) {
						diagonal1.push({
							'val': state[x][y],
							'x': x,
							'y': y
						});
					}
					if (w >= 0 && z >= 0 && z < state.length && w < state[0].length) {
						diagonal2.push({
							'val': state[w][z],
							'x': w,
							'y': z
						});
					}
				}
				if (x < state.length && y < state[0].length) {
					diagonals.push(diagonal1);
					diagonals.push(diagonal2);
				}
			}
		}
		return diagonals;
	}

	 /**
     * Adds all elements of array and skips non numeric values
     * @param {number[]} array the input array.
     * @returns {number}
     */
	Array.prototype.sum = function() {
		var arr = this;
		return arr.reduce(function(sum, item) {
			if(item && !isNaN(parseFloat(item))){
				return sum + item;
			}
			else{
				return sum;
			}
		}, 0);
	};
	Array.prototype.lastEmptyPlace = function() {
		var arr = this;
		return arr.lastIndexOf(0);
	};

	Array.prototype.sliding = function(size, defaultValue, iterator) {
		var arr = this;
        var window = [];
        var output = [];
        arr.forEach(function(num, index) {
            window.push(num);
            if (window.length === size) {
                output.push(iterator(window, index)); // passing starting index of the sliding window
                window = window.tail();
            } else {
                output.push(defaultValue);
            }
        });
        return output;
    };
    Array.prototype.tail = function () {
    	var arr = this;
    	return arr.slice(1, arr.length);
    }
});
