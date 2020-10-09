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
        var data = state?(buf | 0x01<<bus):(buf & ~(0x01<<bus));
        if (state) data|=2; //AXP202 DCDC3 force
        AXP202.writeByte(0x12,data);
    },
    setLD02:(state) => {return AXP202.setPower(2,state);},
    setExten:(state) => {return AXP202.setPower(0,state);},
    setDCDC2:(state) => {return AXP202.setPower(4,state);},
    setLD04:(state) => {return AXP202.setPower(3,state);},
    setLD03:(state) => {return AXP202.setPower(6,state);},
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
    setLD03Mode:(m)=>{
        var val = AXP202.readByte(0x29);
        if (m) val|=0x80; else val&=0x7F;
        AXP202.writeByte(0x29,val);
    },
    setDCDC3Voltage:(mv)=>{
        if (mv<700 || mv>3500) return;
        var val = (mv-700)/25;
        AXP202.writeByte(0x27,val);
    },
    batV:() => {
        I2C1.writeTo(0x35,0x78);
        var d = I2C1.readFrom(0x35,2);
        var v = d[0]*16+d[1];
        const ADCLSB = 1.1 / 1000.0;
        return v * ADCLSB;
    },
    batPercent:() => {
        var v = AXP202.readByte(0xB9);
        if (!(v & 0x80)) return v & 0x7F;
        return 0;
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
    },
    supplyA:() => {
        var hv = AXP202.readByte(0x5C);
        var lv = AXP202.readByte(0x5D);
        return ((hv << 4) | (lv & 0x0F)) * 0.375;
    }, 
    init:() => {
        AXP202.setLEDoff();
        AXP202.setCharge(300); // 300 ma is max  charge
        AXP202.setLD02(1); //g power on
        AXP202.setExten(0);
        AXP202.setDCDC2(0);
        AXP202.setLD03Mode(1);
        AXP202.setLD03(0);
        AXP202.setLD04(0);
        AXP202.adc1Enable(0xCD,true);
    }
}

AXP202.init();
ESP32.wifiStart(false); // turn off wifi & bluetooth to save power
//ESP32.bleStart(false);

if (require("Storage").read("rtc.js")){
    eval(require("Storage").read("rtc.js"));
    var rtc = RTC();
    rtc.setSYS(); //set systemclock from Real-Time Clock;
}

if (require("Storage").read("touch.js")){
    eval(require("Storage").read("touch.js"));
}

var s = require("Storage").readJSON("settings.json",1)||{ontime:5, bright:0.3};

var TWATCH = {
    ON_TIME: 5,
    BRIGHT : 0.3,
    setLCDTimeout:(v)=>{TWATCH.ON_TIME=v<5?5:v;},
    setLCDBrightness:(v)=>{TWATCH.BRIGHT=v; brightness(v);},
    init:()=>{
        var s = require("Storage").readJSON("settings.json",1)||{ontime:5, bright:0.3};
        TWATCH.ON_TIME=s.ontime;
        TWATCH.BRIGHT=s.bright;
    }
};

TWATCH.init();

function init_power_man() {
    var time_left = TWATCH.ON_TIME;
    var powInterval = null;
    function power_man() {
        time_left--;
        if (time_left<=0){
           powInterval=clearInterval(powInterval);
           TWATCH.emit("sleep",true);
           brightness(0);
           g.lcd_sleep();
           ESP32.adcPower(false);  //power saving
           ESP32.wifiStart(false);
           //ESP32.bleStart(false);
           //ESP32.setCPUfreq(1); // 80MHz
           AXP202.setDCDC3Voltage(2700);
           ESP32.deepSleep(-1,D38,0); //light sleep
           AXP202.setDCDC3Voltage(3300);
           //ESP32.setCPUfreq(3); // 240MHz
           g.lcd_wake();
           if(rtc) rtc.setSYS();
           TWATCH.emit("sleep",false);
           setTimeout(()=>{brightness(TWATCH.BRIGHT);},200);
           time_left=TWATCH.ON_TIME;
           powInterval=setInterval(power_man,1000); 
        }
    }
    FT5206.on('touch',(p)=>{time_left=TWATCH.ON_TIME;});
    powInterval=setInterval(power_man,1000);
}

FT5206.on("longtouch", ()=> {load("launch.js")});

if (require("Storage").read("lcd.js")){
    eval(require("Storage").read("lcd.js"));
    var g = ST7789();
    brightness(TWATCH.BRIGHT);
    setTimeout(()=>{
        if (TOUCH_PIN.read()){init_power_man();}
    },500);
}
    /*
    setTimeout(() => {
        if (TOUCH_PIN.read()){
            g.setRotation(0);
            g.setColor(0xFFFF);
            g.setFont("6x8");
            g.drawString("T-Watch 2020 Espruino "+process.version,20,100);
            var d = new Date();
            g.drawString(d.toString().substr(0,15),20,120);
        } else {
            init_power_man();
            var f = require("Storage");
            var execapp = f.read(".exec");
            eval(f.read(execapp));
        }
    },200);
}
*/


 
 

