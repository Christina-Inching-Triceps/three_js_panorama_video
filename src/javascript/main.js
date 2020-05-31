"use strict";

//イベントの振り分け
var EVENT = {};
if ('ontouchstart' in window) {
  EVENT.TOUCH_START = 'touchstart';
  EVENT.TOUCH_MOVE = 'touchmove';
  EVENT.TOUCH_END = 'touchend';
} else {
  EVENT.TOUCH_START = 'mousedown';
  EVENT.TOUCH_MOVE = 'mousemove';
  EVENT.TOUCH_END = 'mouseup';
}

(function () {

  // 変数の初期化
  var container = container = document.getElementById('canvas-frame');
  let video = createVideoElm();
  let texture = createTexture(video);
  let mesh = createMesh(texture);

  var scene = createScene(mesh);
  var camera = createCamera();
  var renderer = createRenderer();

  setupConainerEvent(video);

  var fov = 60,
  isUserInteracting = false,
  onMouseDownMouseX = 0, onMouseDownMouseY = 0,
  lon = 0, onMouseDownLon = 0,
  lat = 0, onMouseDownLat = 0,
  phi = 0, theta = 0;

  init();
  animate();

  // video 要素を生成
  function createVideoElm() {
    let video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.src = 'src/video/360video.mp4';
    video.setAttribute('webkit-playsinline', 'webkit-playsinline');
    video.setAttribute('playsinline', 'playsinline');
    video.setAttribute('muted', 'muted');
    video.play();
    return video;
  }

  // video からテクスチャを生成
  function createTexture(video) {
    let texture = new THREE.Texture(video);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.maxFilter = THREE.NearestFilter;
    texture.format = THREE.RGBFormat;
    // 動画に合わせてテクスチャを更新
    setInterval( function () {
      if ( video.readyState >= video.HAVE_CURRENT_DATA ) {
        texture.needsUpdate = true;
      }
    }, 1000 / 24 );

    return texture;
  }

  function createMesh(texture) {
    let geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
    geometry.scale( - 1, 1, 1 );
    return new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
  }

  function createScene(mesh) {
    scene = new THREE.Scene();
    scene.add( mesh );
    return scene;
  }

  function createCamera() {
    return new THREE.PerspectiveCamera( 75, container.innerWidth / container.innerHeight, 1, 2000 );
  }

  function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
  }

  // containerのイベントを初期化
  function setupConainerEvent(video) {
    container.addEventListener('click', function(){
      video.play();
    });
    container.appendChild(renderer.domElement);
    // ドラッグ・スワイプ操作を設定
    container.addEventListener( EVENT.TOUCH_START, onDocumentMouseDown, false );
  }

  function init() {
    // 画面のリサイズに対応
    window.addEventListener( 'resize', onWindowResize, false );
    onWindowResize( null );
  }

  function onWindowResize (event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  function onDocumentMouseDown(event) {
    event.preventDefault();
    if(event.clientX) {
      onMouseDownMouseX = event.clientX;
      onMouseDownMouseY = event.clientY;
    } else if(event.touches) {
      onMouseDownMouseX = event.touches[0].clientX
      onMouseDownMouseY = event.touches[0].clientY;
    } else {
      onMouseDownMouseX = event.changedTouches[0].clientX
      onMouseDownMouseY = event.changedTouches[0].clientY
    }
    onMouseDownLon = lon;
    onMouseDownLat = lat;
    document.addEventListener( EVENT.TOUCH_MOVE, onDocumentMouseMove, false );
    document.addEventListener( EVENT.TOUCH_END, onDocumentMouseUp, false );
  }
  function onDocumentMouseMove( event ) {
    event.preventDefault();
    if(event.clientX) {
      var touchClientX = event.clientX;
      var touchClientY = event.clientY;
    } else if(event.touches) {
      var touchClientX = event.touches[0].clientX
      var touchClientY = event.touches[0].clientY;
    } else {
      var touchClientX = event.changedTouches[0].clientX
      var touchClientY = event.changedTouches[0].clientY
    }
    lon = ( touchClientX - onMouseDownMouseX ) * -0.15 + onMouseDownLon;
    lat = ( touchClientY - onMouseDownMouseY ) * -0.15 + onMouseDownLat;
  }
  function onDocumentMouseUp( event ) {
    document.removeEventListener( EVENT.TOUCH_MOVE, onDocumentMouseMove, false );
    document.removeEventListener( EVENT.TOUCH_END, onDocumentMouseUp, false );
  }
  function animate() {
    renderer.setAnimationLoop( render );
  }
  function render() {
    lat = Math.max( - 85, Math.min( 85, lat ) );
    phi = THREE.Math.degToRad( 90 - lat );
    theta = THREE.Math.degToRad( lon );
    camera.position.x = 100 * Math.sin( phi ) * Math.cos( theta );
    camera.position.y = 100 * Math.cos( phi );
    camera.position.z = 100 * Math.sin( phi ) * Math.sin( theta );
    camera.lookAt( scene.position );
    renderer.render( scene, camera );
  }

})();
