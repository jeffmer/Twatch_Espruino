   
function RTC(){

    function Bcd2Int(v){
        var tmp = Math.floor(v/16) * 10;
        return (tmp + v%16);
    }

    function Int2Bcd(v) {
        var tmp = Math.floor(v/10) *16;
        return (tmp + v%10);
    }

    function getRTCtime() {
        I2C1.writeTo(0x51,0x02);
        var buf = I2C1.readFrom(0x51,3);
        return {secs: Bcd2Int(buf[0]&0x7f),
                mins: Bcd2Int(buf[1]&0x7f),
                hrs : Bcd2Int(buf[2]&0x7f)};
    }

    function setRTCtime(t) {
        var buf = new Int8Array([Int2Bcd(t.secs),Int2Bcd(t.mins),Int2Bcd(t.hrs)]);
        I2C1.writeTo(0x51,0x02,buf);
    }

    function getRTCdate() {
        I2C1.writeTo(0x51,0x05);
        var buf = I2C1.readFrom(0x51,4);
        return {day:  Bcd2Int(buf[0]&0x3f),
                dofw: Bcd2Int(buf[1]&0x07),
                month : Bcd2Int(buf[2]&0x1f), 
                year: Bcd2Int(buf[3]&0x7f)+2000};
    }

    function setRTCdate(d) {
        var buf = new Int8Array(
            [Int2Bcd(d.day),
                Int2Bcd(d.dofw),
                Int2Bcd(d.month),
                Int2Bcd(d.year)
            ]);
        I2C1.writeTo(0x51,0x05,buf);
    }

    function setESP32fromRTC(){
        var dt =  new Date();
        var d = getRTCdate();
        dt.setFullYear(d.year,d.month-1,d.day);
        var t = getRTCtime();
        dt.setHours(t.hrs,t.mins,t.secs);
        setTime(dt.getTime()/1000);
    }

    function setRTCfromESP32(){
        var dt = new Date();
        setRTCdate({
            day:dt.getDate(),
            dofw:dt.getDay()+1,
            month:dt.getMonth()+1,
            year:dt.getFullYear()-2000
        });
        setRTCtime({
            secs:dt.getSeconds(),
            mins:dt.getMinutes(),
            hrs:dt.getHours()
        });
    }
//test
//setRTCtime({secs:59,mins:47,hrs:14});
//setRTCdate({day:31,dofw:2,month:8,year:20});
//setESP32fromRTC();
//setRTCfromESP32();
   return {setRTC:setRTCfromESP32, setSYS:setESP32fromRTC};
}

