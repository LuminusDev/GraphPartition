'use strict';

/**
seedrandom.js
=============

Seeded random number generator for Javascript.

version 2.3.10
Author: David Bau
Date: 2014 Sep 20
**/
!function(a,b,c,d,e,f,g,h,i){function j(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=s&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=s&f+1],c=c*d+h[s&(h[f]=h[g=s&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function k(a,b){var c,d=[],e=typeof a;if(b&&"object"==e)for(c in a)try{d.push(k(a[c],b-1))}catch(f){}return d.length?d:"string"==e?a:a+"\0"}function l(a,b){for(var c,d=a+"",e=0;e<d.length;)b[s&e]=s&(c^=19*b[s&e])+d.charCodeAt(e++);return n(b)}function m(c){try{return o?n(o.randomBytes(d)):(a.crypto.getRandomValues(c=new Uint8Array(d)),n(c))}catch(e){return[+new Date,a,(c=a.navigator)&&c.plugins,a.screen,n(b)]}}function n(a){return String.fromCharCode.apply(0,a)}var o,p=c.pow(d,e),q=c.pow(2,f),r=2*q,s=d-1,t=c["seed"+i]=function(a,f,g){var h=[];f=1==f?{entropy:!0}:f||{};var o=l(k(f.entropy?[a,n(b)]:null==a?m():a,3),h),s=new j(h);return l(n(s.S),b),(f.pass||g||function(a,b,d){return d?(c[i]=a,b):a})(function(){for(var a=s.g(e),b=p,c=0;q>a;)a=(a+c)*d,b*=d,c=s.g(1);for(;a>=r;)a/=2,b/=2,c>>>=1;return(a+c)/b},o,"global"in f?f.global:this==c)};if(l(c[i](),b),g&&g.exports){g.exports=t;try{o=require("crypto")}catch(u){}}else h&&h.amd&&h(function(){return t})}(this,[],Math,256,6,52,"object"==typeof module&&module,"function"==typeof define&&define,"random");

var DEBUG = true;

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
		},
	}
}());

var Movement = (function () {
	return {
		//Vérifie que l'on ne revient pas sur une solution visitée avec un mouvement
		compareMovement : function(movA, movB) {
			return 	movA.fromClusterA != movB.toClusterNodeA && 
				movA.toClusterNodeA != movB.fromClusterA &&
				movA.nodeA != movB.nodeA &&
				movA.nodeB != movB.nodeB;		
		},

		searchMovement : function(array, movement){
			if(array.length == 0){
				return false;
			}
			
			for(var i=0; i<array.length; i++){
				if(Movement.compareMovement(array[i], movement)){
					return true;
				}
			}
			return false;
		},
		
		addMovement: function (array, id, size, movement){
			array[id%size]=movement;
		}
	}
}());

interact('#logs')
	.resizable({
		edges: { left: false, right: false, bottom: false, top: true }
	})
	.on('resizemove', function (event) {
		event.target.style.height = event.rect.height + 'px';
});

//
var C = (function () {
	var cssLabel = "color: #3F51B5;",
		cssValue = "color: #000; font-weight: 700;",
		cssSep = "background: #DDD; color: #111; font-weight: 700;",
		sep = "--------------------------",

		logElement = document.getElementById("logs");

	function _sep() {
		console.log("%c%s",cssSep,sep);
		_addLog([sep], "info", [cssSep]);
	}

	function _addLog(text, type, css) {
		type = type || "info";
		var log = document.createElement('p');
		log.classList.add('logline');
		
		var logmeta = document.createElement('span');
		logmeta.classList.add('logmeta');
		logmeta.classList.add('log'+type);
		var d = new Date();
		logmeta.innerHTML = "["+d.toLocaleTimeString()+"] > ";
		log.appendChild(logmeta);

		for (var i = 0; i < text.length; i++) {
			var logdata = document.createElement('span');
			if (css != undefined) {
				logdata.style.cssText = ";"+css[i];
			}
			logdata.innerHTML = text[i];
			log.appendChild(logdata);
		}
		logElement.appendChild(log);
	}
	
	return {
		log: function(text) {
			console.log(text);
			_addLog([text], "info");
		},
		debug: function(text) {
			if (DEBUG) {
				console.log(text);
				_addLog([text], "debug");
			}
		},
		error: function(text) {
			console.error(text);
			_addLog([text], "error");	
		},
		warning: function(text) {
			console.warn(text);
			_addLog([text], "warning");	
		},
		line: function(label, value) {
			console.log("%c%s : %c%s", cssLabel, label, cssValue, value);
			_addLog([label," : ",value], "info", [cssLabel, cssLabel, cssValue]);
		},
		openDiv: function(text) {
			console.log("%c%s",cssSep,text);
			_addLog([text],"info",[cssSep]);
			_sep();
		},
		closeDiv :function() {
			_sep();
		}
	}
}());

