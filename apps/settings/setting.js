TWATCH.setLCDTimeout(30);
const storage = require("Storage");
const showMenu = eval(storage.read("menu.js"));
var s = storage.readJSON("settings.json",1)||{ontime:5, bright:0.3, cpufreq:240, timezone:1};

var mainmenu = {
    "" : { "title" : "Settings" },
    "On Time" :{ value : s.ontime,
                  min:5,max:120,step:5,
                  onchange : v => { s.ontime=v;}
                },
    "Brightness" :{ value : s.bright,
                  min:0.1,max:1.0,step:0.1,
                  onchange : v => { brightness(v); s.bright=v;}
                },
    "CPU (mhz)" :{ value : s.cpufreq,
                  min:80,max:240,step:80,
                  onchange : v => {s.cpufreq=v;}
                },
    "Time Zone" :{ value : s.timezone,
                  min:-12,max:12,step:80,
                  onchange : v => {s.cpufreq=v;}
                },
    "Exit" : function() { storage.writeJSON("settings.json",s); load("launch.js");}
};

setTimeout(()=>{showMenu(mainmenu);},500);
