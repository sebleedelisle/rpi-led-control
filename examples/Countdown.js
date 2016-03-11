var LedControl = require("../rpi-led-control"); 

var lc = new LedControl(13, 5, 6); 
var countdownTime = 5000, startTime = Date.now(); 

lc.setBrightness(0,15);
var txt = 'loading'; 
for(var i = 0; i<txt.length; i++) { 
	lc.setChar(0,7-i,txt.charAt(i));
}
var  startTime = Date.now();

setInterval(update, 1); 
function update() { 
	var milstopass = countdownTime - (Date.now()-startTime); 
	lc.showNumber(0,milstopass/1000,2,2);
	
	
}

