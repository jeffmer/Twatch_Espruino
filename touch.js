I2C2.setup({scl:32,sda:23,bitrate:400000});

var TOUCH_PIN = D38;
pinMode(TOUCH_PIN,'input');

var FT5206 = {
    _data: new Uint8Array(16),
    _first: undefined,
    _last:undefined,
    _scan: undefined,
    writeByte:(a,d) => { 
        I2C2.writeTo(0x38,a,d);
    }, 
    readBytes:(a,n) => {
        I2C2.writeTo(0x38, a);
        return I2C2.readFrom(0x38,n); 
    },
    threshold:(v) => {
        FT5206.writeByte(0x80,v);
    },
    touched:()=>{
        var b = FT5206.readBytes(0x02,1)[0];
        return b>2?0:b;
    },
    getXY:()=>{
        this._data = FT5206.readBytes(0x00,16);
        var t = this._data[2];
        if (t>2 || t==0) return ;
        return { x:((this._data[3]&0x0F)<<8)|this._data[4],
                 y:((this._data[5]&0x0F)<<8)|this._data[6]
               };
    },
    enable:()=>{FT5206.writeByte(0xA4, 0);}
};

setWatch(()=> {
    var p = FT5206.getXY();
    if (p) {
        FT5206._first = p;
        FT5206.emit("touch",p);
        FT5206._scan = setInterval(()=>{
           var q =  FT5206.getXY();
           if (q) FT5206._last = q;
           else {
              clearInterval(FT5206._scan);
              if (!FT5206._last) return;
              var xm = FT5206._last.x - FT5206._first.x;
              var ym = FT5206._last.y - FT5206._first.y;
              var dir = (Math.abs(xm) - Math.abs(ym));
              if (Math.abs(dir)<10) return;
              dir = dir>0 ? 1 : 2;
              if (dir==1) dir = xm>0 ? dir : -dir;
              else dir = ym>0 ? dir : -dir;
              FT5206.emit("swipe",dir);
           }
        });
    }
},TOUCH_PIN,{repeat:true,edge:"falling",debounce:25});

FT5206.enable();

/*
FT5206.on("touch", (p)=>{
    console.log("touch x: "+p.x+" y:"+p.y);
});

FT5206.on("swipe", (d)=>{
    console.log("swipe d: "+d);
});
*/




