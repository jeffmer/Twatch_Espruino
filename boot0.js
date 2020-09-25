I2C1.setup({scl:22,sda:21,bitrate:400000});

var AXP202 = {
    writeByte:(a,d) => { 
        I2C1.writeTo(0x35,a,d);
    }, 
    readByte:(a) => {
        I2C1.writeTo(0x35, a);
        return I2C1.readFrom(0x35,1)[0]; 
    },
    setPower:(bus,state) => {
        var buf = AXP202.readByte(0x12);
        var data = state?(buf | 0x041<<bus):(buf & ~(0x01<<bus));
        if (state) data|=2; //AXP202 DCDC3 force
        AXP202.writeByte(0x12,data);
    },
    setLD02:(state) => {return AXP202.setPower(2,state);},
    setExten:(state) => {return AXP202.setPower(0,state);},
    setDCDC2:(state) => {return AXP202.setPower(4,state);},
    setLD04:(state) => {return AXP202.setPower(3,state);},
    setCharge:(ma) => {
        var val = AXP202.readByte(0x33);
        val &= 0b11110000;
        ma -= 300;
        val |= (ma / 100);
        AXP202.writeByte(0x33, val);
    },
    setLEDoff:() => {
        var val = AXP202.readByte(0x32);
        val &= 0b11001111;
        val |= 0x08;
        AXP202.writeByte(0x32, val);
    },
    adc1Enable:(mask,en)=>{
        var val = AXP202.readByte(0x82);
        val = en? val|mask : val & ~mask;
        AXP202.writeByte(0x82,val);
    },
    deepSleep:(usec,pin)=>{
        ESP32.deepSleep(usec,pin);
    },
    batV:() => {
        I2C1.writeTo(0x35,0x78);
        var d = I2C1.readFrom(0x35,2);
        var v = d[0]*16+d[1];
        const ADCLSB = 1.1 / 1000.0;
        return v * ADCLSB;
    },
    batChargeA:() => {
        var hv = AXP202.readByte(0x7A);
        var lv = AXP202.readByte(0x7B);
        return ((hv << 4) | (lv & 0x0F))/2;
    },  
    batDisChargeA:() => {
        var hv = AXP202.readByte(0x7C);
        var lv = AXP202.readByte(0x7D);
        return ((hv << 5) | (lv & 0x1F))/2;
    }, 
    batA:() => {
        return AXP202.batChargeA() - AXP202.batDisChargeA();
    } ,
    init:() =>{
        AXP202.setLEDoff();
        AXP202.setCharge(300); // 300 ma is max  charge
        AXP202.setLD02(1); //g power on
        AXP202.setExten(0);
        AXP202.setDCDC2(0);
        AXP202.setLD04(0);
        AXP202.adc1Enable(0xCD,true);
    }
}

AXP202.init();

if (require("Storage").read("rtc.js")){
    eval(require("Storage").read("rtc.js"));
    var rtc = RTC();
    rtc.setSYS(); //set systemclock from Real-Time Clock;
}

if (require("Storage").read("touch.js")){
    eval(require("Storage").read("touch.js"));
}

if (require("Storage").read("lcd.js")){
    eval(require("Storage").read("lcd.js"));
    var g = ST7789();
    brightness(0.5);
    setTimeout(() => {
        if (!TOUCH_PIN.read()){
            g.setRotation(0);
            g.setColor(0xFFFF);
            g.setFont("6x8");
            g.drawString("T-Watch 2020 Espruino",20,100);
            var d = new Date();
            g.drawString(d.toString().substr(0,15),20,120);
            g.flip();
            setInterval(()=>{
                var d = new Date();
                g.drawString(d.toString().split(" ")[4],190,0,true);
                g.drawString(AXP202.batV().toFixed(1)+"V",210,230,true);
                g.drawString(AXP202.batA().toFixed(1)+"ma   ",0,230,true);           
            },1000); 
        } else {
            if (require("Storage").read("app.js")){
                eval(require("Storage").read("app.js"));
            }
        }
    },200);
}


 
 

