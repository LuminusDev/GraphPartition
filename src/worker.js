'use strict';

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

var PartitionningSolver = (function (){

	function _showResults(name, results) {
		// send to main
		postMessage({
			isTerminated: true,
			solution: results
		});
		close();
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
    	var min = Math.min(first, second);
		var max = Math.max(first, second);
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
    	},
    	serialize: function() {
    		return {nodes:nodes, links:links};
    	},
    	deserialize: function(graph) {
    		nodes = graph.nodes;
    		links = graph.links;
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

	function _existingCluster(solution, cluster){
		return 0 >= cluster && cluster < solution.partition.length;
	}

	function _existingNode(solution, cluster, node){
		return 0 >= node && node < solution.partition[cluster].length;
	}

	function _ur_swap(solution, firstCluster, firstNode, secondCluster, secondNode){
		var sol = Util.copy(solution);

		if( ! (_existingCluster(sol, firstCluster) &&     //Vérification des paramètres de la méthode
		       _existingCluster(sol, secondCluster) &&
		       _existingNode(sol, firstCluster, firstNode) &&
		       _existingNode(sol, secondCluster, secondNode)    )){
			return;
		}
		var firstNodeValue = sol.partition[firstCluster][firstNode];
		var secondNodeValue = sol.partition[secondCluster][secondNode];

		sol.partition[firstCluster][firstNode] = secondNodeValue;
		sol.partition[secondCluster][secondNode] = firstNodeValue;

		sol.value = _evaluateSwap(sol, firstCluster, firstNodeValue, secondCluster, secondNodeValue);
		sol.movement = { fromClusterNodeA : firstCluster, toClusterNodeA : secondCluster, nodeA: firstNode, nodeB: secondNode };
		return sol;
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

	function _ur_pickndrop(solution, firstCluster, secondCluster, node, options){
		var sol = Util.copy(solution);

		if( ! (_existingCluster(sol, firstCluster) &&    //Vérification des paramètres de la méthode
		       _existingCluster(sol, secondCluster) &&
		       _existingNode(sol, firstCluster, node)   )){
			return;
		}

		var nodeValue = sol.partition[firstCluster][node];

		var min = Math.min(sol.lengthClusters.min, sol.partition[firstCluster].length);
		var max = Math.max(sol.lengthClusters.max, sol.partition[secondCluster].length);
		
		// si la tolérance n'est pas respectée, on continue sur un swap
		if ((max-min) > options.tolerance) {
			var secondNode = Util.randomInt(0, sol.partition[secondCluster].length-1);
			var secondNodeValue = Util.removeFromArray(sol.partition[secondCluster], secondNode);
			sol.partition[firstCluster].push(secondNodeValue);
			sol.value = _evaluateSwap(sol, firstCluster, firstNodeValue, secondCluster, secondNodeValue);
			sol.movement = { fromClusterNodeA : firstCluster, toClusterNodeA : secondCluster, nodeA: node, nodeB: secondNode };

		} else {
			sol.lengthClusters.min = min;
			sol.lengthClusters.max = max;
			sol.value = _evaluatePickndrop(sol, firstCluster, firstNodeValue, secondCluster);
			sol.movement = { fromClusterNodeA : firstCluster, toClusterNodeA : secondCluster, nodeA: node, nodeB: null };
		}

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
					postMessage({
						isUpdate: false,
						partition: clusters
					});
				} else {
					postMessage({
						isUpdate: true,
						partition: clusters
					});
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


var SimulatedAnnealingPartionningSolver = (function () {
    var coolingFactor,
        stabilizingFactor,
        freezingTemperature,
        maximumIteration,
        currentIteration,
        currentTemperature,
        currentStabilizer,
        maximumSolStability,
        currentSolStability,
        nbCluster,
        tolerance,
        
        // fonctions
        generateSolution,
        generateNeighbor,
        // solution initiale
        currentSolution,
        currentPartition,

        drawGraph;

    function _init(options) {
        coolingFactor            = options.coolingFactor          || 0.95;
        stabilizingFactor        = options.stabilizingFactor      || 1.005;
        freezingTemperature      = options.freezingTemperature    || 0.01;
        maximumIteration         = options.maximumIteration       || 100.0;
        currentIteration         = options.currentIteration       || 0.0;
        currentTemperature       = options.initialTemperature     || 50.0;
        currentStabilizer        = options.initialStabilizer      || 50.0;
        maximumSolStability      = options.maximumSolStability    || 50.0;
        currentSolStability      = options.initialSolStability    || 0.0;
        nbCluster                = options.nbCluster              || 2;
        tolerance                = options.tolerance              || 1;

        // fonctions
        generateSolution         = options.generateSolution;
        generateNeighbor         = options.generateNeighbor;
        // solution initiale
        currentSolution          = generateSolution(nbCluster);
        currentPartition         = Util.copy(currentSolution);

        drawGraph                = (options.drawGraph && options.callback) || false;
    }

    function _updateSolution(solution) {
    	currentSolution = Util.copy(solution);
    	if (drawGraph) {
    		postMessage({
				isUpdate: true,
				partition: currentSolution.partition
			});
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
			postMessage({
				isUpdate: false,
				partition: currentSolution.partition
			});
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
		}, 150);
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

onmessage = function(e) {
	Graph.deserialize(e.data.graph);
	PartitionningSolver.resolve(e.data.options);
}
