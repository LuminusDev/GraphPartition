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
	function _duration(name, callback){
		var begin = performance.now();
		callback();
		var end = performance.now();
		console.log(name + " perform in "+ (end - begin) + " ms.");
	}

	return {
		duration: function(name, callback) {
			_duration(name, callback);
		}
	}
}());

var FormController = (function () {
	var formElement = document.getElementById('form-solver'),
		form = document.forms["form-solver"];

	function _getFormValues() {
		return {
			nbCluster : form.elements["nbCluster"].value || 2,
			tolerance : form.elements["tolerance"].value || 1,
			method    : form.elements["method"].value    || 1
		}
	}

	function _onsubmit(e) {
		e.preventDefault();
		var formValues = _getFormValues();

		var solution;
		switch(formValues.method) {
			case "0":
				solution = EnumeratePartionningSolver.resolve(formValues.nbCluster, formValues.tolerance);
				break;
			case "1":
				solution = SimulatedAnnealingPartionningSolver.resolve({
					nbCluster       : formValues.nbCluster,
					generateSolution: GraphPartition.generateSolution,
					generateNeighbor: GraphPartition.swap
				});
				break;
			case "2":
				solution = GradientDescentSolver.resolve({
					nbCluster       : formValues.nbCluster,
					generateSolution: GraphPartition.generateSolution,
					generateNeighbor: GraphPartition.swap
				});
				break;
		}


		if (solution.value !== null) {
			console.log("Solution value : "+solution.value);
			console.log(solution)
			Graph.updateGroups(solution.partition);
			GraphDrawerD3.draw();
		}
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
		getLinkWeight: function(index) {
			return links[index].weight;
		},
		linkExist: function(index) {
			return links[index] !== undefined;
		},
		updateGroups: function(groups) {
    		_updateGroups(groups);
    	},
    	reset: function() {
    		nodes = {};
    		links = {};
    	}
	}
}());

var GraphPartition = (function () {

	function _generateSolution(nbCluster) {
		return EnumeratePartionningSolver.getFirstSolution(nbCluster);
	}

	function _swap(partition, nbCluster) {
		// [min, max)
		var getRandomInt = function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		var firstCluster = getRandomInt(0, partition.length-1);
		var firstNode = getRandomInt(0, partition[firstCluster].length-1);
		var secondCluster = getRandomInt(0, partition.length-2);
		if (secondCluster >= firstCluster) {
			secondCluster++;
		}
		var secondNode = getRandomInt(0, partition[secondCluster].length-1);

		var tmp = partition[firstCluster][firstNode];
		partition[firstCluster][firstNode] = partition[secondCluster][secondNode];
		partition[secondCluster][secondNode] = tmp;

		return {
			value: _evaluate(partition, nbCluster),
			partition: partition
		};
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
		swap: function(partition, nbCluster) {
			return _swap(partition, nbCluster);
		},
		generateSolution: function(nbCluster) {
			return _generateSolution(nbCluster);
		},
		evaluate: function(partition, nbCluster) {
			return _evaluate(partition, nbCluster);
		}
	}
}());

