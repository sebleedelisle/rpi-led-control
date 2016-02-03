
var LedControl = require("../rpi-led-control"); 

var lc = new LedControl(10,11, 8); // (5,13,6); 
var lc2 = new LedControl(13,5, 6); // (5,13,6); 
lc.setBrightness(0,15);
lc2.setBrightness(0,15);

var d1 = {x : 0, y:0, xvel:1, yvel :1}; 
var d2 = {x : 0, y:0, xvel:1, yvel :1}; 

var  startTime = Date.now();
//timer.setInterval(loop, '', '16m');
//timer.setInterval(loop2, '', '16m');
setInterval(loop, 1);
setInterval(loop2, 1);
var chars = 'Error - HEllo this is seb here ST4i for the win '.toUpperCase(); 

function loop() { 
	with(d1) { 
		lc.setLed(0,x,y,0); 
		lc.setLed(0,7-x,7-y,0); 
	
		x+=xvel;
	
		if((x==8)||(x==-1)) {
			x-=xvel;
			xvel*=-1;
			y+=yvel; 
			if((y==7)||(y==0)) yvel*=-1; 
		}
	 
		lc.setLed(0,x,y,1); 
		lc.setLed(0,7-x,7-y,1); 
	}
}
function loop2() { 
	lc2.clearDisplay(); 
	lc2.showNumber(0, (Date.now()-startTime)/20, 0, 3, false, 3, true) 
	lc2.showNumber(0, (Date.now()-startTime)/100, 0, 3, false, 7, true); 
	
	if(Date.now()-startTime>100000) startTime = Date.now();
	//console.log();
	// var num = (Date.now()/200)%chars.length<<0; 
	// 
	// for(var i = 0;i<8; i++) {
	// 	lc2.setChar(0,7-i,chars.charAt((num+i)%chars.length), !((((Date.now()/50)<<0)-i)%10)); 
	// }
	// 
	//with(d2) { 
	
		// lc2.setLed(0,x,y,0); 
		// 	lc2.setLed(0,7-x,7-y,0); 
		// 
		// 	x+=xvel;
		// 
		// 	if((x==8)||(x==-1)) {
		// 		x-=xvel;
		// 		xvel*=-1;
		// 		y+=yvel; 
		// 		if((y==7)||(y==0)) yvel*=-1; 
		// 	}
		//  
		// 	lc2.setLed(0,x,y,1); 
		// 	lc2.setLed(0,7-x,7-y,1); 
	//}
}



function delay(n) { 
	var start = Date.now(); 
	while(Date.now()<start+n);
}

