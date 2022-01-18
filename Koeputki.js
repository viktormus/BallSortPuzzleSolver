// BALL SORT PUZZLE SOLVER
// Puzzle rules are in the 'intro'-method of solver object

// Constants
var TUBESIZE = 4;

// Tubes: bottom ball written first in array, top ball written last

function Tube(balls) {
	this.balls = balls;
	this.n = function() { return this.balls.length };
	this.freeSpaces = function() { return TUBESIZE - this.n() };
	this.print = function() { console.log(...this.balls) };
	
	// Stores the color, with which this tube should be filled with (NOTE! undefined if tube is empty)
	// Can't make a function since I want to be able to manually change it
	this.baseColor = this.balls[0];

	// Returns the number of baseColor balls that are placed 'correctly' (same color, 'connected', starting from bottom)
	this.readyN = function() {
		var start = this.baseColor;
		for (i = 0; i < this.n(); i++) {
			solver.loopCount++;
			if (start != this.balls[i]) {
				return i;
			}
		}
		return this.n();
	};

	// Returns a number of balls starting from top that are different in color from the bottom ball
	// OR same color but not connected to it -> I.E. those that need to be removed at some point
	this.wrongN = function() { return this.n() - this.readyN() };

	// Takes top ball and places in into another tube
	this.placeInto = function(otherTube) { otherTube.balls.push(this.balls.pop()) };

	// Checks whether the test tube has 4 of the same color balls OR the tube is empty & needs no colored balls
	this.isComplete = function() { return this.readyN() == TUBESIZE || (this.n() == 0 && this.baseColor == undefined) };

	// Checks whether all balls in the test tube are of same color (or if it's empty)
	this.isUniform = function() { return this.wrongN() == 0 };

	// Returns indexes of a specified color
	this.colorIndexes = function(col) {
		return this.balls.reduce(function(total, currVal, i) {
			if (currVal == col) {
				total.push(i);
			}
			return total;
		}, [] /*Initial value*/)	
	};

	// Returns the top ball color (undefined if empty tube)
	this.topColor = function() { return this.balls[this.n() - 1] };

	// Returns true if the tube contains given color
	this.contains = function(col) { return this.colorIndexes(col).length > 0 };

	// Returns depth of specified color, ie. how many other colored balls are on top of it
	this.depth = function(col) { return this.n() - 1 - this.colorIndexes(col)[this.colorIndexes(col).length - 1] }
}

/*
var a = new Tube(["b", "w", "w"])
var b = new Tube(["b", "b", "w", "w"])
var c = new Tube(["b"])
*/

// NOTE! All color names must be of same length (for beautiful printing)
var a = new Tube(["re", "lb", "gr", "lb"])
var b = new Tube(["rr", "pu", "or", "re"])
var c = new Tube(["pu", "ye", "lg", "bl"])
var d = new Tube(["or", "lb", "re", "lb"])
var e = new Tube(["re", "or", "rr", "rr"])
var f = new Tube(["bl", "lg", "rr", "lg"])
var g = new Tube(["gr", "pu", "ye", "gr"])
var h = new Tube(["ye", "or", "pu", "gr"])
var i = new Tube(["lg", "bl", "bl", "ye"])
var j = new Tube([])
var k = new Tube([])

// Potentially inoptimal behavior by the solver when there's only one re in tube 5

var tubes = [a, b, c, d, e, f, g, h, i, j]

