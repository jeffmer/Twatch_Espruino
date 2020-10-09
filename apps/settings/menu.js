(function(items) {
    var pal = new Uint16Array([0x0000,0x0007,0x02F7,0xFFFF]);
    var b = Graphics.createArrayBuffer(240,240,2,{msb:true});
    var flip = function(){
      g.drawImage({width:240,height:240,bpp:2,buffer:b.buffer,palette:pal},0,0);
    }
    if (TWATCH.buttons) FT5206.removeListener("touch",TWATCH.buttons);
    if (!items) return;
    var w = b.getWidth()-9;
    var h = b.getHeight();
    var menuItems = Object.keys(items);
    var options = items[""];
    if (options) menuItems.splice(menuItems.indexOf(""),1);
    if (!(options instanceof Object)) options = {};
    options.fontHeight=16;
    options.x=0;
    options.x2=w-2;
    options.y=24;
    options.y2=220;
    if (options.selected === undefined)
      options.selected = 0;
    if (!options.fontHeight)
      options.fontHeight = 6;
    var x = 0|options.x;
    var x2 = options.x2||(b.getWidth()-1);
    var y = 0|options.y;
    var y2 = options.y2||(b.getHeight()-1);
    if (options.title)
      y += options.fontHeight+2;
    var cBg = 1; // background col
    var cFg = 3; // foreground col
    var cHighlightBg = 2;
    var cHighlightFg = 3;
    var l = {
      draw : function() {
        b.reset();
        b.setColor(cFg);
        b.setFont('6x8',2).setFontAlign(0,-1,0);
        if (options.title) {
          b.drawString(options.title,(x+x2)/2,y-options.fontHeight-2);
          b.drawLine(x,y-2,x2,y-2);
        }
        var rows = 0|Math.min((y2-y) / options.fontHeight,menuItems.length);
        var idx = E.clip(options.selected-(rows>>1),0,menuItems.length-rows);
        var iy = y;
        var less = idx>0;
        while (rows--) {
          var name = menuItems[idx];
          var item = items[name];
          var hl = (idx==options.selected && !l.selectEdit);
          b.setColor(hl ? cHighlightBg : cBg);
          b.fillRect(x,iy,x2,iy+options.fontHeight-1);
          b.setColor(hl ? cHighlightFg : cFg);
          b.setFontAlign(-1,-1);
          b.drawString(name,x,iy);
          if ("object" == typeof item) {
            var xo = x2;
            var v = item.value;
            if (item.format) v=item.format(v);
            if (l.selectEdit && idx==options.selected) {
              xo -= 24 + 1;
              b.setColor(cHighlightBg);
              b.fillRect(xo-(b.stringWidth(v)+4),iy,x2,iy+options.fontHeight-1);
              b.setColor(cHighlightFg);
              b.drawImage("\x0c\x05\x81\x00 \x07\x00\xF9\xF0\x0E\x00@",xo,iy+(options.fontHeight-10)/2,{scale:2});
            }
            b.setFontAlign(1,-1);
            b.drawString(v,xo-2,iy);
          }
          b.setColor(cFg);
          iy += options.fontHeight;
          idx++;
        }
        b.setFontAlign(-1,-1);
        var more = idx<menuItems.length;      
        b.drawImage("\b\b\x01\x108|\xFE\x10\x10\x10\x10"/*E.toString(8,8,1,
          0b00010000,
          0b00111000,
          0b01111100,
          0b11111110,
          0b00010000,
          0b00010000,
          0b00010000,
          0b00010000
        )*/,w,40);
        b.drawImage("\b\b\x01\x10\x10\x10\x10\xFE|8\x10"/*E.toString(8,8,1,
          0b00010000,
          0b00010000,
          0b00010000,
          0b00010000,
          0b11111110,
          0b01111100,
          0b00111000,
          0b00010000
        )*/,w,194);
        b.drawImage("\b\b\x01\x00\b\f\x0E\xFF\x0E\f\b"/*E.toString(8,8,1,
          0b00000000,
          0b00001000,
          0b00001100,
          0b00001110,
          0b11111111,
          0b00001110,
          0b00001100,
          0b00001000
        )*/,w,116);
        b.setColor(more?-1:0);
        b.fillPoly([104,220,136,220,120,228]);
        flip();
      },
      select : function(dir) {
        var item = items[menuItems[options.selected]];
        if ("function" == typeof item) item(l);
        else if ("object" == typeof item) {
          // if a number, go into 'edit mode'
          if ("number" == typeof item.value)
            l.selectEdit = l.selectEdit?undefined:item;
          else { // else just toggle bools
            if ("boolean" == typeof item.value) item.value=!item.value;
            if (item.onchange) item.onchange(item.value);
          }
          l.draw();
        }
      },
      move : function(dir) {
        if (l.selectEdit) {
          var item = l.selectEdit;
          item.value -= (dir||1)*(item.step||1);
          if (item.min!==undefined && item.value<item.min) item.value = item.min;
          if (item.max!==undefined && item.value>item.max) item.value = item.max;
          if (item.onchange) item.onchange(item.value);
        } else {
          options.selected = (dir+options.selected)%menuItems.length;
          if (options.selected<0) options.selected += menuItems.length;
        }
        l.draw();
      }
    };
    TWATCH.buttons = function(p){
      if (p.y<40) l.move(-1);
      else if (p.y>120 && p.y<140) l.select(); 
      else if (p.y>200) l.move(1);
    };
    l.draw();
    FT5206.on("touch",TWATCH.buttons);
    return l;  
  })