var FormController = (function () {
	var formElement = document.getElementById("form-solver"),
		form = document.forms["form-solver"],
		allMethods = form.querySelectorAll(".method");

	//Get data form and default values
	function _getOptionsValues() {
		return {
			repetition             : form.elements["nbRepetition"].value           || 1,
	 		drawGraph              : form.elements["drawGraph"].checked            || false,
	 		nbCluster              : form.elements["nbCluster"].value              || 2,
	 		tolerance              : form.elements["tolerance"].value              || 1,
	 		method                 : form.elements["method"].value                 || 1,
	 		neighborhood           : form.elements["neighborhood"].value           || 1,
    
    		initialTemperature     : form.elements["initialTemperature"].value     || 50,
    		freezingTemperature    : form.elements["freezingTemperature"].value    || 0.01,
    		coolingFactor          : form.elements["coolingFactor"].value          || 0.99,
    		maximumIteration       : form.elements["maximumIteration"].value       || 500,
    		maximumSolStability    : form.elements["maximumSolStability"].value    || 50,
    		initialStabilizer      : form.elements["initialStabilizer"].value      || 50,
    		stabilizingFactor      : form.elements["stabilizingFactor"].value      || 1.005,

    		maximumIterationDescent: form.elements["maximumIterationDescent"].value|| 100,

    		maximumIterationTaboo  : form.elements["maximumIterationTaboo"].value  || 100,
    		fileSizeTaboo          : form.elements["fileSizeTaboo"].value		   || 20,
    
			sizePopulation         : form.elements["sizePopulation"].value         || 100,
			maximumIterationGA     : form.elements["maximumIterationGA"].value     || 100,
			nbMutationByGeneration : form.elements["nbMutationByGeneration"].value || 1,
			crossoverProbability   : form.elements["crossoverProbability"].value   || 0.7,
			factorStretching       : form.elements["factorStretching"].value       || 1,
		}
	}

 	// Resolve the problem and draw the solution after form submit
	function _onsubmit(e) {
		e.preventDefault();
		var solution = PartitionningSolver.resolve(_getOptionsValues());
	}

	function _changeMethod(e) {
		e.preventDefault();

		var selected;
		switch (form.elements["method"].value) {
			case "0": 
				selected = null; break;
			case "1":
				selected = document.getElementById("gradient-descent");; break;
			case "2":
				selected = document.getElementById("simulated-annealing"); break;
			case "3":
				selected = document.getElementById("taboo-search"); break;
			case "4":
				selected = document.getElementById("genetic-algorithm"); break;
		}
		for(var i = 0;i < allMethods.length; i++) {
			allMethods[i].classList.remove("selected");
		}
		if (selected != null) {
			selected.classList.add("selected");
		}

	}

	function _setDisabled(disabled) {
		document.getElementById("resolve").disabled = disabled;
	}

	return {
		submit: function(e) {
			_onsubmit(e);
		},
		changeMethod: function(e) {
			_changeMethod(e);
		},
		setDisabled: function(disabled) {
			_setDisabled(disabled);
		}
	}
}());
document.getElementById('form-solver').addEventListener('submit', FormController.submit, false);
document.getElementById('select-method').addEventListener('change', FormController.changeMethod, false);


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

	function _addStatistics(name, time, solutionValue, informations) {
		Statistics.add(name, {
			time         : time,
			value        : solutionValue,
			informations : informations
		});
		StatisticsDrawerD3.update();
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
			{name: "Enumération", instance: EnumeratePartitionningSolver},
			{name: "Descente de gradient", instance: GradientDescentPartitionningSolver},
			{name: "Recuit simulé", instance: SimulatedAnnealingPartitionningSolver},
			{name: "Recherche Tabou", instance: TabooSearchPartitionningSolver},
			{name: "Algorithme génétique", instance: GeneticPartitionningSolver}
		];
		solver = methods[options.method];

		var neighborhoodsRandom = [
			GraphPartition.random_swap,
			GraphPartition.random_pickndrop,
		];
		var bestNeighbor = [
			GraphPartition.best_neighbor_swap,
			GraphPartition.best_neighbor_pickndrop,
		];
		options.generateNeighbor =
			options.method == 1 || options.method == 3 ?
				bestNeighbor[options.neighborhood] :
				neighborhoodsRandom[options.neighborhood];

		options.generateSolution = GraphPartition.generateRandomSolution;

		if (options.repetition <= 1) {
			if (!DEBUG) {
				options.generateNeighbor = null;
				options.generateSolution = null;
				var myWorker = new Worker("worker.js");
				myWorker.postMessage({graph: Graph.serialize(), options: options});
				myWorker.onmessage = function(e) {
					if (e.data.isTerminated) {
						GraphDrawerD3.isTerminated();
						_showResults(solver.name, e.data.solution);
					} else if (e.data.partition) {
						if (e.data.isUpdate) {
							GraphDrawerD3.update(e.data.partition);
						} else {
							GraphDrawerD3.draw(e.data.partition);
						}
					}
				};
			} else {
				if (options.drawGraph) {
					var callback = function(solution){
						GraphDrawerD3.isTerminated();
						_showResults(solver.name, solution);
					};
					options.callback = callback;
				}
				solution = solver.instance.resolve(options);
				if (solution.value !== null) {
					solution.informations["nbNodes"] = {label:"Nombre de sommet", value:Graph.getNodesLength()};
					solution.informations["nbCluster"] = {label:"Nombre de classe", value:options.nbCluster};
					solution.informations["totalTime"] = {label:"Temps d'exécution (ms)", value:Performance.getLastTime()};
					_showResults(solver.name, solution);
					_addStatistics(
						solver.name,
						solution.informations["totalTime"].value,
						solution.value,
						solution.informations
					);
				}
			}
		} else {
			if (options.drawGraph) {
				C.warning("L'affichage du graphe est désactivé lorsque le nombre de simulation est supérieur à 1.");
			}
			var results = {
				value        : null,
				partition    : null,
				informations : {
					nbNodes    : {label:"Nombre de sommet", value:Graph.getNodesLength()},
					nbCluster  : {label:"Nombre de classe", value:options.nbCluster},
					repetition : {label:"Nombre de simulation", value:options.repetition},
					totalTime  : {label:"Temps d'exécution total (ms)", value:0},
					averageTime: {label:"Temps d'exécution moyen (ms)", value:0},
					firstView  : {label:"Première apparition de la meilleure solution", value:null},
					nbView     : {label:"Nombre d'apparition de la meilleure solution", value:0},
				}
			};
			for (var i = 0; i < options.repetition; i++) {
				solution = solver.instance.resolve(options);

				var time = Performance.getLastTime();

				results.informations.totalTime.value += time;
				if (solution.value !== null) {
					if (solution.value < results.value || results.value === null) {
						results.value = solution.value;
						results.partition = Util.copy(solution.partition);
						results.informations.firstView.value = i+1;
						results.informations.nbView.value = 1;
					} else if (solution.value == results.value) {
						results.informations.nbView.value++;
					}
					solution.informations["nbNodes"] = {label:"Nombre de sommet", value:Graph.getNodesLength()};
					solution.informations["nbCluster"] = {label:"Nombre de classe", value:options.nbCluster};
					_addStatistics(
						solver.name,
						time,
						solution.value,
						solution.informations
					);
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

		FormController.setDisabled(true);
		if (file) {
			var r = new FileReader();
			r.onload = function(evt){
				_parseFile(evt);
				FormController.setDisabled(false);
			}
			r.onerror = function() {
				C.error("Echec de chargement du fichier");
			}
			r.readAsText(file);
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
			Graph.addLink(edge[0]-1, edge[1]-1, {
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
    		return file != null;
    	}
    };
}());
document.getElementById('fileinput').addEventListener('change', FileParser.load, false);

var Graph = (function () {
	var nodes = {},
	    links = {},
	    linksMatrice = [];

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
		addLink: function(first, second, l) {
			links[_getLinkIndex(first, second)] = l;
			if (linksMatrice[first] === undefined) {
				linksMatrice[first] = [];
			}
			linksMatrice[first][second] = l;
			if (linksMatrice[second] === undefined) {
				linksMatrice[second] = [];
			}
			linksMatrice[second][first] = l;
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
		getLinkWeight: function(first, second) {
			return linksMatrice[first] !== undefined ? linksMatrice[first][second] !== undefined ? linksMatrice[first][second].weight : 0 : 0;
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
    		linksMatrice = [];
    	},
    	serialize: function() {
    		return {nodes:nodes, links:links, linksMatrice:linksMatrice};
    	},
    	deserialize: function(graph) {
    		nodes = graph.nodes;
    		links = graph.links;
    		linksMatrice = graph.linksMatrice;
    	}
	}
}());


var GraphPartition = (function () {

	function _generateSolution(nbCluster) {
		var solution = EnumeratePartionningSolver.getFirstSolution(nbCluster);
		solution.lengthClusters = _minAndMaxClusterList(solution.partition, nbCluster);
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
		solution.lengthClusters = _minAndMaxClusterList(solution.partition, nbCluster);
		return solution;
	}

	function _minAndMaxClusterList(list, nbCluster) {
		var tmp, min, max,
	    	i;
	    min = max = list[0] !== undefined ? list[0].length : 0;
	    for (i = 0; i < nbCluster; i++) {
	    	tmp = list[i] !== undefined ? list[i].length : 0;
	    	if (tmp > max) {
	    		max = tmp;
	    	} else if (tmp < min) {
	    		min = tmp;
	    	}
	    }
		return {min: min, max: max};
	}

	function _minAndMaxClusterArray(array, nbCluster) {
		var counts = {},
	    	tmp, min, max,
	    	i;
	    for (i = 0; i < array.length; i++) {
    		counts[array[i]] = (counts[array[i]] || 0) + 1;
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


	function _swap(solution, firstCluster, firstNode, secondCluster, secondNode){
		var sol = Util.copy(solution);

		var firstNodeValue = sol.partition[firstCluster][firstNode];
		var secondNodeValue = sol.partition[secondCluster][secondNode];

		sol.partition[firstCluster][firstNode] = secondNodeValue;
		sol.partition[secondCluster][secondNode] = firstNodeValue;

		sol.value = _evaluateSwap(sol, firstCluster, firstNodeValue, secondCluster, secondNodeValue);
		sol.movement = { fromClusterNodeA : firstCluster, toClusterNodeA : secondCluster, nodeA: firstNode, nodeB: secondNode };
		return sol;
	}

	function _random_swap(solution) {

		var firstCluster = Util.randomInt(0, solution.partition.length-1);
		var firstNode = Util.randomInt(0, solution.partition[firstCluster].length-1);
		var secondCluster = Util.randomInt(0, solution.partition.length-2);
		if (secondCluster >= firstCluster) {
			secondCluster++;
		}
		var secondNode = Util.randomInt(0, solution.partition[secondCluster].length-1);

		if (solution.partition[firstCluster].length === 0 || solution.partition[secondCluster].length === 0) {
			return Util.copy(solution);
		}

		return _swap(solution, firstCluster, firstNode, secondCluster, secondNode);
	}

	function _pickndrop(solution, firstCluster, firstNode, secondCluster, secondNode, options){
		var sol = Util.copy(solution);

		var firstNodeValue = Util.removeFromArray(sol.partition[firstCluster], firstNode);
		if (sol.partition[secondCluster] === undefined) {
			sol.partition[secondCluster] = [];
		}
		sol.partition[secondCluster].push(firstNodeValue);

		var min = Math.min(sol.lengthClusters.min, sol.partition[firstCluster].length);
		var max = Math.max(sol.lengthClusters.max, sol.partition[secondCluster].length);
		
		// si la tolérance n'est pas respectée, on continue sur un swap
		if ((max-min) > options.tolerance) {
			var secondNodeValue = Util.removeFromArray(sol.partition[secondCluster], secondNode);
			sol.partition[firstCluster].push(secondNodeValue);
			sol.value = _evaluateSwap(sol, firstCluster, firstNodeValue, secondCluster, secondNodeValue);
			sol.movement = { fromClusterNodeA : firstCluster, toClusterNodeA : secondCluster, nodeA: firstNode, nodeB: secondNode };

		} else {
			sol.lengthClusters.min = min;
			sol.lengthClusters.max = max;
			sol.value = _evaluatePickndrop(sol, firstCluster, firstNodeValue, secondCluster);
			sol.movement = { fromClusterNodeA : firstCluster, toClusterNodeA : secondCluster, nodeA: firstNode, nodeB: null };
		}
		return sol;
	}


	function _random_pickndrop(solution, options) {

		var firstCluster = Util.randomInt(0, solution.partition.length-1);
		var firstNode = Util.randomInt(0, solution.partition[firstCluster].length-1);
		var secondCluster = Util.randomInt(0, solution.partition.length-2);
		if (secondCluster >= firstCluster) {
			secondCluster++;
		}
		var secondNode = Util.randomInt(0, solution.partition[secondCluster].length-1);
		
		return _pickndrop(solution, firstCluster,firstNode, secondCluster, secondNode, options);
	}


	function _evaluateSwap(solution, firstCluster, firstNodeValue, secondCluster, secondNodeValue) {
		var valueSolution = solution.value,
			i = 0,
			min, max, index;

		for (i = 0; i < solution.partition[firstCluster].length; i++) {
			//First Node : + links old cluster
			valueSolution += Graph.getLinkWeight(firstNodeValue, solution.partition[firstCluster][i]);
			//Second Node : - links new cluster
			valueSolution -= Graph.getLinkWeight(secondNodeValue, solution.partition[firstCluster][i]);
		}
		for (i = 0; i < solution.partition[secondCluster].length; i++) {
			//First Node : - links new cluster
			valueSolution -= Graph.getLinkWeight(firstNodeValue, solution.partition[secondCluster][i]);
			//Second Node : + links old cluster
			valueSolution += Graph.getLinkWeight(secondNodeValue, solution.partition[secondCluster][i]);
		}

		// -2 fois link between a and b
		valueSolution -= 2*Graph.getLinkWeight(firstNodeValue, secondNodeValue);

		return valueSolution;
	}

	function _evaluatePickndrop(solution, firstCluster, firstNodeValue, secondCluster) {
		var valueSolution = solution.value,
			i = 0,
			index;

		for (i = 0; i < solution.partition[firstCluster].length; i++) {
			//First Node : + links old cluster
			valueSolution += Graph.getLinkWeight(firstNodeValue, solution.partition[firstCluster][i]);
		}
		// length-1, pas besoin de vérifier le sommet avec lui même
		for (i = 0; i < solution.partition[secondCluster].length-1; i++) {
			//First Node : - links new cluster
			valueSolution -= Graph.getLinkWeight(firstNodeValue, solution.partition[secondCluster][i]);
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
								valueSolution += Graph.getLinkWeight(partition[i][j], partition[k][l]);
							}
						}
					}
				}
			}
		}
		return valueSolution;
	}

	function _evaluateArray(array) {
		var valueSolution = 0,
			index,
			i = 0, j = 0;
		for (i = 0; i < array.length-1; i++) {
			for (j = i+1; j < array.length; j++) {
				if (array[i] !== array[j]) {
					valueSolution += Graph.getLinkWeight(i, j);
				}
			}
		}
		return valueSolution;
	}

	function _listToArray(list) {
		var j, k,
    		item = [];
		for (j = 0; j < list.length; j++) {
			for (k = 0; k < list[j].length; k++) {
				item[list[j][k]] = j;
			}
		}
		return item;
	}

	function _arrayToList(array, nbCluster) {
		var i,
			list = [];
		for (i = 0; i < array.length; i++) {
			if (list[array[i]] === undefined) {
				list[array[i]] = [];
			}
			list[array[i]].push(i);
		}
		for (i = 0; i < nbCluster; i++) {
			if (list[i] === undefined) {
				list[i] = [];
			}
		}
		return list;
	}

	function _searchNeighbor_swap(bestSolution, nbCluster, taboo){
		var solution = Util.copy(bestSolution);

		for(var firstCluster=0; firstCluster < nbCluster; firstCluster++){
			for(var secondCluster=firstCluster+1; secondCluster < nbCluster; secondCluster++){
				for(var firstNode=0; firstNode< bestSolution.partition[firstCluster].length; firstNode++){
					for(var secondNode=0; secondNode< bestSolution.partition[secondCluster].length; secondNode++){
						var tmpSolution = _swap(bestSolution, firstCluster, firstNode, secondCluster, secondNode);
						if(tmpSolution.value < solution.value && !Movement.searchMovement(taboo, tmpSolution.movement)){
							solution = tmpSolution;
						}
					}
				}
			}
		}
		return solution;
	}

	function _searchNeighbor_pickndrop(bestSolution, nbCluster , options, taboo){
		var solution = Util.copy(bestSolution);

		for(var firstCluster=0; firstCluster < nbCluster; firstCluster++){
			for(var secondCluster=firstCluster+1; secondCluster < nbCluster; secondCluster++){
				for(var firstNode=0; firstNode< bestSolution.partition[firstCluster].length; firstNode++){
					for(var secondNode=0; secondNode< bestSolution.partition[secondCluster].length; secondNode++){
						
						//On tente un pickndrop du premier cluster vers le second
						var tmpSolution = _pickndrop(bestSolution, firstCluster, firstNode, secondCluster, secondNode, options);
						if(tmpSolution.value < solution.value  && !Movement.searchMovement(taboo, tmpSolution.movement)){
							solution = tmpSolution;
						}

						if(tmpSolution.movement.nodeB == null){ //Il n'y a pas eu de swap on fait donc aussi l'opération du second cluster vers le premier

							if(firstNode < bestSolution.partition[secondCluster].length && firstNode < bestSolution.partition[firstCluster].length-1){
								var tmpSolution = _pickndrop(bestSolution, secondCluster, firstNode, firstCluster, secondNode, options);
								if(tmpSolution.value < solution.value  && !Movement.searchMovement(taboo, tmpSolution.movement)){
									solution = tmpSolution;
								}
							} 
							else if(firstNode < bestSolution.partition[secondCluster].length && firstNode == bestSolution.partition[firstCluster].length-1){
								for(var node = firstNode; node <  bestSolution.partition[secondCluster].length; node++){
									var tmpSolution = _pickndrop(bestSolution, secondCluster, firstNode, firstCluster, secondNode, options);
									if(tmpSolution.value < solution.value  && !Movement.searchMovement(taboo, tmpSolution.movement)){
										solution = tmpSolution;
									}
								}
							}
							break; //pas de swap, pas la peine de parcourir les second voisins
						}
					}
				}
			}
		}
		return solution;
	}


	return {
		random_swap: function(solution) {
			return _random_swap(solution);
		},
		random_pickndrop: function(solution, options) {
			return _random_pickndrop(solution, options);
		},
		swap: function(solution, firstCluster, firstNode, secondCluster, secondNode){
			return _swap(solution, firstCluster, firstNode, secondCluster, secondNode);
		},
		pickndrop: function(solution, firstCluster, firstNode, secondCluster, secondNode, options){
			return _pickndrop(solution, firstCluster, firstNode, secondCluster, secondNode, options);
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
		evaluateArray: function(array) {
			return _evaluateArray(array);
		},
		minAndMaxClusterArray: function(array, nbCluster) {
			return _minAndMaxClusterArray(array, nbCluster);
		},
		listToArray: function(list) {
			return _listToArray(list);
		},
		arrayToList: function(array, nbCluster) {
			return _arrayToList(array, nbCluster);
		},
		best_neighbor_swap : function(bestSolution, nbClusters, taboo){
			return _searchNeighbor_swap(bestSolution, nbClusters, taboo);
		},
		best_neighbor_pickndrop : function(bestSolution, nbClusters, options, taboo){
			return _searchNeighbor_pickndrop(bestSolution, nbClusters, options, taboo);
		}
	}
}());