var solver = {
	loopCount: 0,
	recursiveCalls: 0,
	moveCount: 0,
	moveSequence: "",

	// Simply outputs all tubes with nice visuals
	// Note! Current settings are for 2-letter-long color names
	printer: function(list) {
		var TWO = 2;	// 1 if color names are 1 letter long
		var FOUR = 4;	// 3 if color names are 1 letter long
		for (i = TUBESIZE - 1; i > -1; i--) {
			var tempList = ["|"];
			for (j = 0; j < list.length; j++) {
				if (list[j].n() < i + 1) {
					tempList.push(" ".repeat(TWO));
				} else {
					tempList.push(list[j].balls[i]);
				}
				tempList.push("|");
			}
			console.log(...tempList);
		}
		console.log((" " + "-".repeat(FOUR)).repeat(list.length));
	},

	// Returns a list of unique colors in the puzzle
	allColors: function(list) {
		var tempList = [];
		list.forEach(e => tempList.push(e.balls));
		var uniques = [...new Set(tempList.flat())];
		return uniques;
	},

	// Returns a list of all indexes of balls of specific color
	allColorIndexes: function(list, col) {
		var tempList = [];
		list.forEach(e => tempList.push(e.colorIndexes(col)))
		return tempList.flat();
	},

	// Returns the number of all free spaces in the puzzle
	allFreeSpaces: function(list) { return list.reduce(function(total, currVal, i) { return total + currVal.freeSpaces() }, 0) },

	// Checks whether the puzzle is solved (completed)
	isAllDone: function(list) { return list.reduce(function(total, currVal, i) { return total && currVal.isComplete() }, true)},

	// Sets 'base colors' for each tube. The solver algorithm will try to fill the tubes with balls of its base color
	// ATM, this method is called only once, before the solver algorithm
	setBaseColors: function(list) {
		// If multiple tubes with same base color, choose the one with most ready balls
		var baseCols = [];
		for (k = 0; k < list.length; k++) {
			this.loopCount++;
			var color = list[k].baseColor
			if (color == undefined || !baseCols.includes(color)) {
				baseCols.push(color);
			} else {
				var firstI = baseCols.indexOf(color);
				if (list[k].readyN() > list[firstI].readyN()) {
					list[firstI].baseColor = undefined;
					baseCols.splice(firstI, 1, undefined);
					baseCols.push(color)
				} else {
					list[k].baseColor = undefined;
					baseCols.push(undefined);
				}
			}
		}

		// Find index of tube where base color is undefined and which has the most free spaces
		function undefMostFree() {
			var idx = baseCols.indexOf(undefined);
			for (k = idx + 1; k < baseCols.length; k++) {
				this.loopCount++;
				if (baseCols[k] == undefined && list[k].freeSpaces() > list[idx].freeSpaces()) {
					idx = k;
				}
			}
			return idx;
		}

		// Choose base colors for each tube where it's currently undefined
		var allC = this.allColors(list);
		for (k = 0; k < allC.length; k++) {
			this.loopCount++;
			var color = allC[k]
			if (!baseCols.includes(color)) {
				var idx = undefMostFree();
				list[idx].baseColor = color;
				baseCols.splice(idx, 1, color);
			}
		}
		return baseCols;
	},

	// Returns the index of the non-completed tube with smallest wrongN
	// If two columns have the same wrongN, chooses one with lowestDepth
	// If two columns have the same lowestDepth, chooses the one with highest readyN
	mostCompleted: function(list) {
		var curr = list.findIndex(e => e.baseColor != undefined && !e.isComplete());
		for (m = curr + 1; m < list.length; m++) {
			this.loopCount++;
			var obj = list[m];
			var kWrong = obj.wrongN();
			var kDepth = this.lowestDepth(list, obj.baseColor)[1];
			var kReady = obj.readyN();

			if (!obj.isComplete() && 
				(kWrong < list[curr].wrongN() || 
					(kWrong == list[curr].wrongN() && 
						kDepth < this.lowestDepth(list, list[curr].baseColor)[1]) ||
					(kWrong == list[curr].wrongN() &&
						kDepth == this.lowestDepth(list, list[curr].baseColor)[1] &&
						kReady > list[curr].readyN()))) {
				curr = m;
			}
		}
		return curr;
	},

	// Returns [index of the tube, depth (ie. the number of balls on top of it)] where the desired color is closest to the surface
	// Ignores the tube that has the same color as its baseColor (that would provide incorrect depth)
	// If multiple with same depth, chooses the tube with most balls
	lowestDepth: function(list, col) {
		var bestTube = 0;
		var bestDepth = TUBESIZE;
		for (k = 0; k < list.length; k++) {
			this.loopCount++;
			if (list[k].baseColor != col) {
				if (list[k].contains(col) && (list[k].depth(col) < bestDepth || (list[k].depth(col) <= bestDepth && list[k].n() > list[bestTube].n()))) {
					bestTube = k;
					bestDepth = list[k].depth(col);
				}
			}
		}
		return [bestTube, bestDepth];
	},

	// Returns the tube (Object!) to which it is best to move a ball from a given tube
	// Vital method to get the puzzle solved in least number of moves
	// Might be inefficient / not the best at the moment
	mostSuitableTube: function(list, fromTube) {
		var color = list[fromTube].topColor();
		var options = list.filter(function(currVal) { return currVal.freeSpaces() > 0 && currVal != list[fromTube]});
		if (options.length == 1) {
			//console.log("The only option");
			return options[0];
		}
		// Now moving from the best to the worst option
		// There's a tube with only that color
		for (j = 0; j < options.length; j++) {
			this.loopCount++;
			if (options[j].baseColor == color && options[j].isUniform()) {
				//console.log("Second best");
				return options[j];
			}
		}

		// If there's a tube with undefined base color & empty, we can drop it there
		// + maybe later change the base color from undefined to this one?!
		for (j = 0; j < options.length; j++) {
			this.loopCount++;
			if (options[j].baseColor == undefined && options[j].n() == 0) {
				//console.log("-> undef & empty");
				return options[j];
			}
		}
		
		// If no empty undefined base color tubes, drop into the one that has the same color already
		for (j = 0; j < options.length; j++) {
			this.loopCount++;
			if (options[j].baseColor == undefined && options[j].topColor() == color) {
				//console.log("-> undef & has the same col on top");
				return options[j];
			}
		}

		// If other tube doesn't contain the color this tube needs, and if this tube has no color underneath that other tube needs
		for (j = 0; j < options.length; j++) {
			this.loopCount++;
			if (!options[j].contains(color) && !list[fromTube].contains(options[j].baseColor) && !options[j].isUniform()) {
				//console.log("-> 2.5");
				return options[j]
			}
		}

		// If the tube with this base color is not uniform, we would have to remove this ball later, so it's best not to put it there
		// Also, we don't want to place the ball into uniform tubes of other colors
		for (j = 0; j < options.length; j++) {
			this.loopCount++;
			if (options[j].baseColor != color && !options[j].isUniform()) {
				//console.log("Third best");
				return options[j];
			}
		}
		// If the conditions above are not fulfilled, we start dropping them one by one
		// We still wanna avoid moving to uniform tubes, as the ball below this one could fit there and wouldn't need to be removed
		for (j = 0; j < options.length; j++) {
			this.loopCount++;
			if (!options[j].isUniform()) {
				//console.log("Fourth best");
				return options[j];
			}
		}
		// If there are no better options, we simply give the first tube available
		//console.log("Last one");
		return options[0];
	},

	// Checks if it's possible to remove all incorrect balls (wrongN) from the mostCompleted tube
	// & have enough free spaces to reach the lowestDepth ball of desired color
	isPossible: function(list, fromTube) {
		//console.log("fromTube: " + fromTube);
		var freeSpaces = 0;
		for (j = 0; j < list.length; j++) {
			this.loopCount++;
			if (j != fromTube) {
				freeSpaces += list[j].freeSpaces();
			}
		}
		var lowestDpt = this.lowestDepth(list, list[fromTube].baseColor);
		var excessFreeSpace = freeSpaces - list[fromTube].wrongN() - lowestDpt[1] - list[lowestDpt[0]].freeSpaces();
		//console.log("excessFreeSpace: " + excessFreeSpace);
		return excessFreeSpace >= 0;
	},

	// Moves a ball from given tube to another tube
	moveAway: function(list, fromTube) {
		this.moveCount++;
		var targetTube = this.mostSuitableTube(list, fromTube);
		list[fromTube].placeInto(targetTube);
		this.printer(list);
		this.moveSequence += (fromTube + 1) + "->" + (list.indexOf(targetTube) + 1) + ";";
	},

	// Actual solver algorithm
	solve: function(list) {
		var idx = this.mostCompleted(list);
		console.log("Trying to complete tube: " + idx);
		if (!this.isPossible(list, idx)) {
			console.log("Ei mahdollista!");
			console.log("There was an error. Abort mission!!");
			return;
		}
		// Removes all 'wrong-colored' balls from the tube
		for (i = 0; i < list[idx].wrongN(); i++) {
			this.loopCount++;
			//console.log("Emptying desired tube");
			this.moveAway(list, idx);
		}

		// Starts filling the tube with right-colored balls
		// If there are balls of 'wrong' color in tube from which we are taking balls, moves those out of the way
		var getFrom = this.lowestDepth(list, list[idx].baseColor);
		for (k = 0; k < getFrom[1] + 1; k++) {
			this.loopCount++;
			//console.log("Moving balls to desired tube");
			this.moveAway(list, getFrom[0]);
		}

		if (this.isAllDone(list)) {
			console.log("Completed!");
			return;
		}
		this.recursiveCalls++;
		this.solve(list);
	},

	stats: function() {
		console.log("")
		console.log("--- Statistics ---");
		console.log("Number of moves: " + this.moveCount);
		console.log("Number of loops: " + this.loopCount + " (ignores printing)");
		console.log("Number of recursive calls: " + this.recursiveCalls);
	},

	intro: function(list) {
		console.log("--- Welcome to the Ball Sort Puzzle Solver! ---");
		console.log("Given tubes with balls of different color, \nwe try to sort them so that each tube contains all balls of the same color.");
		console.log("The goal is to solve the puzzle with as little moves as possible.");
		console.log("The rules are simple: you can take the top ball and drop it into another tube, if it's not full already.");
		console.log("Let's go!");
		console.log("\nInitial state:")
		this.printer(list);
		console.log("\nBase colors:");
		console.log(...this.setBaseColors(list));
		console.log("- - - - - - -\n");
	},

	completeSolver: function(list) {
		this.intro(list);
		this.solve(list);
		this.stats();
		console.log("Move sequence:");
		console.log(this.moveSequence);
	}
}

solver.completeSolver(tubes);