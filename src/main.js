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
	      edges: []
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
	      edges: []
	    };
    	var lines = evt.target.result.split("\n");
    	// nb nodes [0] and edges [1]
    	var nb = lines[1].split(' ').map(Number);
    	// create nodes
    	for (var n = 1; n <= nb[0]; n++) {
    		graph.nodes.push({
				id: 'n' + n,
				label: 'Noeud ' + n,
				x: Math.random(),
				y: Math.random(),
				size: 1,
				color: '#666'
			});
    	};
    	// create edges
    	var startEdgesLine = 5,
   			edge = null;
        for (var i = startEdgesLine; i < nb[1] + startEdgesLine; i++) {
        	edge = lines[i].split(' ').map(Number);
        	graph.edges.push({
				id: 'e' + (i - startEdgesLine),
				source: 'n' + edge[0],
				target: 'n' + edge[1],
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

var GraphDrawer = (function () {

	var instance = null;

	function _draw() {
		
		if (!FileParser.isLoad()) {
			alert("Veuillez choisir un fichier de graphe");
		} else {
			if (instance) {
				instance.graph.clear();
			} else {
				instance = new sigma({
				  container: 'graph-container',
				  type: 'webgl'
				});
				instance.settings({
				  drawLabels: false
				});
			}
			instance.graph.read(FileParser.getGraph());
			instance.refresh();
		}
	}

	return {
		draw: function() {
			_draw();
		}
	}

}());

document.getElementById('fileinput').addEventListener('change', FileParser.load, false);
document.getElementById('generategraph').addEventListener('click', GraphDrawer.draw, false);


var i,
	j,
	target,
	listTarget,
    s,
	sizeEdges = 0,
    N = 10,
    E,
    g = {
      nodes: [],
      edges: []
    };

/* Generate a random graph: */
// Math.seedrandom('hereistheseediwant');
// for (i = 0; i < N; i++) {
// 	g.nodes.push({
// 		id: 'n' + i,
// 		label: 'Noeud ' + i,
// 		x: Math.random(),
// 		y: Math.random(),
// 		size: 1,
// 		color: '#666'
// 	});
// 	listTarget = [];
// 	if (i !== N-1) {
// 		E = (Math.random() * (N-i-1));
// 		for (j = 0; j < E; j++) {
// 			target = 'n' + (i + 1 + Math.random() * (N-i-1) | 0);
// 			if (listTarget.indexOf(target) === -1) {
// 				listTarget.push(target);
// 				g.edges.push({
// 					id: 'e' + (sizeEdges++),
// 					source: 'n' + i,
// 					target: target,
// 					weight: (1 + Math.random() * 10 | 0),
// 					color: '#ccc'
// 				});
// 			}
// 		}
// 	}
// }

// Instantiate sigma:
// s = new sigma({
//   graph: g,
//   container: 'graph-container',
//   type: 'webgl'
// });