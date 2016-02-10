
var LedControl = require("../rpi-led-control"); 

var lc = new LedControl(13,26,19); // data pin, clock pin, cs pin
lc.setBrightness(0,15);


var angle = 0;
var ball = {x:3, y:3, xVel:0.5, yVel:0.3}; 
var p1 = {x:0, y:3}; 
var p2 = {x:7, y:3}; 
drawPaddle(p1); 
drawPaddle(p2);

var startTime = Date.now(); 
setInterval(loop, 30);

function loop() { 
	lc.setLed(0,ball.x, ball.y,false);

	with(ball) { 
		x+=xVel; 
		y+=yVel; 
		
		if(x>7) { 
			x=7; 
			xVel*=-1; 
		} else if(x<0) { 
			x=0; 
			xVel*=-1; 
		}
		if(y>7) { 
			y=7; 
			yVel*=-1; 
		} else if(y<0) { 
			y=0; 
			yVel*=-1; 
		}
		
	}
		
	lc.setLed(0,ball.x, ball.y,true);

	if(ball.x<3) updatePaddle(p1, ball); 
	else if(ball.x>3) updatePaddle(p2, ball); 

}

function clearPaddle(paddle) { 
	with(paddle) { 
		lc.setLed(0,x, y,false); 
		lc.setLed(0,x, y+1,false);
	}
}

function drawPaddle(paddle) { 
	with(paddle) { 
		lc.setLed(0,x, y,true); 
		lc.setLed(0,x, y+1,true);
	}
}


function updatePaddle(paddle, ball) { 
	with(paddle) { 


		if(ball.y<y) {
			y--; 
			lc.setLed(0,x, y+2,false); 
			lc.setLed(0,x, y,true);
			lc.setLed(0,x, y+1,true);  
		}
		else if(ball.y>y+1) {
			
			y++; 
			lc.setLed(0,x, y-1,false);
			lc.setLed(0,x, y,true); 
			lc.setLed(0,x, y+1,true); 
		}
	}
	
}

