var utility = function() {
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
	Array.prototype.sliding = function(size, defaultValue, iterator){
		var array = this;
		 var window = [];
			var output = [];
			array.forEach(function(num) {
				window.push(num);
				if (window.length === size) {
					output.push(iterator(window));
					window = window.tail();
				} else {
					output.push(defaultValue);
				}
			});
			return output;  
	};
	Array.prototype.tail = function(){
		 var arr = this;
		 return arr.slice(1, arr.length);
	};
}