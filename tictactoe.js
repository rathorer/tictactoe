$(document).ready(function() {
	var tiktakState,
		userInput,
		computerInput,
		winLength, compLastPos,
		userWinSum, computerWinSum;

	function init() {
		var winLength = 4, stateLength = 6;//TODO: replace with dynamic values.
		var defaultValue = 0;
		var tiktakState = new Array(stateLength)
			.fill(new Array(stateLength).fill(defaultValue)),
		userInput = -1,
		computerInput = 1,
		winLength = 4,
		userWinSum = userInput * winLength,
		computerWinSum = computerInput * winLength;
		window.addEventListener('gameover', (e) => {
			var winLine = e.detail.winLine;
			if(highlightWinningLine(winLine)){
				$('#tiktakTable').off('click');
			};
		}, false);
	}
	init();

	$("#tiktakTable").delegate("td", "click", function() {//TODO: bind mouseover
		var cell = $(this);
		cell.html("O");
		var pos = {
			x: cell[0].parentNode.rowIndex,
			y: cell[0].cellIndex
		};
		tiktakState[pos.x][pos.y] = userInput;
		processUserEntry(tiktakState, winLength, pos);
		setTimeout(function() {
			var played = play(tiktakState, pos);
			if (played.won) {
				tiktakState[played.x][played.y] = computerInput;
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

	function tryToDefend(row) {
		var toBeLost = userWinSum - userInput,
			emptyplace = -1;
		if (row.sum() === toBeLost) {
			var emptyplace = row.indexOf(0);
			row[emptyplace] = computerInput;
		}
		return emptyplace;
	}

	function tryToWin(state, pos, slidingWindow, recursive) {
		var possibleWinLine,
			slidingWindow = slidingWindow || winLength + 1,
			pos = pos || compLastPos,
			sum = computerWinSum - (computerInput * 2);

		function playChance(line) {
			var emptyplaceIdx = -1, at;
			if (line.length > 0) {
				var lineAt = findWiningLine(line.map((el)=> el.val), sum);
				var possibilities = [line[lineAt - 1], line[lineAt + 1]];
				var first = state[possibilities[0].x][possibilities[0].y];
				var second = state[possibilities[1].x][possibilities[1].y];
				if(first && second && !recursive){
					var a = tryToWin(state, first, winLength - 1, true),
						b = tryToWin(state, second, winLength -1, true);
				}
				emptyplaceIdx = line.findIndex((el) => el.val===0);

				if(emptyplaceIdx>=0){
					var emptyplace = line[emptyplaceIdx];
					emptyplace.val = computerInput;
					state[emptyplace.x][emptyplace.y] = computerInput;
					at = {x:emptyplace.x, y:emptyplace.y, won:true, line:line.slice(winAt, winAt+winLength)};
				}
			}
			return at;
		}
		return playChance(findWiningRow(state, slidingWindow, pos, sum))
			|| playChance(findWiningColumn(state, slidingWindow, pos, sum))
			|| playChance(findWiningForwardDiagonal(state, slidingWindow, pos, sum))
			|| playChance(findWiningBackwardDiagonal(state, slidingWindow, pos, sum));
	}

	function play(tiktakState, pos) {
		var played = playWinningChance(tiktakState);
		if (played) {
			if(played.won){
				gameover(played.line);
			}
			return played;
		}
		played = playDefendingChance(tiktakState, pos);
		if(played){
			return played; 
		}
		var updateTo = randomUpdateTo(pos, tiktakState);
		if (typeof updateTo !== 'undefined') {
			tiktakState[updateTo.x][updateTo.y] = computerInput;
			done.done = true;
			done.x = updateTo.x;
			done.y = updateTo.y;
		} else {
			done.gameover = true;
		}
		return done;
	}

	function playWinningChance(state) {
		var possibleWinLine,
			slidingWindow = winLength + 1,
			pos = compLastPos,
			sum = computerWinSum - computerInput;

		function playChance(line) {
			var emptyplaceIdx = -1, at;
			if (line.length > 0) {
				emptyplaceIdx = line.findIndex((el) => el.val===0);
				if(emptyplaceIdx>=0){
					var emptyplace = line[emptyplaceIdx];
					emptyplace.val = computerInput;
					var winAt = findWiningLine(line.map((el)=> el.val), computerWinSum);
					state[emptyplace.x][emptyplace.y] = computerInput;
					at = {x:emptyplace.x, y:emptyplace.y, won:true, line:line.slice(winAt, winAt+winLength)};
				}
			}
			return at;
		}
		return playChance(findWiningRow(state, slidingWindow, pos, sum))
			|| playChance(findWiningColumn(state, slidingWindow, pos, sum))
			|| playChance(findWiningForwardDiagonal(state, slidingWindow, pos, sum))
			|| playChance(findWiningBackwardDiagonal(state, slidingWindow, pos, sum));
	}
	function playDefendingChance(state, pos) {
		var possibleWinLine,
			slidingWindow = winLength + 1,
			sum = userWinSum - userInput;

		function playChance(line) {
			var emptyplaceIdx = -1, at;
			if (line.length > 0) {
				emptyplaceIdx = line.findIndex((el) => el.val===0);
				if(emptyplaceIdx>=0){
					var emptyplace = line[emptyplaceIdx];
					emptyplace.val = computerInput;					
					state[emptyplace.x][emptyplace.y] = computerInput;
					at = {x:emptyplace.x, y:emptyplace.y, won:false};
				}
			}
			return at;
		}
		return playChance(findWiningRow(state, slidingWindow, pos, sum))
			|| playChance(findWiningColumn(state, slidingWindow, pos, sum))
			|| playChance(findWiningForwardDiagonal(state, slidingWindow, pos, sum))
			|| playChance(findWiningBackwardDiagonal(state, slidingWindow, pos, sum));
	}
	// function priorityWiseUpdate(tiktakState, updateMethod) {
	// 	var done = {
	// 		done: false,
	// 		x: undefined,
	// 		y: undefined
	// 	};
	// 	// row check
	// 	for (var i = 0; i < tiktakState.length; i++) {
	// 		if (!done.done) {
	// 			row = updateMethod(tiktakState[i], done);
	// 			if (done.done) {
	// 				done.x = i;
	// 				return done;
	// 			}
	// 		}
	// 	}
	// 	// column check
	// 	for (var i = 0; i < tiktakState[0].length; i++) {
	// 		if (!done.done) {
	// 			var column = tiktakState.map((row)=>{
	// 				return row[i];
	// 			});
	// 			column = updateMethod(column, done);
	// 			if (done.done) {
	// 				done.x = done.y;
	// 				done.y = i;
	// 				return done;
	// 			}
	// 		}
	// 	}
	// 	// diagonal check
	// 	var diagonal1 = [tiktakState[0][0], tiktakState[1][1], tiktakState[2][2]];
	// 	diagonal1 = updateMethod(diagonal1, done);
	// 	if (done.done) {
	// 		done.x = done.y;
	// 		return done;
	// 	}
	// 	var diagonal2 = [tiktakState[2][0], tiktakState[1][1], tiktakState[0][2]];
	// 	diagonal2 = updateMethod(diagonal2, done);
	// 	if (done.done) {
	// 		done.x = Math.abs(done.y - 2);
	// 		return done;
	// 	}
	// 	return done;
	// }

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
	function highlightWinningLine(line){
		var rows = $("#tiktakTable").children().children(),
			winningSum = line.map(function(el){return el.val;}).sum();
		var blink =  winningSum === computerWinSum ? 'blink-red' : 'blink-green';
		for (var i = line.length - 1; i >= 0; i--) {
			$($(rows[line[i].x]).children()[line[i].y]).addClass(blink);
		}
		return true;
	}
	// function highlightWinningLine(tiktakState) {
	// 	$('#tiktakTable').off('click.mynamespace');
	// 	var rows = $("#tiktakTable").children().children();
	// 	for (var i = 0; i < tiktakState.length; i++) {
	// 		var rowSum = tiktakState[i].sum();
	// 		if (rowSum === -3 || tiktakState[i].sum() === 3) {
	// 			rows[i].addClass('blink-green');
	// 		}
	// 		if (rowSum === 3) {
	// 			rows[i].addClass('blink-red');
	// 		}
	// 	}
	// 	// column check
	// 	for (var i = 0; i < tiktakState[0].length; i++) {
	// 		var column = [tiktakState[0][i], tiktakState[1][i], tiktakState[2][i]];
	// 		if (column.sum() === -3 || column.sum() === 3) {
	// 			$($(rows[0]).children()[i]).addClass(blinkClass);
	// 			$($(rows[1]).children()[i]).addClass(blinkClass);
	// 			$($(rows[2]).children()[i]).addClass(blinkClass);
	// 		}
	// 	}
	// 	var diagonal1 = [tiktakState[0][0], tiktakState[1][1], tiktakState[2][2]];
	// 	var diagonal2 = [tiktakState[2][0], tiktakState[1][1], tiktakState[0][2]];
	// 	if (diagonal1.sum() === 3 || diagonal1.sum() === -3) {
	// 		var blinkClass = diagonal1.sum() === 3 ? 'blink-red' : 'blink-green';
	// 		$($(rows[0]).children()[0]).addClass(blinkClass);
	// 		$($(rows[1]).children()[1]).addClass(blinkClass);
	// 		$($(rows[2]).children()[2]).addClass(blinkClass);
	// 	}
	// 	if (diagonal2.sum() === 3 || diagonal2.sum() === -3) {
	// 		var blinkClass = diagonal2.sum() === 3 ? 'blink-red' : 'blink-green';
	// 		$($(rows[2]).children()[0]).addClass(blinkClass);
	// 		$($(rows[1]).children()[1]).addClass(blinkClass);
	// 		$($(rows[0]).children()[2]).addClass(blinkClass);
	// 	}
	// }

	function diagonalsAcrossPoint(point, allDiagonals) {
		return allDiagonals.filter(function(item) {
			return item.includes(item.find(function(val) {
				return val.x === point.x && val.y === point.y;
			}));
		});
	}
	function gameover(winLine) {
		var event = new CustomEvent('gameover', { 'detail': winLine });
		window.dispatchEvent(event);
	}
	function findWiningLine(inArray, targetSum) {
		var at = -1;
		inArray.sliding(winLength, undefined, function (arr, idx) {
			if(arr.sum() !== targetSum){ return; }
			at = idx;
			return true;
		});
		return at;
	}
	function findWiningRow(state, slidingWindow, pos, targetSum){
		var start = Math.max(0, pos.y  - (slidingWindow - 1)),
			end = pos.y + slidingWindow,
			winingRow = [];

		var rowMadeAt = 
			findWiningLine(state[pos.x].slice(start, end), targetSum);
		console.log('row', state[pos.x].slice(start, end), rowMadeAt);
		if (rowMadeAt >= 0) {
			var at = start + rowMadeAt;
			for (var i = 0; i >= slidingWindow - 1; i--) {
				var x = pos.x, y = at + i;
				winingRow.push({x: x, y: y, val:state[x][y]});
			}
		}
		return winingRow;
	}
	function findWiningColumn(state, slidingWindow, pos, targetSum){
		var start = Math.max(0, pos.x  - (slidingWindow - 1)),
			end = pos.x + slidingWindow;
		
		var incolumn = state.map(function (row, idx) {
			return row[pos.y];
		}).slice(start, end);
		var colMadeAt = findWiningLine(incolumn, targetSum);
		console.log('col', incolumn , colMadeAt);
		if(colMadeAt >= 0){
			var at = start + colMadeAt;
			for (var i = 0; i >= slidingWindow - 1; i--) {
				var x = at + i, y = pos.y;
				winingRow.push({x: x, y: y, val:state[x][y]});
			}
		}
		return won;
	}
	function findWiningForwardDiagonal(state, slidingWindow, pos, targetSum) {
		var dispacement = (slidingWindow - 1);
		var tempX = pos.x - dispacement,
			tempY = pos.y - dispacement,
			fdiagonal = [], winingDia = [];
		for(var i = 0; i <= dispacement*2; i++){
			var el = state[tempX] !== undefined ? state[tempX][tempY]: undefined;
			if(el !== undefined){
				fdiagonal.push({x:tempX, y:tempY, val:el});
			}
			tempX++;
			tempY++;
		}
		if(fdiagonal.length >= slidingWindow){
			var justValues = fdiagonal.map(function(el){return el.val;});
			var forwardAt = findWiningLine(justValues, targetSum);
		}
		console.log('forwDia', fdiagonal , forwardAt);
		if(forwardAt >= 0){
			winingDia = fdiagonal.slice(forwardAt, forwardAt + slidingWindow);
		}
		return winingDia;
	}
	function findWiningBackwardDiagonal(state, slidingWindow, pos, targetSum) {
		var backX = pos.x - dispacement,
		backY = pos.y + dispacement,
		bdiagonal = [], winingDia = [];
		for(var i = 0; i <= dispacement*2; i++){
			var el = state[backX] !== undefined ? state[backX][backY]: undefined;
			if(el !== undefined){
				bdiagonal.push({x:backX, y:backY, val:el});
			}
			backX++;
			backY--;
		}
		var backwardDiaAt = 
			findWiningLine(bdiagonal.map(
					function(el){return el.val;}), targetSum);
		console.log('backDia', bdiagonal , backwardDiaAt );
		if(backwardDiaAt >= 0){
			winingDia = bdiagonal.slice(backwardDiaAt, backwardDiaAt + slidingWindow);
		}
		return winingDia;
	}

	function processUserEntry(state, winLength, pos) {
		var winLine;
		//For row
		winLine = findWiningRow(state, winLength, pos, userWinSum);
		//For column
		winLine = findWiningColumn(state, winLength, pos, userWinSum);
		//For forward diagonal
		winLine = findWiningForwardDiagonal(state, winLength, pos, userWinSum);
		//For backward diagonal
		winLine = findWiningBackwardDiagonal(state, winLength, pos, userWinSum);
		if(winLine.length > 0){
			gameover(winLine);
		}
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
            	var idx = index - size + 1;
                output.push(iterator(window, idx)); // passing starting index of the sliding window
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
