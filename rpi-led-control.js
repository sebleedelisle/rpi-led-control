var Gpio = require('onoff').Gpio;

module.exports = function(dataPin, clkPin, csPin, numDevices) { 
		
	const	OP_NOOP 	= 0x00,
			OP_DIGIT0 	= 0x01,
			OP_DIGIT1 	= 0x02,
			OP_DIGIT2 	= 0x03,
			OP_DIGIT3 	= 0x04,
			OP_DIGIT4 	= 0x05,
			OP_DIGIT5 	= 0x06,
			OP_DIGIT6 	= 0x07,
			OP_DIGIT7 	= 0x08,
			OP_DECODEMODE 	= 0x09,
			OP_INTENSITY 	= 0x0a,
			OP_SCANLIMIT 	= 0x0b,
			OP_SHUTDOWN 	= 0x0c,
			OP_DISPLAYTEST 	= 0x0f;
	
	const 	HIGH = 1,
			LOW = 0;
			LSBFIRST = 0, 
			MSBFIRST = 1; 
			/*
		   * The segments are identified as follows:
		   *    _a_
		   *  f|   |b
		   *   |_g_|
		   *   |   |
		   *  e|___|c  dp (decimal point)
		   *     d    * */
		
	var charTable = {
			'0' : parseInt('1111110',2), 
			'1' : parseInt('0110000',2), 
			'2' : parseInt('1101101',2), 
			'3' : parseInt('1111001',2), 
			'4' : parseInt('0110011',2), 
			'5' : parseInt('1011011',2), 
			'6' : parseInt('1011111',2), 
			'7' : parseInt('1110000',2),
			'8' : parseInt('1111111',2), 
			'9' : parseInt('1111011',2), 
			'a' : parseInt('1110111',2), 
			'b' : parseInt('0011111',2), 
			'c' : parseInt('0001101',2), 
			'd' : parseInt('0111101',2), 
			'E' : parseInt('1001111',2), 
			'e' : parseInt('1101111',2), 
			'f' : parseInt('1000111',2),
			'g' : parseInt('1111011',2),
			'H' : parseInt('0110111',2),
			'h' : parseInt('0010111',2),
			'i' : parseInt('0010000',2),
			'j' : parseInt('0111100',2),
			'k' : parseInt('1010111',2), 
			'l' : parseInt('0001110',2),
			'm' : parseInt('1110110',2),
			'n' : parseInt('0010101',2),
			'o' : parseInt('0011101',2),
			'p' : parseInt('1100111',2),
			'q' : parseInt('1110011',2),
			'r' : parseInt('0000101',2),
			's' : parseInt('1011011',2), 
			't' : parseInt('0001111',2),
			'u' : parseInt('0011100',2),
			'v' : parseInt('0011100',2),
			'w' : parseInt('0011100',2),
			'x' : parseInt('0110111',2),
			'y' : parseInt('0111011',2),
			'z' : parseInt('1101101',2),
			'-' : parseInt('0000001',2), 
			'_' : parseInt('0001000',2), 
			'[' : parseInt('1001110',2), 
			'(' : parseInt('1001110',2), 
			']' : parseInt('1111000',2), 
			')' : parseInt('1111000',2), 
			'°' : parseInt('1100011',2)
			};

	// var numDevices = typeof numDevices !== 'undefined' ?  numDevices : 1;
	// 	numDevices = constrain(numDevices, 1,8); 
	// 	
	if(typeof numDevices === 'undefined') { 
		numDevices = 1; 
	} else { 
		if(typeof numDevices !== 'number' || numDevices<1 || numDevices>8) { 
			throw 'numDevices must be a number between 1 and 8'; 
		}
	}
	
	var maxDevices = numDevices; 
	
	
	
	var spiMosi= new Gpio(dataPin, 'out'); 
	var spiClk = new Gpio(clkPin, 'out'); 
	var spiCs  = new Gpio(csPin, 'out');  
	
	// status is a pixelmap
	var status = new Array(64); 
	
	// stores the bytes to send. 
	var spidata = new Array(16);
	
	// CS enable pin goes low when transmitting
	spiCs.writeSync(HIGH); 

	// clear the pixel data
	for(var i=0;i<64;i++){ 
		status[i]=0x00;
	}
		
	
	for(var i=0;i<numDevices;i++) {

		spiTransfer(i,OP_DISPLAYTEST,0);
		//scanlimit is set to max on startup
		setScanLimit(i,7);
	
		//decode is done in source
		spiTransfer(i,OP_DECODEMODE,0);
		clearDisplay(i);
		
		//wake up (shut down : false) on startup 
		shutdown(i,false);
	}


	this.getDeviceCount = function() { return numDevices; }; 
	
	// shutdown puts it into power saving sleep mode. 
	// call with false to wake it up. 
	
	function shutdown(addr, b) {
	    if(addr<0 || addr>=maxDevices)
			throw 'address out of range';
			
	    if(b)
			spiTransfer(addr, OP_SHUTDOWN,0);
	    else
			spiTransfer(addr, OP_SHUTDOWN,1);
	}
	this.shutdown = shutdown; 
	
	// sets the number of pixels per row, pretty much 
	// always 8 for most devices. 
	
	function setScanLimit(addr, limit) {
	    if(addr<0 || addr>=maxDevices)
			return;

		//console.log("OP_SCANLIMIT");
	    if(limit>=0 && limit<8)
	    	spiTransfer(addr, OP_SCANLIMIT,limit);
	}
	this.setScanLimit = setScanLimit; 

	// sets the brightness of the LEDs, 0 to 15

	function setBrightness(addr, intensity) {
	    if(addr<0 || addr>=maxDevices)
			return;
	 	if (typeof intensity == 'undefined') return; 
		
		intensity = constrain(intensity, 0, 15); 
	    	
		spiTransfer(addr, OP_INTENSITY,intensity);

	}
	this.setBrightness = setBrightness;


	// clears the entire display 
	
	function clearDisplay(addr) {
	    if(addr<0 || addr>=maxDevices)
			throw 'address out of range';
		
	    var offset;
			
	    offset=addr*8;
	    for(var i=0;i<8;i++) {
			status[offset+i]=0;
			spiTransfer(addr, i+1,status[offset+i]);
	    }
	}
    this.clearDisplay = clearDisplay;
	
	function setLed(addr, column, row, state) {
		
	    var offset;
	    var val=0x00;

	    if(addr<0 || addr>=maxDevices)
			throw 'address out of range';
			
	    if(row<0 || row>7 || column<0 || column>7)
			return;
			
	    offset=addr*8;
	
	    val=parseInt(10000000,2) >> column;
	    
	
		if(state)
			status[offset+row]=status[offset+row] | val;
	    else {
			val=~val;
			status[offset+row]=status[offset+row] & val;
	    }
		
	    spiTransfer(addr, row+1,status[offset+row]);
	}
	this.setLed = setLed;

   /* 
     * Display a hexadecimal digit on a 7-Segment Display
     * Params:
     * addr	address of the display
     * digit	the position of the digit on the display (0..7)
     * value	the value to be displayed. (0x00..0x0F)
     * dp	sets the decimal point.
     */
    function setDigit(addr, digit, value, dp){
	    if(addr<0 || addr>=maxDevices)
			throw 'address out of range';
		if(digit<0 || digit>7) 
			throw 'invalid digit number'; 
		if(value<0 || value >15) throw 'number out of range'; 
			
		var offset = addr*8;
		var v = charTable[value];//.toString(16)]; 

		if(dp) v|=0x80; // set the decimal point bit if necessary
		
		status[offset+digit] = v; 
		spiTransfer(addr, digit+1, v); 
	
	};
	this.setDigit = setDigit; 

	// pos is passed in as 0 to 7, 0 on the left, 7 on the right
	
	function showNumber(addr, num, decimalplaces, mindigits, leftjustified, pos, dontclear) { 

	    if(addr<0 || addr>=maxDevices)
			throw 'address out of range';
		
		num = formatNumber(num, decimalplaces, mindigits); 
		
		// leftjustified = true;
		// pos = 2;
		// dontclear = true;
	
		// internally, pos is 0 on the right, so we set defaults, and convert
		if(typeof pos === 'undefined') { 
			if(leftjustified) { 
				pos = 7; 
			} else { 
				pos = 0; 
			}
		} else pos = 7-pos; 
		
		
		var decimalplace = num.length - num.indexOf('.')-1; 
		if(decimalplace!=-1) num = num.split('.').join(''); 
		if(typeof mindigits ==='number') { 
			while(num.length<mindigits) num = '0'+num; 
		}
		if(leftjustified) { 
			pos-=(num.length-1); 
		}
		
				
		for(var i = 0; i<8; i++) { 
			var offset = i+pos; 
			var char = num.charAt(num.length-1-i); 
			
			if((offset<8 && offset>=0) && (!dontclear || char!='')) 
				setDigit(addr, offset, parseInt(char), i>0 && i==decimalplace); 
			
		}
		
		
		
	}
	this.showNumber = showNumber; 
	
	function formatNumber(num, decimalplaces, mindigits) { 
		if(typeof decimalplaces !=='undefined') { 
			num = (Math.round(num*Math.pow(10,decimalplaces))) / Math.pow(10,decimalplaces);
			var parts = num.toString().split('.');
			// no decimal point 
			if (parts.length ==1) parts.push('');   
			while(parts[1].length<decimalplaces) parts[1] = parts[1]+'0'; 
			num = parts.join('.'); 
		} else { 
			num = num.toString(); 
		}
		return num; 
		
	}

    /* 
     */
    function setChar(addr, digit, char, dp){
		if(addr<0 || addr>=maxDevices)
			throw 'address out of range';
	    if(digit<0 || digit>7) 
			throw 'invalid digit number'; 
			
			
		var offset = addr*8;
		var v = charTable[value] || charTable[value.toLowerCase()];//.toString(16)]; 
		

		if(dp) v|=0x80; // set the decimal point bit if necessary

		status[offset+digit] = v; 
		spiTransfer(addr, digit+1, v);
		
	
	};
	this.setChar = setChar; 


	function shiftOut(dataPin, clockPin, bitOrder, val)
	{

	     for (var i = 0; i < 8; i++)  {
	           if (bitOrder == LSBFIRST)
	                 dataPin.writeSync((val & (1 << i)) == 0 ? 0 : 1);
	           else      
	                 dataPin.writeSync((val & (1 << (7 - i)))== 0 ? 0 : 1);
				
				clockPin.writeSync(HIGH);
				clockPin.writeSync(LOW);            
	     }

	}
	function getBinaryString(val, minLength) { 
		val = val.toString(2); 
		while(val.length<minLength) val='0'+val; 
		return val; 
	}
	function constrain(value, min, max) { 
		if(value<min) return min; 
		else if(value>max) return max; 
		else return value; 
	}

	function spiTransfer(addr, opcode, data) {
		
		// the offset is the start row of data for this display
	    var offset=addr*2;
		// and the maximum number of bytes depends on the number 
		// of displays
	    var maxbytes=maxDevices*2;

	    for(var i=0;i<maxbytes;i++)
			spidata[i]=0;
			
	    //put our device data into the array
	    spidata[offset+1]=opcode;
	    spidata[offset]=data;
	    //enable the line 
	    spiCs.writeSync(LOW);
	    //Now shift out the data 
		//console.log(spidata); 
		
	    for(var i=maxbytes;i>0;i--) {
	 		shiftOut(spiMosi,spiClk, MSBFIRST, spidata[i-1]);
		}
	    //latch the data onto the display
	    spiCs.writeSync(HIGH);
	}	
	this.spiTransfer = spiTransfer;
}