var EnumeratePartitionningSolver = (function () {

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
	    var nbClusters = GraphPartition.minAndMaxClusterArray(solution, _nbCluster);
	    return (nbClusters.max - nbClusters.min) <= _tolerance;
	}

	function _evaluate(solution) {
		var valueSolution,
			clusters = [],
			i = 0;
		valueSolution = GraphPartition.evaluateArray(solution);
		if (_bestSolution.value === null || valueSolution < _bestSolution.value) {
			// creation des clusters sous la forme ([0,1],[2,3]...)
			for (i = 0; i < _nbNodes; i++) {
				if (clusters[solution[i]] === undefined) {
					clusters[solution[i]] = [];
				}
				clusters[solution[i]].push(i);
			}
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


var GradientDescentPartitionningSolver = (function () {
	var _nbCluster,
	    _bestSolution,
	    _nbIteration,
	    _nbIterationMax,
	    _tolerance,
	    
	    ///fonction
	    _generateSolution,
	    _searchNeighbor,
        _options,
	    _drawGraph;
	    
	
	function _init(options) {
		_options                = options;
		_nbCluster 		        = options.nbCluster;
		_generateSolution	    = options.generateSolution;
		_searchNeighbor		    = options.generateNeighbor;
		_nbIteration            = 0;
		_nbIterationMax		    = options.maximumIterationDescent || _nbIterationMax;
        _tolerance 		        = options.tolerance || 1;
		
		// solution initiale
		_bestSolution     = _generateSolution(_nbCluster);
		_drawGraph        = (options.drawGraph && options.callback) || false;
	}

	function _updateSolution(solution) {
		_bestSolution = Util.copy(solution);
		if (_drawGraph) {
			GraphDrawerD3.update(_bestSolution.partition);
		}
	}	

	function _doGradientDescentStep(){
		_nbIteration++;

		var currentSolution = _searchNeighbor(_bestSolution, _nbCluster, {tolerance: _tolerance}, []);
		
		if( currentSolution.value < _bestSolution.value ) {
			_updateSolution(currentSolution);
		} else {
			return false;
		}
		return _nbIteration < _nbIterationMax;
	}

						
	function _resolve(options){
		_init(options);

		if (_drawGraph) {
			GraphDrawerD3.draw(_bestSolution.partition);
			_runResolveRecursion(options.callback);
			return {value: null};
		} else {
			// resolve with performance showed
			Performance.duration(_runResolve);
			return _solutionWithInformations();
		}
	}

	function _runResolve() {
		while (_doGradientDescentStep());
	}

	function _runResolveRecursion(callback) {
		setTimeout(function(){
			if (_doGradientDescentStep()) {
				_runResolveRecursion(callback);
			} else {
				callback(_solutionWithInformations());
			}
		}, 150);
	}

	function _solutionWithInformations() {
		var informations = {
			nbIteration: {label:"Nombre d'itérations", value:_nbIterationMax},
		};
		_bestSolution.informations = informations;
		return _bestSolution;
	}
	
	return {
		initialize: function(options) {
			_init(options);
		},

		step: function() {
			return _doGradientDescentStep();
		},

		resolve: function(options) {
			return _resolve(options);
		}
	};
})();



var TabooSearchPartitionningSolver = (function () {
	var _nbCluster,
		_currentSolution,
	    _bestSolution,
	    _nbIteration,
	    _nbIterationMax,
	    _tolerance,
	    _taboo,
	    _maxfileSizeTaboo,
	    ///fonction
	    _generateSolution,
	    _searchNeighbor,
        _options,
        _id,
	    _drawGraph;
	    
	
	function _init(options) {
		_options                = options;
		_nbCluster 		        = options.nbCluster;
		_generateSolution	    = options.generateSolution;
		_searchNeighbor		    = options.generateNeighbor;
		_nbIteration            = 0;
		_nbIterationMax		    = options.maximumIterationTaboo || 100;
		_maxfileSizeTaboo  	    = options.fileSizeTaboo ;
        _tolerance 		        = options.tolerance || 1;
        _taboo                  = [];
        _id					    = -1;
		
		// solution initiale
		_bestSolution     = _generateSolution(_nbCluster);
		_currentSolution  = _bestSolution;
		_drawGraph        = (options.drawGraph && options.callback) || false;
	}

	function _updateSolution(solution) {
		_currentSolution = Util.copy(solution);
		if(_currentSolution.value < _bestSolution.value){
			_bestSolution = _currentSolution;
		}
		if (_drawGraph) {
			GraphDrawerD3.update(_currentSolution.partition);
		}
	}	

	function _doTabooSearchStep(){
		_nbIteration++;

		var solution = _searchNeighbor(_currentSolution, _nbCluster, {tolerance: _tolerance}, _taboo);
		
		_updateSolution(solution);
		Movement.addMovement(_taboo, _id++, _maxfileSizeTaboo, solution.movement);
		return _nbIteration < _nbIterationMax;
	}

	function _solutionWithInformations() {
		var informations = {
			nbIteration: {label:"Nombre d'itérations", value:_nbIterationMax},
			sizeTaboo: {label:"Taille max liste Taboo", value:_maxfileSizeTaboo},
		};
		_bestSolution.informations = informations;
		return _bestSolution;
	}
						
	function _resolve(options){
		_init(options);

		if (_drawGraph) {
			GraphDrawerD3.draw(_currentSolution.partition);
			_runResolveRecursion(options.callback);
			return {value: null};
    		} else {
	    		// resolve with performance showed
			Performance.duration(_runResolve);
			return _solutionWithInformations();
    		}
	}

        function _runResolve() {
    		while (_doTabooSearchStep());
   	}

   	function _runResolveRecursion(callback) {
		setTimeout(function(){
			if (_doTabooSearchStep()) {
				_runResolveRecursion(callback);
			} else {
				callback(_solutionWithInformations());
			}
		}, 150);
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


var SimulatedAnnealingPartitionningSolver = (function () {
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

		_options,

		drawGraph;

    function _init(options) {
		_options                 = options;
		coolingFactor            = options.coolingFactor          || 0.95;
		stabilizingFactor        = options.stabilizingFactor      || 1.005;
		freezingTemperature      = options.freezingTemperature    || 0.01;
		maximumIteration         = options.maximumIteration       || 100.0;
		currentIteration         = options.currentIteration       || 0.0;
		currentTemperature       = options.initialTemperature     || 50.0;
		currentStabilizer        = options.initialStabilizer      || Graph.getNodesLength();
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
		}, 150);
	}

	function _solutionWithInformations() {
		var informations = {
			nbIteration: {label:"Nombre d'itérations", value:currentIteration},
			initialTemp: {label:"Température initiale", value:_options.initialTemperature},
			coolingFactor: {label:"Facteur de refroidissement", value:_options.coolingFactor},
			maximumSolStability: {label:"Seuil de stabilité", value:_options.maximumSolStability},
			freezingTemperature: {label:"Température de gel", value:freezingTemperature}
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

var GeneticPartitionningSolver = (function () {
	// population sous la forme de tableau de solution
    var population,
    	sizePopulation,
    	fitnessTotal,
    	// {value, indexItem}
    	fitnessMin,
    	fitnessMax,
    	fitnessAverage,

    	matingPool,

        maximumIteration,
        currentIteration,
        nbCluster,
        tolerance,

        nbMutationByGeneration,
        crossoverProbability,
        factorStretching,
        
        // fonctions
        generateSolution,
        generateMutation,

        drawGraph;

    function _init(options) {
        sizePopulation           = options.sizePopulation         || 100;
        maximumIteration         = options.maximumIterationGA     || 100;
        currentIteration         = options.currentIteration       || 0;
        nbCluster                = options.nbCluster              || 2;
        tolerance                = options.tolerance              || 1;

        nbMutationByGeneration   = options.nbMutationByGeneration || 1;
        crossoverProbability     = options.crossoverProbability   || 0.7;
        factorStretching         = options.factorStretching       || 1;

        // fonctions
        generateSolution         = options.generateSolution;
        generateMutation         = options.generateNeighbor;

        drawGraph                = (options.drawGraph && options.callback) || false;

        _initPopulation();
    }

    function _initPopulation() {
    	var i, j, k,
    		solution,
    		item;
    	population = [];
    	for (i = 0; i < sizePopulation; i++) {
    		solution = generateSolution(nbCluster);
    		item = GraphPartition.listToArray(solution.partition);
    		solution.item = item;
    		solution.partition = null;
    		population.push(Util.copy(solution));
    	}
    }

    function _updateDraw() {
    	if (drawGraph) {
			GraphDrawerD3.update(GraphPartition.arrayToList(population[fitnessMin.index].item, nbCluster));
		}
    }

    function _calculFitnesses() {
    	var i, tmp;
    	fitnessTotal = 0;
    	fitnessMin = null;
    	fitnessMax = null;
    	for (i = 0; i < sizePopulation; i++) {
    		tmp = population[i].value;
    		if (fitnessMin === null || tmp < fitnessMin.value) {
    			fitnessMin = {value:tmp, index:i};
    		}
    		if (fitnessMax === null || tmp > fitnessMax.value) {
    			fitnessMax = {value:tmp, index:i};
    		}
    	}
    	for (i = 0; i < sizePopulation; i++) {
    		population[i].fitness = fitnessMax.value - population[i].value + 1;
    		if (factorStretching > 0) {
    			population[i].fitness = Math.pow(population[i].fitness, factorStretching);
    		}
    		fitnessTotal += population[i].fitness;
    	}
    	fitnessAverage = fitnessTotal / sizePopulation;
    }

    function _createMatingPool() {
    	var i, j, floor, proba;
    	matingPool = [];
    	for (i = 0; i < sizePopulation; i++) {
    		proba = population[i].fitness / fitnessTotal * 100;
    		floor = Math.floor(proba);
    		for (j = 0; j < floor; j++) {
    			matingPool.push(i);
    		}
    		// résidu
    		if (Math.random() < (proba%1)) {
    			matingPool.push(i);
    		}
    	}
    }

    function _evaluateCrossover(child) {
    	var valueSolution = GraphPartition.evaluateArray(child.item);
    	child.value = valueSolution;
    }

    function _doCrossover(father, mother) {
    	// choose 2 points randomly
    	var firstPoint = Util.randomInt(0, father.item.length-2);
		var secondPoint = Util.randomInt(firstPoint, father.item.length-1);

		if (Math.random() > 1) {
			for (i = 0; i <= secondPoint-firstPoint; i++) {
				var tmp = father.item[firstPoint+i];
				father.item[firstPoint+i] = mother.item[firstPoint+i];
				mother.item[firstPoint+i] = tmp;
			}
			_evaluateCrossover(father);
	    	_evaluateCrossover(mother);

	    	father.lengthClusters = GraphPartition.minAndMaxClusterArray(father.item, nbCluster);
	    	mother.lengthClusters = GraphPartition.minAndMaxClusterArray(mother.item, nbCluster);
	    	if (father.lengthClusters.max - father.lengthClusters.min > tolerance) {
	    		if (father.lengthClusters.max - father.lengthClusters.min === tolerance + 1) {
	    			father.value = (father.value + 1) * 1.1;
	    		} else {
	    			father.value = (fitnessMax.value + 1) * 2;
	    		}
	    	}
	    	if (mother.lengthClusters.max - mother.lengthClusters.min > tolerance) {
	    		if (mother.lengthClusters.max - mother.lengthClusters.min === tolerance + 1) {
	    			mother.value = (mother.value + 1) * 1.1;
	    		} else {
	    			mother.value = (fitnessMax.value + 1) * 2;
	    		}
	    	}
		} else {
			var geneFather = father.item.slice(firstPoint, secondPoint+1);
			var geneFatherCopy = geneFather.slice(0);
			var geneMother = mother.item.slice(firstPoint, secondPoint+1);
			var geneMotherCopy = geneMother.slice(0);

			var blanckFather = [];
			var blanckMother = [];

			var i, j;

			for (i = 0; i <= secondPoint-firstPoint; i++) {
	    		var indexMother = geneMotherCopy.indexOf(geneFather[i]);
	    		var indexFather = geneFatherCopy.indexOf(geneMother[i]);

	    		if (indexMother !== -1) {
	    			mother.item[firstPoint+i] = geneFather[i];
	    			geneMotherCopy[indexMother] = -1;
	    		} else {
	    			blanckMother.push(firstPoint+i);
	    		}
	    		if (indexFather !== -1) {
	    			father.item[firstPoint+i] = geneMother[i];
	    			geneFatherCopy[indexFather] = -1;
	    		} else {
	    			blanckFather.push(firstPoint+i);
	    		}
	    	}
	    	for (i = 0; i < blanckFather.length; i++) {
	    		j = 0;
	    		while(geneFatherCopy[j] === -1){j++;};
	    		father.item[blanckFather[i]] = geneFatherCopy[j];
	    		geneFatherCopy[j] = -1;
	    	}
	    	for (i = 0; i < blanckMother.length; i++) {
	    		j = 0;
	    		while(geneMotherCopy[j] === -1){j++;};
	    		mother.item[blanckMother[i]] = geneMotherCopy[j];
	    		geneMotherCopy[j] = -1;
	    	}
	    	_evaluateCrossover(father);
	    	_evaluateCrossover(mother);
		}
    }

    function _selection() {
    	_calculFitnesses();
    	_createMatingPool();
    	_updateDraw();
    }

    function _crossover() {
    	var newPopulation = [],
    		i, sizeMatingPool, rand;
    	sizeMatingPool = matingPool.length;
    	for (i = 0; i < sizePopulation-1; i++) {
    		rand = Util.randomInt(0, sizeMatingPool-1);
    		newPopulation.push(Util.copy(population[matingPool[rand]]));
    		if (i%2 === 1) {
    			if (Math.random() < crossoverProbability) {
    				_doCrossover(newPopulation[i], newPopulation[i-1]);
    			}
    		}
    	}
    	// ajout de la meilleure solution de la dernière génération
    	newPopulation.push(Util.copy(population[fitnessMin.index]));
    	population = newPopulation;
    }

    function _mutation() {
    	var i, rand;
    	for (i = 0; i < nbMutationByGeneration; i++) {
    		rand = Util.randomInt(0, sizePopulation-1);
    		population[rand].partition = GraphPartition.arrayToList(population[rand].item, nbCluster);
    		population[rand] = generateMutation(population[rand], {tolerance: tolerance});
    		population[rand].item = GraphPartition.listToArray(population[rand].partition);
    		population[rand].partition = null;
    	}
    }

    function _doStep() {
    	if ((currentIteration++) < maximumIteration) {
    		_selection();
    		_crossover();
    		_mutation();
    		return true;
    	}
        return false;
    }

    function _resolve(options) {
    	_init(options);

    	if (drawGraph) {
    		_calculFitnesses();
			GraphDrawerD3.draw(GraphPartition.arrayToList(population[fitnessMin.index].item, nbCluster));
			_runResolveRecursion(options.callback);
			return {value: null};
    	} else {
	    	// resolve with performance showed
			Performance.duration(_runResolve);
			return _solutionWithInformations();
    	}
    }

    function _runResolve() {
    	while (_doStep());
    }

    function _runResolveRecursion(callback) {
		setTimeout(function(){
			if (_doStep()) {
				_runResolveRecursion(callback);
			} else {
				callback(_solutionWithInformations());
			}
		}, 150);
	}

    function _solutionWithInformations() {
    	_calculFitnesses();
    	var informations = {
    		sizePopulation: {label:"Taille population", value:sizePopulation},
    		maximumIteration: {label:"Maximum d'itération", value:maximumIteration},
    		nbMutationByGeneration: {label:"Mutation par génération", value:nbMutationByGeneration},
    		crossoverProbability: {label:"Probabilité de croisement", value:crossoverProbability},
    		factorStretching: {label:"Facteur d'étirement", value:factorStretching}
    	};
    	population[fitnessMin.index].informations = informations;
    	population[fitnessMin.index].partition = GraphPartition.arrayToList(population[fitnessMin.index].item, nbCluster);
    	return Util.copy(population[fitnessMin.index]);
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
	    	cx: 500,
	    	cy: 250
	    },
	    foci = [],
	    isTerminated;

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

		force.start();
	}

	function draw(partition) {

		remove();
		isTerminated = false;

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

		container.style("opacity", 1e-6)
		  .transition()
		    .duration(1000)
		    .style("opacity", 1)
		    .attr("transform", "translate(130,50)scale(0.7)");


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

		nodes.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

		if (isTerminated) {
			groups = d3.nest().key(function(d) { return d.group; }).entries(graphNodes);
			nbGroups = groups.length;
			
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
	}

	return {
		draw: function(partition){
			draw(partition);
		},
		update: function(partition){
			updateGraph(partition);
		},
		isTerminated: function(){
			isTerminated = true;
		}
	}
}());

var Statistics = (function(){
	var data = {};

	return {
		get: function() {
			return d3.values(data);
		},
		add: function(group, d) {
			if (data[group] === undefined) {
				data[group] = {
			      key: group,
			      values: []
			    };
			}
			data[group].values.push({
				x: d.time,
	      		y: d.value,
	      		informations: d.informations
			});
		},
		reset: function() {
			data = {};
		}
	}

}());

var StatisticsDrawerD3 = (function(){

	var chart = null,
		data;

	function _create() {
		nv.addGraph(function() {
			chart = nv.models.scatterChart()
		    		.width(500)
		    		.height(500)
		            .duration(350)
		            .color(d3.scale.category10().range());

			//Configure how the tooltip looks.
			chart.tooltipContent(function(key, x, y, c, object) {
			  var text = "";
			  for (var info in object.point.informations) {
			  	text += "<p><b>"+object.point.informations[info].label+"</b> : "+object.point.informations[info].value+"</p>";
			  }
			  return '<h3>' + key + '</h3>' + text;
			});

			//Axis settings
			chart.xAxis
				.axisLabel("Temps (ms)")
				.tickFormat(d3.format('.02f'));
			chart.yAxis
				.axisLabel("Valeur de la solution")
				.tickFormat(d3.format(',f'));

			data = Statistics.get();
			d3.select('#statistics svg')
			  .datum(data)
			  .call(chart);

			nv.utils.windowResize(chart.update);

			return chart;
		});
	}

	function _update() {
		if (chart === null) {
			_create();
		} else {
			data = Statistics.get();
			d3.select('#statistics svg')
			  .datum(data)
			  .call(chart);
			chart.update();
		}
	}

	function _clear() {
		if (chart !== null) {
			Statistics.reset();
			data = [{
				key : "Empty",
				values : [{x:1,y:1,informations:{}}]
			}];
			d3.select('#statistics svg')
			  .datum(data)
			  .call(chart);
			chart.update();
			d3.select('#statistics svg').append("text")
				.attr("x", "235")
				.attr("y", "250")
				.attr("dy", "-.7em")
				.attr("class", "nvd3 nv-noData")
				.style("text-anchor", "middle")
				.text("Aucune donnée à afficher");
		}
	}

	return {
		create: function() {
			_create();
		},
		update: function() {
			_update();
		},
		clear: function() {
			_clear();
		}
	}
}());
document.getElementById('statistics-clear').addEventListener('click', StatisticsDrawerD3.clear, false);