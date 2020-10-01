   
function RTC(){

    function Bcd2Int(v){
        var tmp = Math.floor(v/16) * 10;
        return (tmp + v%16);
    }

    function Int2Bcd(v) {
        var tmp = Math.floor(v/10) *16;
        return (tmp + v%10);
    }

    function getRTCdt() {
        I2C1.writeTo(0x51,0x02);
        var buf = I2C1.readFrom(0x51,7);
        return {secs: Bcd2Int(buf[0]&0x7f),
                mins: Bcd2Int(buf[1]&0x7f),
                hrs : Bcd2Int(buf[2]&0x3f),
                day:  Bcd2Int(buf[3]&0x3f),
                dofw: Bcd2Int(buf[4]&0x07),
                month:Bcd2Int(buf[5]&0x1f), 
                year: Bcd2Int(buf[6]&0x7f)+2000};
    }

    function setRTCdt(t) {
        var buf = new Int8Array([
            Int2Bcd(t.secs),
            Int2Bcd(t.mins),
            Int2Bcd(t.hrs),
            Int2Bcd(t.day),
            Int2Bcd(t.dofw),
            Int2Bcd(t.month),
            Int2Bcd(t.year)]);
        I2C1.writeTo(0x51,0x02,buf);
    }

    function setESP32fromRTC(){
        var dt =  new Date();
        var rd = getRTCdt();
        dt.setFullYear(rd.year,rd.month-1,rd.day);
        dt.setHours(rd.hrs,rd.mins,rd.secs);
        setTime(dt.getTime()/1000);
    }

    function setRTCfromESP32(){
        var dt = new Date();
        setRTCdt({
            secs:dt.getSeconds(),
            mins:dt.getMinutes(),
            hrs:dt.getHours(),
            day:dt.getDate(),
            dofw:dt.getDay()+1,
            month:dt.getMonth()+1,
            year:dt.getFullYear()-2000
        });
    }

   return {setRTC:setRTCfromESP32, setSYS:setESP32fromRTC};
}