var EnumeratePartionningSolver = (function () {

	var _nbCluster,
		_nbNodes,
		_mean,
		_tolerance,
		_bestSolution,
		_stopFirstSolution;

	function _init(options) {
		_nbCluster = options.nbCluster;
		_tolerance = options.tolerance;
		_nbNodes = Graph.getNodesLength();
		_stopFirstSolution = options.stopFirstSolution || false;
		_mean = Math.ceil(_nbNodes / _nbCluster);
		_bestSolution = {
			value: null,
			partition: []
		};
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

	function _resolve(nbCluster, tolerance) {
		_init({
			nbCluster: nbCluster,
			tolerance: tolerance
		});

		// resolve with performance showed
		Performance.duration("Enumeration", _runResolve);

		return _bestSolution;
	}

	function _runResolve() {
		var current = {x:0, i:0, sol:[]};
		var countsol = 0;
	    while (1) {
	        if (current.x >= _nbNodes) {
	        	if (_isValidFinal(current.sol)) {
	            	_evaluate(current.sol.slice(0));
	            	if (_stopFirstSolution) {
	            		break;
	            	}
	        	}
	            current.i = (current.sol.pop() + 1);
	            current.x -= 1;
	        } else if (current.i > Math.min(current.x, _nbCluster-1)) {
	            if (current.x !== 0) {
	                current.i = (current.sol.pop() + 1);
	                current.x -= 1 ;
	            } else {
	            	break;
	            }
	        } else {
	            current.sol.push(current.i);
	            if (_isValidPartial(current.sol)) {
	            	current.x += 1;
	            	current.i = 0;
	            } else {
	            	current.i += 1;
	            	current.sol.pop();
	            }
	        }
	    }
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
	    var counts = {},
	    	tmp, min, max,
	    	i;
	    for (i = 0; i < solution.length; i++) {
    		counts[solution[i]] = (counts[solution[i]] || 0) + 1;
	    }
	    min = max = counts[0] !== undefined ? counts[0] : 0;
	    for (i = 0; i < _nbCluster; i++) {
	    	tmp = counts[i] !== undefined ? counts[i] : 0;
	    	if (tmp > max) {
	    		max = tmp;
	    	} else if (tmp < min) {
	    		min = tmp;
	    	}
	    }
	    return (max-min) <= _tolerance;
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
			_bestSolution.value = valueSolution;
			_bestSolution.partition = clusters;
		}
	}

	return {
		resolve: function(nbCluster, tolerance) {
			return _resolve(nbCluster, tolerance);
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
		Performance.duration("Gradient Descent", function(){
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
		Performance.duration("Taboo Search", function(){
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
    var coolingFactor            = 0.99,
        stabilizingFactor        = 1.005,
        freezingTemperature      = 2.0,
        maximumIteration         = 100.0,
        currentIteration         = 0.0,
        currentTemperature       = 50.0,
        currentStabilizer        = 50.0,
        currentPartition         = null,
        currentSolution          = null,
        nbCluster                = 2,
        
        // fonctions
        generateSolution         = null,
        generateNeighbor         = null;

    function _init(options) {
        coolingFactor            = options.coolingFactor || coolingFactor;
        stabilizingFactor        = options.stabilizingFactor || stabilizingFactor;
        freezingTemperature      = options.freezingTemperature || freezingTemperature;
        maximumIteration         = options.maximumIteration || maximumIteration;
        generateSolution         = options.generateSolution;
        generateNeighbor         = options.generateNeighbor;
        nbCluster                = options.nbCluster || nbCluster;

        // solution initiale
        currentSolution          = generateSolution(nbCluster);
        currentPartition         = currentSolution;
        currentTemperature       = options.initialTemperature || currentTemperature;
        currentStabilizer        = options.initialStabilizer || currentStabilizer;
    }

    function _metropolis(temperature, delta, neighbor) {
        if (delta < 0) {
            currentPartition = neighbor;
            if (neighbor.value < currentSolution.value) {
            	currentSolution = neighbor;
            }
        } else {
	        var metro = Math.exp(-delta / temperature);
	        var p = Math.random();
	        if (p < metro) {
	            currentPartition = neighbor;
	        }
        }
    }

    function _doSimulationStep() {
        if (currentTemperature > freezingTemperature) {
            for (var i = 0; i < currentStabilizer; i++) {
                var neighbor = generateNeighbor(currentSolution.partition, nbCluster),
                    energyDelta = neighbor.value - currentPartition.value;

                _metropolis(currentTemperature, energyDelta, neighbor);
            }
            currentTemperature *= coolingFactor;
            currentStabilizer *= stabilizingFactor;
            return true;
        }
        return false;
    }

    function _resolve(options) {
    	_init(options);

    	// resolve with performance showed
		Performance.duration("Simulated Annealing", function(){
    		while (_doSimulationStep() && maximumIteration > ++currentIteration);
		});

		return currentSolution;
    }

    return {
        initialize: function(options) {
            _init(options);
        },

        step: function() {
            return _doSimulationStep();
        },

        getCurrentEnergy: function() {
            return currentPartition.value;
        },

        getCurrentTemperature: function() {
            return currentTemperature;
        },
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
	    node,
	    links,
	    groups,
	    nbGroups,
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
			node.remove();
			links.remove();
			rect.remove();
			container.remove();
			vis.remove();
			d3.select("#chart svg").remove();
		}
	}

	function draw() {
		var graphNodes = d3.values(Graph.getNodes());
		var graphLinks = d3.values(Graph.getLinks());
		groups = d3.nest().key(function(d) { return d.group; }).entries(graphNodes);
		nbGroups = groups.length;

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

		force = d3.layout.force()
			.gravity(0)
			.linkStrength(0)
		    .nodes(graphNodes)
		    .links(graphLinks)
		    .size([w, h])
		    .start();

		node = container.selectAll("circle.node")
		    .data(graphNodes)
		  .enter().append("circle")
		    .attr("class", "node")
		    .attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; })
		    .attr("r", 8)
		    .style("fill", function(d, i) { return fill(d.group); })
		    .style("stroke", function(d, i) { return d3.rgb(fill(d.group)).darker(2); })
		    .style("stroke-width", 1.5);

		links = container.selectAll(".link")
			.data(graphLinks)
		  .enter().append("line")
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

		force.on("tick", function(e) {
		  var k = 0.2 * e.alpha;
		  graphNodes.forEach(function(o, i) {
		    o.x += (foci[o.group].x - o.x) * k;
		    o.y += (foci[o.group].y - o.y) * k;
		  });

		  links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		  node.attr("cx", function(d) { return d.x; })
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
		});
	}	
	return {
		draw: function(){
			draw();
		}
	}
}());
