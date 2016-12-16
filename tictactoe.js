$(document).ready(function() {
	var tiktakState = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0]
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
			if(typeof updateTo !== 'undefined'){
				tiktakState[updateTo.x][updateTo.y] = 1;
				done.done = true;
				done.x = updateTo.x;
				done.y = updateTo.y;
			}
			else{
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
		if(idx !== -1){
			possibilities.push({x: pos.x, y: idx});
		}
		idx = cpCol.lastIndexOf(0);
		if(idx !== -1){
			possibilities.push({x: idx, y: pos.y});
		}
		var allDiagonals = findDiagonals(tiktakState, 3);
		var cpDiagonals = diagonalsAcrossPoint(pos, allDiagonals);
		if(cpDiagonals.length > 0){
			cpDiagonals.forEach(function(diagonal){
				var point = diagonal.find(function(pos){
					return pos.val === 0;
				});
				possibilities.push({x: point.x, y: point.y});
			});
		}
		var randomIndex = Math.floor(Math.random() * possibilities.length - 1) + 1;		
		return possibilities[randomIndex];
	}

	function highlightWinningLine(tiktakState) {
		$('#tiktakTable').off('click.mynamespace');
		var rows = $("#tiktakTable").children().children();
		for (var i = 0; i < tiktakState.length; i++) {
			var rowSum = tiktakState[i].sum();
			if (rowSum === -3 || tiktakState[i].sum() === 3) {
				rows[i].addClass('blink-green');
			} 
			if(rowSum === 3){
				rows[i].addClass('blink-red');
			}
		}
		// column check
		for (var i = 0; i < tiktakState[0].length; i++) {
			var column = [tiktakState[0][i], tiktakState[1][i], tiktakState[2][i]];
			if (column.sum() === -3 || column.sum() === 3) {
				var blinkClass = column.sum() === 3? 'blink-red': 'blink-green';
				$($(rows[0]).children()[i]).addClass(blinkClass);
				$($(rows[1]).children()[i]).addClass(blinkClass);
				$($(rows[2]).children()[i]).addClass(blinkClass);
			}
		}
		var diagonal1 = [tiktakState[0][0], tiktakState[1][1], tiktakState[2][2]];
		var diagonal2 = [tiktakState[2][0], tiktakState[1][1], tiktakState[0][2]];
		if(diagonal1.sum() === 3 || diagonal1.sum() === -3){
			var blinkClass = diagonal1.sum() === 3? 'blink-red': 'blink-green';
			$($(rows[0]).children()[0]).addClass(blinkClass);
			$($(rows[1]).children()[1]).addClass(blinkClass);
			$($(rows[2]).children()[2]).addClass(blinkClass);
		}
		if(diagonal2.sum() === 3 || diagonal2.sum() === -3){
			var blinkClass = diagonal2.sum() === 3? 'blink-red': 'blink-green';
			$($(rows[2]).children()[0]).addClass(blinkClass);
			$($(rows[1]).children()[1]).addClass(blinkClass);
			$($(rows[0]).children()[2]).addClass(blinkClass);
		}
	}

	function diagonalsAcrossPoint(point, allDiagonals) {
		return allDiagonals.filter(function(item){
			return item.includes(item.find(function(val){
				return val.x === point.x && val.y === point.y;
			}));
		});
	}
	
	function findRowsInFullRow(arr, rowLength) {
		var rows = [];
		for (var i = 0; i < arr.length; i++) {
			var row = [];
			for (var j = 0; j < rowLength; j++) {
				var x = i + j;
				if (x < arr.length) {
					row.push({
						'val': arr[x],
						'x': x
					});
				}
			}
			if (row.length === rowLength) {
				rows.push(row);
			}
		}
		return rows;
	}
	
	function findDiagonals(tiktakState, daigonalLength){
		var diagonals = [];
		if(tiktakState.length !== tiktakState[0].length){
			throw "Two dimentional array must be square.";
		}
		for (var i = 0; i < tiktakState.length; i++) {
			for(var j = 0; j < tiktakState[0].length; j++){
				var diagonal1 = [], x, y;
				var diagonal2 = [], w, z;
				for(var k = 0; k < daigonalLength; k++){
					x = i + k;
					y = j + k;
					w = i + (daigonalLength - 1) - k;
					z = j + k;
					if(x < tiktakState.length && y < tiktakState[0].length){
						diagonal1.push({'val':tiktakState[x][y], 'x':x, 'y':y});
					}
					if(w >= 0 && z >=0 && z < tiktakState.length
						&& w < tiktakState[0].length){
						diagonal2.push({'val':tiktakState[w][z], 'x':w, 'y':z});
					}
				}
				if(x < tiktakState.length && y < tiktakState[0].length){
					diagonals.push(diagonal1);
					diagonals.push(diagonal2);
				}
			}
		}
		return diagonals;
	}
	function isGameOver(pos, state, length){
		var corrospondingRows = [],
			corrospondingColumns = []
			corrospondingDiagonals = [];

		var getRow = function (forward) {
			var row = [];
			var operators = {
			    '+' : function(x, y) {
			        return x + y;
			    },
			    '-' : function(x, y) {
			        return x - y;
			    }
			};
			var rowMove = forward ? operators['+']: operators['-'];
			for(var i = 0; i < length; i++){
				var x = rowMove(pos.x, i);
				row.push({val:state[x][pos.y], x:x, y:pos.y});
			}
			return row;
		};

		if((pos.x + length - 1) < state[pos.x].length){
			corrospondingRows.push(getRow(true));
		}
		if((pos.x - (length - 1)) >= 0){
			corrospondingRows.push(getRow(false));
		}
	}
	Array.prototype.sum = function() {
		var arr = this;
		return arr.reduce(function(sum, item) {
			return sum + item;
		}, 0);
	};
	Array.prototype.lastEmptyPlace = function() {
		var arr = this;
		return arr.lastIndexOf(0);
	};
});
