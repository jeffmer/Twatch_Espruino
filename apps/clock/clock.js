var FACES = [];
var iface = 0;
require("Storage").list(/\.face\.js$/).forEach(face=>FACES.push(eval(require("Storage").read(face))));
var face = FACES[iface]();
var intervalRefSec;

function stopdraw() {
  if(intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
  g.clear();
}

function widbat(){
    var x = 140;
    var y = 0;
    function getBattery(){
        var v = AXP202.batV();
        v = v<3.7?3.7:v;
        return Math.floor((v-3.7)*200);
    }
    var s = 39;
    g.reset();
    g.setColor(0xFFFF);
    g.fillRect(x,y+2,x+s-4,y+21);
    g.clearRect(x+2,y+4,x+s-6,y+19);
    g.fillRect(x+s-3,y+10,x+s,y+14);
    g.setColor(0x07E0).fillRect(x+4,y+6,x+4+getBattery()*(s-12)/100,y+17);
    g.setColor(0xFFFF);
    g.setFont("6x8",2);
    g.drawString(AXP202.batPercent().toString()+"%",x+44,y+4,true);
    g.flip();
}

function startdraw() {
  g.reset();
  face.init();
  intervalRefSec = setInterval(face.tick,1000);
  widbat();
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

setTimeout(()=>{
  g.clear();
  startdraw();
  setButtons();
},500);

TWATCH.on("sleep",(b)=>{if (b) stopdraw(); else startdraw();});


