function time_fill(){
    g.setColor(0x07E0);
    var time= Date.now();
    g.fillRect(0,40,239,199);
    g.flip();
    time = Math.floor(Date.now()-time);
    console.log("Time to Draw Rectangle: "+time+"ms");
}

var pal1color = new Uint16Array([0x0000,0xF100]);
var buf = Graphics.createArrayBuffer(240,160,1,{msb:true});
buf.setColor(1);
buf.fillRect(0,0,239,159);

function time_image(){
    var time= Date.now();
    g.drawImage({width:240,height:160,bpp:1,buffer:buf.buffer, palette:pal1color},0,40);
    g.flip();
    time = Math.floor(Date.now()-time);
    console.log("Time to Draw Image: "+time+"ms");
}

Bangle.on('swipe',(dir)=>{
    if(dir<0)
        time_fill();
    else 
        time_image();
});
