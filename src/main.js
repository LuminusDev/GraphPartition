/**
seedrandom.js
=============

Seeded random number generator for Javascript.

version 2.3.10
Author: David Bau
Date: 2014 Sep 20
**/
!function(a,b,c,d,e,f,g,h,i){function j(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=s&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=s&f+1],c=c*d+h[s&(h[f]=h[g=s&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function k(a,b){var c,d=[],e=typeof a;if(b&&"object"==e)for(c in a)try{d.push(k(a[c],b-1))}catch(f){}return d.length?d:"string"==e?a:a+"\0"}function l(a,b){for(var c,d=a+"",e=0;e<d.length;)b[s&e]=s&(c^=19*b[s&e])+d.charCodeAt(e++);return n(b)}function m(c){try{return o?n(o.randomBytes(d)):(a.crypto.getRandomValues(c=new Uint8Array(d)),n(c))}catch(e){return[+new Date,a,(c=a.navigator)&&c.plugins,a.screen,n(b)]}}function n(a){return String.fromCharCode.apply(0,a)}var o,p=c.pow(d,e),q=c.pow(2,f),r=2*q,s=d-1,t=c["seed"+i]=function(a,f,g){var h=[];f=1==f?{entropy:!0}:f||{};var o=l(k(f.entropy?[a,n(b)]:null==a?m():a,3),h),s=new j(h);return l(n(s.S),b),(f.pass||g||function(a,b,d){return d?(c[i]=a,b):a})(function(){for(var a=s.g(e),b=p,c=0;q>a;)a=(a+c)*d,b*=d,c=s.g(1);for(;a>=r;)a/=2,b/=2,c>>>=1;return(a+c)/b},o,"global"in f?f.global:this==c)};if(l(c[i](),b),g&&g.exports){g.exports=t;try{o=require("crypto")}catch(u){}}else h&&h.amd&&h(function(){return t})}(this,[],Math,256,6,52,"object"==typeof module&&module,"function"==typeof define&&define,"random");


var FileParser = (function () {

	var file = null,
		graph = {
	      nodes: [],
	      links: []
	    };

    function _load(evt) {
    	file = evt.target.files[0];

	    if (file) {
	      var r = new FileReader();
	      r.onload = function(evt){
	      	_parseFile(evt);
	      	document.getElementById('generategraph').disabled = false;
	      }
	      r.onerror = function() {
	     	alert("Echec de chargement du fichier");
	      }
	      r.readAsText(file);
		} else {
			document.getElementById('generategraph').disabled = true;
		}
    }

    function _parseFile(evt) {
   		graph = {
	      nodes: [],
	      links: []
	    };
    	var lines = evt.target.result.split("\n");
    	// nb nodes [0] and edges [1]
    	var nb = lines[1].split(' ').map(Number);
    	// create nodes
    	for (var n = 0; n < nb[0]; n++) {
    		graph.nodes.push({
				id: n,
				label: 'Noeud ' + n,
				size: 1,
				group: n%3,
				color: '#666'
			});
    	};
    	// create edges
    	var startEdgesLine = 5,
   			edge = null;
        for (var i = startEdgesLine; i < nb[1] + startEdgesLine; i++) {
        	edge = lines[i].split(' ').map(Number);
        	graph.links.push({
				id: 'e' + (i - startEdgesLine),
				source: edge[0]-1,
				target: edge[1]-1,
				weight: edge[2],
				color: '#ccc'
			});
        }
    }

    return {
    	load: function(evt) {
    		_load(evt);
    	},
    	getGraph: function() {
    		return graph;
    	},
    	isLoad: function() {
    		return file !== null;
    	}
    };
}());

var partionningSolver = (function () {

	return {
		resolve: function(graph, nbCluster, maxVariation) {
			_resolve(graph, nbCluster, maxVariation);
		}
	}
}());

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
	    graph,
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
	    return "M" + 
	      d3.geom.hull(d.values.map(function(i) { return [i.x, i.y]; }))
	        .join("L")
	    + "Z";
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
		graph = FileParser.getGraph();

		groups = d3.nest().key(function(d) { return d.group; }).entries(graph.nodes);
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
		    .nodes(graph.nodes)
		    .links(graph.links)
		    .size([w, h])
		    .start();

		node = container.selectAll("circle.node")
		    .data(graph.nodes)
		  .enter().append("circle")
		    .attr("class", "node")
		    .attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; })
		    .attr("r", 8)
		    .style("fill", function(d, i) { return fill(d.group); })
		    .style("stroke", function(d, i) { return d3.rgb(fill(d.group)).darker(2); })
		    .style("stroke-width", 1.5)
		    .call(force.drag);

		links = container.selectAll(".link")
			.data(graph.links)
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
		  var k = 0.1 * e.alpha;
		  graph.nodes.forEach(function(o, i) {
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

document.getElementById('fileinput').addEventListener('change', FileParser.load, false);
document.getElementById('generategraph').addEventListener('click', GraphDrawerD3.draw, false);