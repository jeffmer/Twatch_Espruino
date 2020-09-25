
(function(){
    var CHARGING = 0x07E0;
    var x = 180;
    var y = 0;
    function getBattery(){
        var v = AXP202.batV();
        return Math.floor((v-3.7)*200);
    }

    function isCharging(){
        return AXP202.batA()>0;
    }

    function draw() {
      var s = 39;
      var x = this.x, y = this.y;
      if (isCharging()) {
        g.setColor(CHARGING).drawImage(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"),x,y);
        x+=16;
      }
      g.setColor(-1);
      g.fillRect(x,y+2,x+s-4,y+21);
      g.clearRect(x+2,y+4,x+s-6,y+19);
      g.fillRect(x+s-3,y+10,x+s,y+14);
      g.setColor(CHARGING).fillRect(x+4,y+6,x+4+getBattery()*(s-12)/100,y+17);
      g.setColor(-1);
    }

    var batteryInterval = setInterval(()=>draw(), 5000);
    draw();

  })();
  