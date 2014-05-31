			var container, stats;
			var camera, scene, renderer, group, geometry, line;
			var particles, lines;
			var material3, lineMat;
			var mouseX = 0, mouseY = 0;
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
			var dPoint;
			var tempArray = new Array();
			var c = ['x', 'y', 'z'];
			var count = 0;
			var moveDist = 0.2;
			var neighborAmount = 3;
			var size = 2.5;
			var spacing = 100;
			var amt = 75;
			var colThresh = 5000;
			var maxDist = 50;
			var zeroVector = new THREE.Vector3();
			var zeroParticle = new THREE.Particle();
			var inc = 1;
			for(var x = 0; x < 20; x++){
				var temp = new THREE.Particle;
				var tp = temp.position;
				tp.x = tp.y = tp.z = x;
				tempArray.push(temp);
			}
			init();
			animate();
			function avgPos(v1, v2){
				return new THREE.Vector3().add(v1).add(v2).divideScalar(2.0);
			}
			function dist(p1, p2){
				return p1.position.distanceToSquared(p2.position);
			}
			function dSort(a, b){
				return dist(a, dPoint) - dist(b, dPoint);
			}
			function reverseDSort(a, b){
				return dist(b, dPoint) - dist(a, dPoint);
			}
			function closestParticles(p, pA, amount){
				dPoint = p;
				var sortArr = pA = pA.slice(0);
				var pindex = sortArr.indexOf(p);
				sortArr.splice(pindex, pindex);
				sortArr.sort(dSort);
				sortArr.splice(amount);
				return sortArr;
			}
			function setParticles(n){
				delta = n - particles.children.length;
				if(delta < 0)
					particles.children.splice(n);
				else
					for(var x = 0; x < delta; x++){
						var part = new THREE.Particle(material3.clone());
						part.scale.x = part.scale.y = size;
						part.position.x = Math.random() * spacing - spacing / 2.0;
						part.position.y = Math.random() * spacing - spacing / 2.0;
						part.position.z = Math.random() * spacing - spacing / 2.0;
						part.material.color = vectorToColor(part.position, colThresh);
						particles.add(part);
					}					
			}
			function pToggle(){scene.children.indexOf(particles) > -1 ? scene.remove(particles) : scene.add(particles);}
			function move(p){//all of this now gives the particle a move method, so we don't need to do stuff again
				if(p.setUp){
					p.position = p.nextPos();
					return;
				}
				var uuid = p.uuid.split("-");
				var science = new Array();
				for(var x = 0; x < uuid.length; x++){
					for(var y = 0; y < uuid[x].length; y+=2){
						var n = parseInt(uuid[x].substring(y, y+2));
						if(n < 20)
							n = 256-n;
						if(!isNaN(n))
							science.push(n);
					}
				}
				p.arr = science;
				p.nextPos = function(){
					var science = p.arr;
					var third = parseInt(science.length / 3);
					var rv = new THREE.Vector3();
					for(var f in c){
						var start = f * third;
						var bonus = science[start+1] % 2 == 0 ? Math.PI / 2 : 0;
						rv[c[f]] = Math.min(science[start], science[start + 1], 50) * Math.sin((count + science[start + 1]) / science[start + 2] + bonus);
					}
					return rv;
				}
				p.position = p.nextPos();
				p.setUp = true;
			}
			function vectorToColor(v, m){
				var mag = v.distanceToSquared(zeroVector);
				var h = mag % m / m;
				return new THREE.Color().setHSL(h, 0.5, 0.5);
			}
			function init() {
				container = document.createElement( 'div' );
				document.body.appendChild( container );
				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
				camera.position.z = 200;
				scene = new THREE.Scene();
				var PI2 = Math.PI * 2;
				particles = new THREE.Object3D();
				lines = new THREE.Object3D();
				scene.add( particles );
				scene.add( lines );
				material3 = new THREE.ParticleCanvasMaterial( {
					color: 0x20F050,
					program: function ( context ) {
						context.beginPath();
						context.arc( 0, 0, 1, 0, PI2, true );
						context.fill();
					}
				} );
				lineMat = new THREE.LineBasicMaterial({
					color: 0x20FF60
				});
				renderer = new THREE.CanvasRenderer();
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );
				for(var x = 0; x < amt; x++){
					var part = new THREE.Particle(material3.clone());
					part.scale.x = part.scale.y = size;
					part.position.x = Math.random() * spacing - spacing / 2.0;
					part.position.y = Math.random() * spacing - spacing / 2.0;
					part.position.z = Math.random() * spacing - spacing / 2.0;
					part.material.color = vectorToColor(part.position, colThresh);
					particles.add(part);
				}
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );
				window.addEventListener( 'resize', onWindowResize, false );
				controls = new THREE.TrackballControls( camera, container );				
			}
			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			function onDocumentMouseMove( event ) {
				mouseX = event.clientX - windowHalfX;
				mouseY = event.clientY - windowHalfY;
			}
			function onDocumentTouchStart( event ) {
				if ( event.touches.length === 1 ) {
					event.preventDefault();
					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					mouseY = event.touches[ 0 ].pageY - windowHalfY;
				}
			}
			function onDocumentTouchMove( event ) {
				if ( event.touches.length === 1 ) {
					event.preventDefault();
					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					mouseY = event.touches[ 0 ].pageY - windowHalfY;
				}
			}
			function animate() {
				requestAnimationFrame( animate );
				render();
			}
			function render() {
				camera.lookAt( scene.position );
				controls.update();
				lines.children = [];
				for(var x = 0; x < particles.children.length; x++){
					var p = particles.children[x];
					move(p);
					p.material.color = vectorToColor(p.position, colThresh);
				}
				for(var x = 0; x < particles.children.length; x++){
					var p = particles.children[x];
					var neighbors = closestParticles(p, particles.children, neighborAmount);
					for(var y = 0; y < neighbors.length; y++){
						var nmat = lineMat.clone();
						nmat.color = vectorToColor(avgPos(p.position, neighbors[y].position), colThresh);
						var tempGeo = new THREE.Geometry();
						tempGeo.vertices.push(p.position);
						tempGeo.vertices.push(neighbors[y].position);
						lines.children.push(new THREE.Line(tempGeo, nmat))
					}
				}
				count+= inc;
				renderer.render( scene, camera );
			}