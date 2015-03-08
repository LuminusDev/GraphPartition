/**
seedrandom.js
=============

Seeded random number generator for Javascript.

version 2.3.10
Author: David Bau
Date: 2014 Sep 20
**/
!function(a,b,c,d,e,f,g,h,i){function j(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=s&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=s&f+1],c=c*d+h[s&(h[f]=h[g=s&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function k(a,b){var c,d=[],e=typeof a;if(b&&"object"==e)for(c in a)try{d.push(k(a[c],b-1))}catch(f){}return d.length?d:"string"==e?a:a+"\0"}function l(a,b){for(var c,d=a+"",e=0;e<d.length;)b[s&e]=s&(c^=19*b[s&e])+d.charCodeAt(e++);return n(b)}function m(c){try{return o?n(o.randomBytes(d)):(a.crypto.getRandomValues(c=new Uint8Array(d)),n(c))}catch(e){return[+new Date,a,(c=a.navigator)&&c.plugins,a.screen,n(b)]}}function n(a){return String.fromCharCode.apply(0,a)}var o,p=c.pow(d,e),q=c.pow(2,f),r=2*q,s=d-1,t=c["seed"+i]=function(a,f,g){var h=[];f=1==f?{entropy:!0}:f||{};var o=l(k(f.entropy?[a,n(b)]:null==a?m():a,3),h),s=new j(h);return l(n(s.S),b),(f.pass||g||function(a,b,d){return d?(c[i]=a,b):a})(function(){for(var a=s.g(e),b=p,c=0;q>a;)a=(a+c)*d,b*=d,c=s.g(1);for(;a>=r;)a/=2,b/=2,c>>>=1;return(a+c)/b},o,"global"in f?f.global:this==c)};if(l(c[i](),b),g&&g.exports){g.exports=t;try{o=require("crypto")}catch(u){}}else h&&h.amd&&h(function(){return t})}(this,[],Math,256,6,52,"object"==typeof module&&module,"function"==typeof define&&define,"random");


var Performance = (function () {
	var begin,
		end;

	function _duration(callback){
		begin = performance.now();
		callback();
		end = performance.now();
	}

	return {
		duration: function(callback) {
			_duration(callback);
		},
		getLastTime: function() {
			return (end - begin);
		}
	}
}());


var Util = (function () {
	return {
		copy: function(object) {
			return JSON.parse(JSON.stringify(object));
		},
		randomInt: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		removeFromArray: function(array, index) {
			var tmp = array[index];
			array[index] = array[array.length-1];
			array.pop();
			return tmp;
		},
		//+ Jonas Raoni Soares Silva
		//@ http://jsfromhell.com/array/shuffle [v1.0]
		shuffleArray: function(o){ //v1.0
		    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		    return o;
		}
	}
}());


//
var C = (function () {
	var cssLabel = "color: #3F51B5;",
		cssValue = "color: #000; font-weight: 700;",
		cssSep = "background: #DDD; color: #111; font-weight: 700;",
		sep = "--------------------------";

	function _sep() {
		console.log("%c%s",cssSep,sep);
	}
	
	return {
		log: function(text) {
			console.log(text);
		},
		line: function(label, value) {
			console.log("%c%s : %c%s", cssLabel, label, cssValue, value);
		},
		openDiv: function(text) {
			console.log("%c%s",cssSep,text);
			_sep();
		},
		closeDiv :function() {
			_sep();
		}
	}
}());

var FormController = (function () {
	var formElement = document.getElementById("form-solver"),
		form = document.forms["form-solver"];

	//Get data form and default values
	function _getOptionsValues() {
		return {
			repetition          : form.elements["nbRepetition"].value          || 1,
			drawGraph           : form.elements["drawGraph"].checked           || false,
			nbCluster           : form.elements["nbCluster"].value             || 2,
			tolerance           : form.elements["tolerance"].value             || 1,
			method              : form.elements["method"].value                || 1,
			neighborhood        : form.elements["neighborhood"].value          || 1,
			initialTemperature  : form.elements["initialTemperature"].value    || 50,
			coolingFactor       : form.elements["coolingFactor"].value         || 0.99,
			maximumIteration    : form.elements["maximumIteration"].value      || 500,
			maximumSolStability : form.elements["maximumSolStability"].value   || 50,
			generateSolution    : GraphPartition.generateRandomSolution,
			generateNeighbor    : GraphPartition.swap
		}
	}

 	// Resolve the problem and draw the solution after form submit
	function _onsubmit(e) {
		e.preventDefault();
		var solution = PartitionningSolver.resolve(_getOptionsValues());
	}

	function _setDisabled(disabled) {
		document.getElementById("resolve").disabled = disabled;
	}

	return {
		submit: function(e) {
			_onsubmit(e);
		},
		setDisabled: function(disabled) {
			_setDisabled(disabled);
		}
	}
}());
document.getElementById('form-solver').addEventListener('submit', FormController.submit, false);


var PartitionningSolver = (function (){

	function _showResults(name, results) {
		C.openDiv(name);
		C.line("Valeur de la solution", results.value);
		C.log("Partition :");
		C.log(results.partition);
		for (var info in results.informations) {
			C.line(results.informations[info].label, results.informations[info].value);
		}
		C.closeDiv();
	}

	function _resolve(options) {
		var solver = {
				name   : null,
				instance : null
			},
			solution = {
				value        : null,
				partition    : null,
				informations : null
			};

		var methods = [
			{name: "Enumération", instance: EnumeratePartionningSolver},
			{name: "Recuit simulé", instance: SimulatedAnnealingPartionningSolver},
		];
		solver = methods[options.method];

		var neighborhoods = [
			GraphPartition.swap,
			GraphPartition.pickndrop,
		];
		options.generateNeighbor = neighborhoods[options.neighborhood];

		options.generateSolution = GraphPartition.generateRandomSolution;

		if (options.repetition <= 1) {
			if (options.drawGraph) {
				var callback = function(solution){
					_showResults(solver.name, solution);
				};
				options.callback = callback;
			}
			solution = solver.instance.resolve(options);
			if (solution.value !== null) {
				solution.informations["totalTime"] = {label:"Temps d'exécution (ms)", value:Performance.getLastTime()};
				_showResults(solver.name, solution);
			}
		} else {
			var results = {
				value        : null,
				partition    : null,
				informations : {
					repetition : {label:"Nombre de simulation", value:options.repetition},
					totalTime  : {label:"Temps d'exécution total (ms)", value:0},
					averageTime: {label:"Temps d'exécution moyen (ms)", value:0},
					firstView  : {label:"Première apparition de la meilleure solution", value:null},
					nbView     : {label:"Nombre d'apparition de la meilleure solution", value:0},
				}
			};
			for (var i = 0; i < options.repetition; i++) {
				solution = solver.instance.resolve(options);

				results.informations.totalTime.value += Performance.getLastTime();
				if (solution.value !== null) {
					if (solution.value < results.value || results.value === null) {
						results.value = solution.value;
						results.partition = Util.copy(solution.partition);
						results.informations.firstView.value = i+1;
						results.informations.nbView.value = 1;
					} else if (solution.value == results.value) {
						results.informations.nbView.value++;
					}
				}
			}
			results.informations.averageTime.value = results.informations.totalTime.value / results.informations.repetition.value;
			_showResults(solver.name, results);
		}
	}

	return {
		resolve: function(options) {
			_resolve(options);
		}
	}
}());

var FileParser = (function () {

	var file = null;

    function _load(evt) {
    	file = evt.target.files[0];

	    if (file) {
	      var r = new FileReader();
	      r.onload = function(evt){
	      	_parseFile(evt);
	      	FormController.setDisabled(false);
	      }
	      r.onerror = function() {
	     	alert("Echec de chargement du fichier");
	      }
	      r.readAsText(file);
		} else {
			FormController.setDisabled(true);
		}
    }

    function _parseFile(evt) {
    	Graph.reset();
    	var lines = evt.target.result.split("\n");
    	// nb nodes [0] and edges [1]
    	var nb = lines[1].split(' ').map(Number);
    	// create nodes
    	for (var n = 0; n < nb[0]; n++) {
    		Graph.addNode(n, {
				id: n,
				size: 1
			});
    	};
    	// create edges
    	var startEdgesLine = 5,
   			edge = null;
        for (var i = startEdgesLine; i < nb[1] + startEdgesLine; i++) {
        	edge = lines[i].split(' ').map(Number);
			Graph.addLink((edge[0]-1)+'e'+(edge[1]-1), {
				source: edge[0]-1,
				target: edge[1]-1,
				weight: edge[2]
			});
        }
    }

    return {
    	load: function(evt) {
    		_load(evt);
    	},
    	isLoad: function() {
    		return file !== null;
    	}
    };
}());
document.getElementById('fileinput').addEventListener('change', FileParser.load, false);

var Graph = (function () {
	var nodes = {},
	    links = {};

	function _updateGroups(groups) {
    	for (var i = 0; i < groups.length; i++) {
    		for (var j = 0; j < groups[i].length; j++) {
    			nodes[groups[i][j]]["group"] = i;
    		}
    	}
    }

    //Name each edge as (min)e(max)
    function _getLinkIndex(first, second) {
    	min = Math.min(first, second);
		max = Math.max(first, second);
		return min+'e'+max;
    }

	return {
		addNode: function(index, n) {
			nodes[index] = n;
		},
		addLink: function(index, l) {
			links[index] = l;
		},
		getNodes: function() {
			return nodes;
		},
		getNodesLength: function() {
			return Object.keys(nodes).length;
		},
		getLinks: function() {
			return links;
		},
		getLinkIndex: function(first, second) {
			return _getLinkIndex(first, second);
		},
		getLinkWeight: function(index) {
			return links[index].weight;
		},
		linkExist: function(index) {
			return links[index] !== undefined;
		},
		updateGroups: function(groups) {
    		_updateGroups(groups);
    	},
    	updateGroup: function(object) {
    		object.group = nodes[object.id].group;
    	},
    	reset: function() {
    		nodes = {};
    		links = {};
    	}
	}
}());


var GraphPartition = (function () {

	function _generateSolution(nbCluster) {
		var solution = EnumeratePartionningSolver.getFirstSolution(nbCluster);
		solution.lengthClusters = _minAndMaxCluster(solution, nbCluster);
		return solution;
	}

	function _generateRandomSolution(nbCluster) {
		var solution = {
			value: null,
			partition: []
		};
		var nodes = [],
			i = 0;
		for (i = 0; i < Graph.getNodesLength(); i++) {
			nodes.push(i);
		}
		Util.shuffleArray(nodes);
		for (i = 0; i < nodes.length; i++) {
			if (solution.partition[i%nbCluster] === undefined) {
				solution.partition[i%nbCluster] = [];
			}
			solution.partition[i%nbCluster].push(nodes[i]);
		}
		solution.value = _evaluate(solution.partition, nbCluster);
		solution.lengthClusters = _minAndMaxCluster(solution, nbCluster);
		C.log(solution);
		return solution;
	}

	function _minAndMaxCluster(solution, nbCluster) {
		var counts = {},
	    	tmp, min, max,
	    	i;
	    for (i = 0; i < solution.length; i++) {
    		counts[solution[i]] = (counts[solution[i]] || 0) + 1;
	    }
	    min = max = counts[0] !== undefined ? counts[0] : 0;
	    for (i = 0; i < nbCluster; i++) {
	    	tmp = counts[i] !== undefined ? counts[i] : 0;
	    	if (tmp > max) {
	    		max = tmp;
	    	} else if (tmp < min) {
	    		min = tmp;
	    	}
	    }

	    return {min: min, max: max};
	}

	function _swap(solution) {
		var sol = Util.copy(solution);

		var firstCluster = Util.randomInt(0, sol.partition.length-1);
		var firstNode = Util.randomInt(0, sol.partition[firstCluster].length-1);
		var secondCluster = Util.randomInt(0, sol.partition.length-2);
		if (secondCluster >= firstCluster) {
			secondCluster++;
		}
		var secondNode = Util.randomInt(0, sol.partition[secondCluster].length-1);

		var firstNodeValue = sol.partition[firstCluster][firstNode];
		var secondNodeValue = sol.partition[secondCluster][secondNode];
		sol.partition[firstCluster][firstNode] = secondNodeValue;
		sol.partition[secondCluster][secondNode] = firstNodeValue;

		sol.value = _evaluateSwap(sol, firstCluster, firstNodeValue, secondCluster, secondNodeValue);

		return sol;
	}

	function _pickndrop(solution, options) {
		var sol = Util.copy(solution);

		var firstCluster = Util.randomInt(0, sol.partition.length-1);
		var firstNode = Util.randomInt(0, sol.partition[firstCluster].length-1);
		var firstNodeValue = Util.removeFromArray(sol.partition[firstCluster], firstNode);
		var secondCluster = Util.randomInt(0, sol.partition.length-2);
		if (secondCluster >= firstCluster) {
			secondCluster++;
		}
		sol.partition[secondCluster].push(firstNodeValue);

		var min = Math.min(sol.lengthClusters.min, sol.partition[firstCluster].length);
		var max = Math.max(sol.lengthClusters.max, sol.partition[secondCluster].length);

		// si la tolérance n'est pas respectée, on continue sur un swap
		if ((max-min) > options.tolerance) {
			var secondNode = Util.randomInt(0, sol.partition[secondCluster].length-1);
			var secondNodeValue = Util.removeFromArray(sol.partition[secondCluster], secondNode);
			sol.partition[firstCluster].push(secondNodeValue);
			sol.value = _evaluateSwap(sol, firstCluster, firstNodeValue, secondCluster, secondNodeValue);
		} else {
			sol.lengthClusters.min = min;
			sol.lengthClusters.max = max;
			sol.value = _evaluatePickndrop(sol, firstCluster, firstNodeValue, secondCluster);
		}

		return sol;
	}

	function _evaluateSwap(solution, firstCluster, firstNodeValue, secondCluster, secondNodeValue) {
		var valueSolution = solution.value,
			i = 0,
			min, max, index;

		for (i = 0; i < solution.partition[firstCluster].length; i++) {
			//First Node : + links old cluster
			index = Graph.getLinkIndex(firstNodeValue, solution.partition[firstCluster][i]);
			if (Graph.linkExist(index)) {
				valueSolution += Graph.getLinkWeight(index);
			}
			//Second Node : - links new cluster
			index = Graph.getLinkIndex(secondNodeValue, solution.partition[firstCluster][i]);
			if (Graph.linkExist(index)) {
				valueSolution -= Graph.getLinkWeight(index);
			}
		}
		for (i = 0; i < solution.partition[secondCluster].length; i++) {
			//First Node : - links new cluster
			index = Graph.getLinkIndex(firstNodeValue, solution.partition[secondCluster][i]);
			if (Graph.linkExist(index)) {
				valueSolution -= Graph.getLinkWeight(index);
			}
			//Second Node : + links old cluster
			index = Graph.getLinkIndex(secondNodeValue, solution.partition[secondCluster][i]);
			if (Graph.linkExist(index)) {
				valueSolution += Graph.getLinkWeight(index);
			}
		}

		// -2 fois link between a and b
		index = Graph.getLinkIndex(firstNodeValue, secondNodeValue);
		if (Graph.linkExist(index)) {
			valueSolution -= 2*Graph.getLinkWeight(index);
		}

		return valueSolution;
	}

	function _evaluatePickndrop(solution, firstCluster, firstNodeValue, secondCluster) {
		var valueSolution = solution.value,
			i = 0,
			index;

		for (i = 0; i < solution.partition[firstCluster].length; i++) {
			//First Node : + links old cluster
			index = Graph.getLinkIndex(firstNodeValue, solution.partition[firstCluster][i]);
			if (Graph.linkExist(index)) {
				valueSolution += Graph.getLinkWeight(index);
			}
		}
		// length-1, pas besoin de vérifier le sommet avec lui même
		for (i = 0; i < solution.partition[secondCluster].length-1; i++) {
			//First Node : - links new cluster
			index = Graph.getLinkIndex(firstNodeValue, solution.partition[secondCluster][i]);
			if (Graph.linkExist(index)) {
				valueSolution -= Graph.getLinkWeight(index);
			}
		}

		return valueSolution;
	}


	function _evaluate(partition, nbCluster) {
		var valueSolution = 0,
			min, max, index,
			i = 0, j = 0, k = 0, l = 0;
		for (i = 0; i < nbCluster; i++) {
			if (partition[i] !== undefined) {
				for (j = 0; j < partition[i].length; j++) {
					for (k = i+1; k < nbCluster; k++) {
						if (partition[k] !== undefined) {
							for (l = 0; l < partition[k].length; l++) {
								min = Math.min(partition[i][j], partition[k][l]);
								max = Math.max(partition[i][j], partition[k][l]);
								index = min+'e'+max;
								if (Graph.linkExist(index)) {
									valueSolution += Graph.getLinkWeight(index);
								}
							}
						}
					}
				}
			}
		}
		return valueSolution;
	}

	return {
		swap: function(solution) {
			return _swap(solution);
		},
		pickndrop: function(solution, options) {
			return _pickndrop(solution, options);
		},
		generateSolution: function(nbCluster) {
			return _generateSolution(nbCluster);
		},
		generateRandomSolution: function(nbCluster) {
			return _generateRandomSolution(nbCluster);
		},
		evaluate: function(partition, nbCluster) {
			return _evaluate(partition, nbCluster);
		},
		minAndMaxCluster: function(solution, nbCluster) {
			return _minAndMaxCluster(solution, nbCluster);
		}
	}
}());

var EnumeratePartionningSolver = (function () {

	var _nbCluster,
		_nbNodes,
		_mean,
		_tolerance,
		_bestSolution,
		_current,
		_stopFirstSolution,

		_drawGraph;

	function _init(options) {
		_nbCluster = options.nbCluster;
		_tolerance = options.tolerance;
		_nbNodes = Graph.getNodesLength();
		_stopFirstSolution = options.stopFirstSolution || false;
		_mean = Math.ceil(_nbNodes / _nbCluster);
		_bestSolution = {
			value        : null,
			partition    : [],
			informations : {
				nbSolution: {label:"Nombre de solutions possibles", value:0}
			}
		};
		_current = {
			x   : 0,
			i   : 0,
			sol : []
		};
		_drawGraph = options.drawGraph;
	}

	function _getFirstSolution(nbCluster) {
		_init({
			nbCluster: nbCluster,
			tolerance: 1,
			stopFirstSolution: true
		});

		_runResolve();

		return _bestSolution;
	}

	function _resolve(options) {
		_init({
			nbCluster: options.nbCluster,
			tolerance: options.tolerance,
			drawGraph: options.drawGraph
		});

		if (_nbNodes > 20) {
			// trop de temps, petit garde fou
			return _bestSolution;
		}

		// resolve with performance showed
		if (_drawGraph) {
			_runResolveRecursion(options.callback);
		} else {
			Performance.duration(_runResolve);
		}

		return _bestSolution;
	}

	function _doStep() {
		var continu = true,
			isValidFinal = false;
		while(1) {
			if (_current.x >= _nbNodes) {
		    	if (_isValidFinal(_current.sol)) {
		        	_evaluate(_current.sol);
		        	_bestSolution.informations.nbSolution.value++;
		        	continu = (!_stopFirstSolution);
		        	if (!continu) {
		        		break;
		        	}
		        	isValidFinal = true;
		    	}
		        _current.i = (_current.sol.pop() + 1);
		        _current.x -= 1;
		        if (isValidFinal) {
		        	break;
		        }
		    } else if (_current.i > Math.min(_current.x, _nbCluster-1)) {
		        if (_current.x !== 0) {
		            _current.i = (_current.sol.pop() + 1);
		            _current.x -= 1 ;
		        } else {
		        	continu = false;
		        	break;
		        }
		    } else {
		        _current.sol.push(_current.i);
		        if (_isValidPartial(_current.sol)) {
		        	_current.x += 1;
		        	_current.i = 0;
		        } else {
		        	_current.i += 1;
		        	_current.sol.pop();
		        }
		    }
		}
		return continu;
	}

	function _runResolve() {
		while(_doStep());
	}

	function _runResolveRecursion(callback) {
		setTimeout(function(){
			if (_doStep()) {
				_runResolveRecursion(callback);
			} else {
				callback(_bestSolution);
			}
		}, 50);
	}

	function _isValidPartial(solution) {
	    var counts = {},
	    	rep = true,
	    	i;
	    for (i = 0; i < solution.length; i++) {
    		counts[solution[i]] = (counts[solution[i]] || 0) + 1;
	    }
	    i = 0;
	    while (i < _nbCluster && rep) {
	        rep = (counts[i] === undefined || counts[i] <= (_mean + _tolerance - 1));
	        i++;
	    }
	    return rep;
	}

	function _isValidFinal(solution) {
	    var nbClusters = GraphPartition.minAndMaxCluster(solution, _nbCluster);
	    return (nbClusters.max - nbClusters.min) <= _tolerance;
	}

	function _evaluate(solution) {
		var valueSolution,
			clusters = [],
			i = 0;
		// creation des clusters sous la forme ([0,1],[2,3]...)
		for (i = 0; i < _nbNodes; i++) {
			if (clusters[solution[i]] === undefined) {
				clusters[solution[i]] = [];
			}
			clusters[solution[i]].push(i);
		}
		valueSolution = GraphPartition.evaluate(clusters, _nbCluster);
		if (_bestSolution.value === null || valueSolution < _bestSolution.value) {

			if (_drawGraph) {
				if (_bestSolution.value === null) {
					GraphDrawerD3.draw(clusters);
				} else {
					GraphDrawerD3.update(clusters);
				}
			}
			_bestSolution.value = valueSolution;
			_bestSolution.partition = clusters;
		}
	}

	return {
		resolve: function(options) {
			return _resolve(options);
		},
		getFirstSolution: function(nbCluster) {
			return _getFirstSolution(nbCluster);
		}
	}
}());




/*** GRADIENT DESCENT ***/
//TODO
var GradientDescentSolver = (function () {
	var _nbCluster,
	    _currentSolution,
	    _bestSolution,
	    
	    ///fonction
	    _generateSolution	= null,
	    _generateNeighbor	= null;
	    
	
	function _init(options) {
		_nbCluster 			= options.nbCluster;
		_generateSolution	= options.generateSolution;
		_generateNeighbor	= options.generateNeighbor;
	}
	

	
	function _doDescentStep(){
		
		return true;
	}
	
	function _resolve(options){
		_init(options);

    	// resolve with performance showed
		Performance.duration(function(){
    		while (_doDescentStep());
		});

		return currentSolution;
	}
	
	return {
		initialize: function(options) {
            _init(options);
        },

        step: function() {
            return _doDescentStep();
        },

        resolve: function(options) {
        	return _resolve(options);
        }
    };
})();





/*** TABOO SEARCH ***/
var TabouSearchSolver = (function () {
	var _nbCluster,
	    _currentSolution,
	    _bestSolution,
	    _nbIteration 	= 0,
	    _nbIterationMax	= 100,
	    _tabou		= null, 
	    
	    ///fonction
	    _generateSolution	= null,
	    _generateNeighbor	= null;
	    
	
	function _init(options) {
		_nbCluster 		= options.nbCluster;
		_generateSolution	= options.generateSolution;
		_generateNeighbor	= options.generateNeighbor;
		_nbIterationMax		= options.nbIterationMax || _nbIterationMax
		
		// solution initiale
		_currentSolution		= _generateSolution(nbCluster);
	}

	function _doTabooSearchStep(){
		_nbIteration+=1;

		var neighbor = _searchArgMin(_generateNeighborood());
		 

		return true;
	}

	// Retourne les élements dans le voisinage sans ceux qui appartiennent à la liste tabou
	function _generateNeighborood(){
		var Z;
		return Z;
	}

	function _searchArgMin(){

	}
	
	function _resolve(options){
		_init(options);

    	// resolve with performance showed
		Performance.duration(function(){
    		while (_doTabooSearchStep() && _nbIteration < _nbIterationMax);
		});

		return currentSolution;
	}
	
	return {
		initialize: function(options) {
            _init(options);
        },

        step: function() {
            return _doTabooSearchStep();
        },

        resolve: function(options) {
        	return _resolve(options);
        }
    };
})();




var SimulatedAnnealingPartionningSolver = (function () {
    var coolingFactor,
        stabilizingFactor,
        freezingTemperature,
        maximumIteration,
        currentIteration,
        currentTemperature,
        currentStabilizer,
        currentPartition,
        currentSolution,
        nbCluster,
        tolerance,
        
        // fonctions
        generateSolution,
        generateNeighbor,

        drawGraph;

    function _init(options) {
        coolingFactor            = options.coolingFactor          || 0.95;
        stabilizingFactor        = options.stabilizingFactor      || 1.005;
        freezingTemperature      = options.freezingTemperature    || 0.01;
        maximumIteration         = options.maximumIteration       || 100.0;
        currentIteration         = options.currentIteration       || 0.0;
        nbCluster                = options.nbCluster              || 2;
        tolerance                = options.tolerance              || 1;
        currentTemperature       = options.initialTemperature     || 50.0;
        currentStabilizer        = options.initialStabilizer      || 50.0;
        maximumSolStability      = options.maximumSolStability    || 50.0;
        currentSolStability      = options.initialSolStability    || 0.0;
        generateSolution         = options.generateSolution;
        generateNeighbor         = options.generateNeighbor;

        // solution initiale
        currentSolution          = generateSolution(nbCluster);
        currentPartition         = Util.copy(currentSolution);

        drawGraph                = options.drawGraph              || false;
    }

    function _updateSolution(solution) {
    	currentSolution = Util.copy(solution);
    	if (drawGraph) {
    		GraphDrawerD3.update(currentSolution.partition);
    	}
    }

    function _metropolis(temperature, delta, neighbor) {
        if (delta < 0) {
	        currentPartition = Util.copy(neighbor);
            if (neighbor.value < currentSolution.value) {
            	_updateSolution(neighbor);
            }
        } else {
	        var metro = Math.exp(-delta / temperature);
	        var p = Math.random();
	        if (p < metro) {
	            currentPartition = Util.copy(neighbor);
	        }
        }
    }

    function _doSimulationStep() {
    	var oldSolutionValue = currentSolution.value;
        if (currentTemperature > freezingTemperature
        	&& maximumIteration > ++currentIteration
    		&& maximumSolStability > currentSolStability
        ) {
            for (var i = 0; i < currentStabilizer; i++) {
                var neighbor = generateNeighbor(currentPartition, {tolerance: tolerance}),
                    energyDelta = neighbor.value - currentPartition.value;

                _metropolis(currentTemperature, energyDelta, neighbor);
            }
            currentTemperature *= coolingFactor;
            currentStabilizer *= stabilizingFactor;
            if (oldSolutionValue === currentSolution.value) {
            	currentSolStability++;
            } else {
            	currentSolStability = 0;
            }
            return true;
        }
        return false;
    }

    function _resolve(options) {
    	_init(options);

    	if (drawGraph) {
			GraphDrawerD3.draw(currentSolution.partition);
			_runResolveRecursion(options.callback);
			return {value: null};
    	} else {
	    	// resolve with performance showed
			Performance.duration(_runResolve);
			return _solutionWithInformations();
    	}
    }

    function _runResolve() {
    	while (_doSimulationStep());
    }

    function _runResolveRecursion(callback) {
		setTimeout(function(){
			if (_doSimulationStep()) {
				_runResolveRecursion(callback);
			} else {
				callback(_solutionWithInformations());
			}
		}, 50);
	}

    function _solutionWithInformations() {
    	var informations = {
    		nbIteration: {label:"Nombre d'itérations", value:currentIteration},
    		finalTemperature: {label:"Température finale", value:currentTemperature},
    	};
    	currentSolution.informations = informations;
    	return currentSolution;
    }

    return {
        resolve: function(options) {
        	return _resolve(options);
        }
    };
})();

var graphGenerator = (function () {
	/* options
		nbNodes : number of node to create
		seed : seed use in pseudo random generator
	 */
	function _generate(options) {
		var N = options.nbNodes || 10,
			listTarget = [],
			i,
			j,
			E,
			target,
			sizeEdges = 0,
			g = {
				nodes: [],
				links: [],
			};

		Math.seedrandom(options.seed || "imarandomseed"); // use seedrandom.js
		for (i = 0; i < N; i++) {
			g.nodes.push({
				id: 'n' + i,
				label: 'Noeud ' + i,
				x: Math.random(),
				y: Math.random(),
				size: 1,
				color: '#666'
			});
			listTarget = [];
			if (i !== N-1) {
				E = (Math.random() * (N-i-1));
				for (j = 0; j < E; j++) {
					target = 'n' + (i + 1 + Math.random() * (N-i-1) | 0);
					if (listTarget.indexOf(target) === -1) {
						listTarget.push(target);
						g.links.push({
							id: 'e' + (sizeEdges++),
							source: 'n' + i,
							target: target,
							weight: (1 + Math.random() * 10 | 0),
							color: '#ccc'
						});
					}
				}
			}
		}
		return g;
	}

	return {
		generate: function(options){
			_generate(options);
		}
	}
}());

var GraphDrawerD3 = (function () {

	var w = 960,
	    h = 500,
	    fill = d3.scale.category10(),
	    vis = null,
	    rect,
	    container,
	    force,
	    nodes,
	    links,
	    groups, nbGroups,
	    graphNodes = [],
	    graphLinks = [],
	    circle = {
	    	r : 100,
	    	cx: 430,
	    	cy: 250
	    },
	    foci = [];

	var zoom = d3.behavior.zoom()
		.scaleExtent([0.2, 2])
		.on("zoom", zoomed);

	function zoomed() {
		container.attr("transform", "translate("+d3.event.translate+")scale(" + d3.event.scale + ")");
	}

	function groupPath(d) {
	    return (d.values.length > 2) ? "M" + 
	      d3.geom.hull(d.values.map(function(i) { return [i.x, i.y]; }))
	        .join("L")
	    + "Z" : "";
	}

	function groupFill(d, i) {
		return fill(i);
	}

	function remove() {
		if (vis !== null) {
			nodes.remove();
			links.remove();
			rect.remove();
			container.remove();
			vis.remove();
			d3.select("#chart svg").remove();
		}
	}

	function updateGraph(partition) {
		Graph.updateGroups(partition);
		var fnodes = force.nodes(),
			i;
		for (i = 0; i < fnodes.length; i++) {
			Graph.updateGroup(fnodes[i]);
		}

		nodes.style("fill", function(d, i) { return fill(d.group); })
		     .style("stroke", function(d, i) { return d3.rgb(fill(d.group)).darker(2); });

		links.style("stroke-width", function(o){
				return o.source.group === o.target.group ? 0 : 1;
			});

		groups = d3.nest().key(function(d) { return d.group; }).entries(graphNodes);
		nbGroups = groups.length;

		force.start();
	}

	function draw(partition) {

		remove();

		vis = d3.select("#chart").append("svg")
		    .attr("width", w)
		    .attr("height", h)
		  .append("g")
			.attr("transform", "translate(0,0)")
			.call(zoom);

		rect = vis.append("rect")
		    .attr("width", w)
		    .attr("height", h)
		    .style("fill", "none")
		    .style("pointer-events", "all");

		container = vis.append("g");

		Graph.updateGroups(partition);
		graphNodes = d3.values(Graph.getNodes());
		graphLinks = d3.values(Graph.getLinks());

		force = d3.layout.force()
			.gravity(0)
			.linkStrength(0)
		    .nodes(graphNodes)
		    .links(graphLinks)
		    .size([w, h])
		    .start();

		force.on("tick", _ontick);

		groups = d3.nest().key(function(d) { return d.group; }).entries(graphNodes);
		nbGroups = groups.length;

		nodes = container.selectAll("circle.node")
		    .data(graphNodes);

		nodes.enter().append("circle")
		    .attr("class", "node")
		    .attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; })
		    .attr("r", 8)
		    .style("fill", function(d, i) { return fill(d.group); })
		    .style("stroke", function(d, i) { return d3.rgb(fill(d.group)).darker(2); })
		    .style("stroke-width", 1.5);

		links = container.selectAll(".link")
			.data(graphLinks);

		links.enter().append("line")
			.style("stroke", "#999")
			.style("stroke-opacity", 0.2)
			.style("stroke-width", function(o){
				return o.source.group === o.target.group ? 0 : 1;
			});

		container.style("opacity", 1e-6)
		  .transition()
		    .duration(1000)
		    .style("opacity", 1);

		for (var i = 0; i < nbGroups; i++) {
			foci[i] = {
				x: circle.cx + circle.r * Math.cos((i+1)*2*Math.PI/nbGroups),
				y: circle.cy + circle.r * Math.sin((i+1)*2*Math.PI/nbGroups)
			};
		};

	}

	function _ontick(e) {
		var k = 0.2 * e.alpha;
		graphNodes.forEach(function(o, i) {
			o.x += (foci[o.group].x - o.x) * k;
			o.y += (foci[o.group].y - o.y) * k;
		});

		links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		nodes.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

		container.selectAll("path")
		  .data(groups)
			.attr("d", groupPath)
		  .enter().insert("path", "circle")
			.style("fill", groupFill)
			.style("stroke", groupFill)
			.style("stroke-width", 40)
			.style("stroke-linejoin", "round")
			.style("opacity", .2)
			.attr("d", groupPath);
	}

	return {
		draw: function(partition){
			draw(partition);
		},
		update: function(partition){
			updateGraph(partition);
		}
	}
}());
