INTERACTIVEWORLD.ObjectMenu = function(options) {
  var that = this;
  options = options || {};
  var antialias = options.antialias;
  this.objects = options.objects;
  this.counter = 0;
  this.displayObject = this.objects[this.counter];
  this.placedObjects = [];
  this.placedObjectCount = [];
  var text = options.title || '';
  this.completion = options.completion || 1;

  // setup the div
  if(this.objects.length === 0) {
    return;
  }
  var div = document.createElement('div');
  div.classList.add('object-menu');
  document.getElementsByTagName('body')[0].appendChild(div);

  // create the heading
  var title = document.createElement('h1');
  title.innerHTML = text;
  div.appendChild(title);

  // create the 3D canvas
  var renderer = new THREE.WebGLRenderer({
    antialias : antialias
  });

  // create the global scene
  var scene = new THREE.Scene();
  scene.add(this.displayObject);

  // create the global camera
  var camera = new THREE.PerspectiveCamera(60, 2.5, 0.01, 1000);
  camera.position.y = -0.25;
  camera.position.z = 0.25;
  camera.lookAt(scene.position);

  var plane = new THREE.Mesh(new THREE.CubeGeometry(
      INTERACTIVEWORLD.OBJECT_MENU_DISPLAY_WIDTH,
      INTERACTIVEWORLD.OBJECT_MENU_DISPLAY_HEIGHT, 0.01),
      new THREE.MeshLambertMaterial({
        transparent : true,
        color : 0x0000FF
      }));
  plane.material.opacity = 0.5;
  plane.position.z = -0.01;
  scene.add(plane);

  // add lights
  scene.add(new THREE.AmbientLight(0x666666));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8));

  div.appendChild(renderer.domElement);

  // add the navigation bar
  var nav = document.createElement('div');
  var previousArrow = document.createElement('img');
  previousArrow.src = INTERACTIVEWORLD.IMAGE_PATH + INTERACTIVEWORLD.PREVIOUS_ARROW;
  previousArrow.onclick = previous;
  previousArrow.style.cursor = 'pointer';
  nav.appendChild(previousArrow);
  var objectName = document.createElement('span');
  nav.appendChild(objectName);
  objectName.innerHTML = '&nbsp;&nbsp;&nbsp;' + this.displayObject.name
      + '&nbsp;&nbsp;&nbsp;';
  var nextArrow = document.createElement('img');
  nextArrow.src = INTERACTIVEWORLD.IMAGE_PATH + INTERACTIVEWORLD.NEXT_ARROW;
  nextArrow.onclick = next;
  nextArrow.style.cursor = 'pointer';
  nav.appendChild(nextArrow);
  div.appendChild(nav);

  function previous() {
    // update the counter
    that.counter--;
    if (that.counter < 0) {
      that.counter = that.objects.length - 1;
    }

    // update the display
    scene.remove(that.displayObject);
    that.displayObject = that.objects[that.counter];
    scene.add(that.displayObject);

    // change the name
    objectName.innerHTML = '&nbsp;&nbsp;&nbsp;' + that.displayObject.name
        + '&nbsp;&nbsp;&nbsp;';
  }

  function next() {
    // update the counter
    that.counter++;
    if (that.counter >= that.objects.length) {
      that.counter = 0;
    }

    // update the display
    scene.remove(that.displayObject);
    that.displayObject = that.objects[that.counter];
    scene.add(that.displayObject);

    // change the name
    objectName.innerHTML = '&nbsp;&nbsp;&nbsp;' + that.displayObject.name
        + '&nbsp;&nbsp;&nbsp;';
  }

  function resize() {
    // base it on the window size
    var width = that.getMenuWidth();
    var height = that.getMenuHeight();
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.top = (window.innerHeight - height) + 'px';

    // set the font size for the title
    title.style.fontSize = Math.round(that.getMenuWidth() / 20) + 'px';

    // set the navigation menu
    previousArrow.style.height = Math.round(that.getMenuWidth() / 12) + 'px';
    nextArrow.style.height = Math.round(that.getMenuWidth() / 12) + 'px';
    nav.style.height = Math.round(that.getMenuWidth() / 12) + 'px';

    // set the visualizer
    renderer.setSize(width, height - title.offsetHeight - nav.offsetHeight);
    camera.aspect = width / (height - title.offsetHeight - nav.offsetHeight);
  }

  /**
   * Renders the associated scene to the viewer.
   */
  function draw() {
    // rotate the object
    that.displayObject.rotation.z += 0.005;

    // render the scene
    renderer.render(scene, camera);

    // draw the frame
    requestAnimationFrame(draw);
  }

  // setup the reszie
  window.addEventListener('resize', resize, false);

  // setup the initial size
  resize();

  draw();
};
INTERACTIVEWORLD.ObjectMenu.prototype.__proto__ = EventEmitter2.prototype;

INTERACTIVEWORLD.ObjectMenu.prototype.getMenuWidth = function() {
  return window.innerWidth / 4;
};

INTERACTIVEWORLD.ObjectMenu.prototype.getMenuHeight = function() {
  return this.getMenuWidth() * 0.5;
};

INTERACTIVEWORLD.ObjectMenu.prototype.getDisplayObjectType = function() {
  if (this.displayObject === undefined) {
    return null;
  } else {
    return this.displayObject.constructor;
  }
};

INTERACTIVEWORLD.ObjectMenu.prototype.markPlacedItem = function() {
  var index = this.objects.indexOf(this.displayObject);

  if (this.placedObjects.indexOf(index) === -1) {
    this.placedObjects.push(index);
    this.placedObjectCount.push(1);
  } else {
    this.placedObjectCount[this.placedObjects.indexOf(index)]++;
  }

  if (this.placedObjects.length === this.objects.length) {
    for ( var i = 0; i < this.objects.length; i++) {
      if (this.placedObjectCount[i] < this.completion) {
        return;
      }
    }
    this.emit('completion');
  }
};
