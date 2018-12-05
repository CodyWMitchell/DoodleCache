if(window.location.protocol != 'https:') {
  location.href = location.href.replace("http://", "https://");
}

var socket;

//Map Vars
var myMap;
var canvas;
var userLat;
var userLong;

function preventBehavior(e) {
    e.preventDefault();
};

document.addEventListener("touchmove", preventBehavior, {passive: false});

var initialize = function() {
    // Start the app and get the user's location
    var mappa = new Mappa('Leaflet');
    var options = {
        lat: userLat,
        lng: userLong,
        zoom: 16,
        style: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
    }

    canvas = window.document.getElementById('defaultCanvas0');
    //canvas = createCanvas(width,height);
    myMap = mappa.tileMap(options);
    myMap.overlay(canvas);

    // Start the drawing
    //myMap.onChange(drawPoint);
}

var onSuccess = function(position) { // If they accept the prompt

    userLat = position.coords.latitude;
    userLong = position.coords.longitude;

    initialize();
};

function onError(error) { // If they deny the prompt
    alert('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

//Main Code

function hashCode(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}

function setup() {
  pixelDensity(1);
  cnv = createCanvas(min(windowWidth-20,windowHeight/1.8),windowHeight*3/4);
  cnv.parent("p5box");
  strokeWeight(height/150);
  colorMode(HSB);

  navigator.geolocation.getCurrentPosition(onSuccess, onError);

  socket = io.connect("https://sketchcache.herokuapp.com");
  socket.on('mouse', drawLine);
  socket.on('clear', clearCanvas);

}

function disableMap() {
  myMap.map.zoomControl=false;

  myMap.map.dragging.disable();
  myMap.map.touchZoom.disable();
  myMap.map.doubleClickZoom.disable();
  myMap.map.scrollWheelZoom.disable();
  myMap.map.boxZoom.disable();
  myMap.map.keyboard.disable();
  if (myMap.map.tap) myMap.map.tap.disable();
  myMap.map.dragging.disable();
}

function mouseDragged() {
  disableMap();

  stroke(hashCode(socket.id)%360,255,255);
  line(mouseX,mouseY,pmouseX,pmouseY);

  var coord = myMap.pixelToLatLng(mouseX,mouseY);
  var pcoord = myMap.pixelToLatLng(pmouseX,pmouseY);

  var data = {
    x: coord.lat,
    y: coord.lng,
    px: pcoord.lat,
    py: pcoord.lng
  }

  socket.emit('mouse', data); //Send data to serv
}

function emitClear() {
  clearCanvas();
  socket.emit('clear');
}

function keyPressed() {
  clearCanvas();
  socket.emit('clear');
}

function drawLine(data) {
  stroke(hashCode(data.id)%360,255,255);
  pixData = myMap.latLngToPixel(data.x,data.y);
  ppixData = myMap.latLngToPixel(data.px,data.py);

  line(pixData.x,pixData.y,ppixData.x,ppixData.y);
}

function clearCanvas() {
  clear();
}

function keyPressed() {
  clearCanvas();
  if (key === 'u') {
    myMap.map.setZoom(myMap.map.getZoom()+1);
  }
  if (key === 'j') {
    myMap.map.setZoom(myMap.map.getZoom()-1);
  }
}
