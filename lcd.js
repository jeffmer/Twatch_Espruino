/* 
Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.

Updated for use in Twatch by Jeff Magee
 */

function ST7789() {
    var LCD_WIDTH = 240;
    var LCD_HEIGHT = 240;
    var XOFF = 0;
    var YOFF = 80;
    var INVERSE = 1;

    function dispinit(spi, dc, ce, rst,fn) {
        function cmd(c,d) {
            dc.reset();
            spi.write(c, ce);
            if (d!==undefined) {
                dc.set();
                spi.write(d, ce);
            }
        }

        if (rst) {
            digitalPulse(rst,0,10);
        } else {
            cmd(0x01); //ST7735_SWRESET: Software reset, 0 args, w/delay: 150 ms delay
        }
        setTimeout(function() {
        cmd(0x11); //SLPOUT
        setTimeout(function() {
            //MADCTL: Set Memory access control (directions), 1 arg: row addr/col addr, bottom to top refresh
            cmd(0x36, 0x08);
            //COLMOD: Set color mode, 1 arg, no delay: 16-bit color
            cmd(0x3a, 0x05);
            //PORCTRL: Porch control
            cmd(0xb2, [0x0c, 0x0c, 0x00, 0x33, 0x33]);
            //GCTRL: Gate control
            cmd(0xb7, 0x00);
            // VCOMS: VCOMS setting
            cmd(0xbb, 0x3e);
            //LCMCTRL: CM control
            cmd(0xc0, 0xc0);
            //VDVVRHEN: VDV and VRH command enable
            cmd(0xc2, 0x01);
            // VRHS: VRH Set
            cmd(0xc3, 0x19);
            // VDVS: VDV Set
            cmd(0xc4, 0x20);
            //VCMOFSET: VCOM Offset Set .
            cmd(0xC5, 0xF);
            //PWCTRL1: Power Control 1
            cmd(0xD0, [0xA4, 0xA1]);
            // PVGAMCTRL: Positive Voltage Gamma Control
            cmd(0xe0, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);
            // NVGAMCTRL: Negative Voltage Gamma Contro
            cmd(0xe1, [0x70, 0x15, 0x20, 0x15, 0x10, 0x09, 0x48, 0x33, 0x53, 0x0B, 0x19, 0x15, 0x2a, 0x2f]);

            if (INVERSE) {
                //TFT_INVONN: Invert display, no args, no delay
                cmd(0x21);
            } else {
                //TFT_INVOFF: Don't invert display, no args, no delay
                cmd(0x20);
            }
            //TFT_NORON: Set Normal display on, no args, w/delay: 10 ms delay
            cmd(0x13);
            //TFT_DISPON: Set Main screen turn on, no args w/delay: 100 ms delay
            cmd(0x29);
            if (fn) fn();
          }, 50);
          }, 120);
    }


    function connect(options , callback) {
        var spi=options.spi, dc=options.dc, ce=options.cs, rst=options.rst;
        var g = lcd_spi_unbuf.connect(options.spi, {
            dc: options.dc,
            cs: options.cs,
            height: LCD_HEIGHT,
            width: LCD_WIDTH,
            colstart: XOFF,
            rowstart: YOFF
        });
        dispinit(spi, dc, ce, rst, ()=>{g.clear();});
        return g;
    }

    //var spi = new SPI();
    SPI1.setup({sck:D18, mosi:D19, baud: 20000000});

    return connect({spi:SPI1, dc:D27, cs:D5});
}

//screen brightness function
function brightness(v) {
    v<0?0:v>1?1:v;
    analogWrite(D12,v);
}

