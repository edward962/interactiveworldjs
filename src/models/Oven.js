INTERACTIVEWORLD.Oven = function() {
  var that = this;
  THREE.Object3D.call(this);

  // load the model
  var loader = new THREE.ColladaLoader();
  loader.load(INTERACTIVEWORLD.OVEN_MODEL, function(result) {
    // fix the offset
    result.scene.position.x = -0.45;
    result.scene.position.y = -0.2;
    that.add(result.scene);
  });
};
INTERACTIVEWORLD.Oven.prototype.__proto__ = THREE.Object3D.prototype;