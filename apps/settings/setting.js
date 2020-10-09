TWATCH.setLCDTimeout(30);
const storage = require("Storage");
const showMenu = eval(storage.read("menu.js"));
var s = storage.readJSON("settings.json",1)||{ontime:5, bright:0.3};

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
    "Exit" : function() { storage.writeJSON("settings.json",s); load("launch.js");}
};

setTimeout(()=>{showMenu(mainmenu);},500);
