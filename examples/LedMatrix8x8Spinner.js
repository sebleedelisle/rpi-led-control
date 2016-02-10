
var LedControl = require("../rpi-led-control"); 

var lc = new LedControl(13,26,19); // data pin, clock pin, cs pin
lc.setBrightness(0,15);


var angle = 0;
var x = 0; 
var y = 0;  
var startTime = Date.now(); 
setInterval(loop, 10);

function loop() { 
	lc.setLed(0,Math.floor(x+4),Math.floor(y+4),false);
	lc.setLed(0,Math.floor(4-(x*0.6)),Math.floor(4-(y*0.6)),false);
	
	speed = (Math.sin((Date.now()-startTime)*0.0002)) *0.3;
	angle += speed; //  (PI*2.0f) * (float)(i/360.0f); 

	x = Math.cos(angle)*3.5; 
	y = Math.sin(angle)*3.5; 

	lc.setLed(0,Math.floor(x+4),Math.floor(y+4),true);
	lc.setLed(0,Math.floor(4-(x*0.6)),Math.floor(4-(y*0.6)),true);

		
	
}


