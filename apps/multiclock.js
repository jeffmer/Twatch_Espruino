var FACES = [];
var iface = 0;
require("Storage").list(/\.face\.js$/).forEach(face=>FACES.push(eval(require("Storage").read(face))));
var face = FACES[iface]();
var intervalRefSec;

function stopdraw() {
  if(intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
}

function widbat(){
    var x = 180;
    var y = 0;
    function getBattery(){
        var v = AXP202.batV();
        return Math.floor((v-3.7)*200);
    }
    var s = 39;
    g.setColor(0xFFFF);
    g.fillRect(x,y+2,x+s-4,y+21);
    g.clearRect(x+2,y+4,x+s-6,y+19);
    g.fillRect(x+s-3,y+10,x+s,y+14);
    g.setColor(0x07E0).fillRect(x+4,y+6,x+4+getBattery()*(s-12)/100,y+17);
    g.setColor(0xFFFF);
    g.flip();
}

function startdraw() {
  g.clear();
  g.reset();
  face.init();
  intervalRefSec = setInterval(face.tick,1000);
  widbat();
  setInterval(widbat,10000);
}

function setButtons(){
  function newFace(inc){
    var n = FACES.length-1;
    iface+=inc;
    iface = iface>n?0:iface<0?n:iface;
    stopdraw();
    face = FACES[iface]();
    startdraw();
  }
  FT5206.on('swipe',(dir)=>{if (dir ==1 || dir ==-1)newFace(dir);});
}

g.clear();
startdraw();
setButtons();

setTimeout(()=>{
    g.clear();
    AXP202.setLD02(0);
    ESP32.deepSleep(0,D38,0);
},20000);

