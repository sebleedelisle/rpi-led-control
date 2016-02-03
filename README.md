# rpi-led-control
-----------------
Use your Raspberry Pi to control 7 segment LED displays and LED matrixes (matrices?) that incorporate the MAX7219 chip. These devices are widely and cheaply available online. You can connect these to any of the Raspberry Pi GPIO pins and you can daisy chain 8 of the devices together. 

This library is based on the Arduino library [LedControl](http://playground.arduino.cc/Main/LedControl). Thanks also to the [MAX7219 library](https://github.com/victorporof/MAX7219.js) for inspiration.

## Install

`npm install rpi-led-control`

## How to use

```javascript
var LedControl = require("rpi-led-control"); 
var lc = new LedControl(datapin, clockpin, cspin);

// if you're using a LED matrix : 
// On matrix number 0, turn the LED at position 5,4 on. 
lc.setLed(0, 5, 4, 1); 
lc.setLed(0, 1, 4, 1); 

// if you're using a 7 segment display : 
// on matrix number 0, show the number 1023. Defaults are right justified. 
lc.showNumber(0,1023);

// on matrix 0, change the digit at index 3 to the number 5.
lc.setDigit(0,3,5); 

// it also makes an attempt at showing letters from the alphabet, with varying results
lc.setChar(0,7,'H'); 
lc.setChar(0,6,'E'); 
lc.setChar(0,5,'L'); 
lc.setChar(0,4,'L'); 
lc.setChar(0,3,'O'); 


```

## Dependencies

The `onoff` GPIO library is required, it should be installed automatically on an npm install but if not you can get it on github at https://github.com/fivdi/onoff


## API

####new LedControl(dataPin, clockPin, csPin, [numberOfDevices])

Returns a LedControl object that can control up to 8 different LED displays daisy chained together. The first three parameters are the GPIO pin numbers that the data, clock and cs (chip select) pins are connected to. The optional parameter **numberOfDevices** allows you to select how many displays are daisy chained together (the default is 1 so leave it empty if you're just working with one device).

Once the constructor has been called, the connected displays will be initialised and ready to run. 

Subsequent calls to the API usually require a **deviceNumber** which is the index number for each display in the chain. If you are just using one display, this will always be 0, if you have multiple displays, index 0 is the last one in the chain. 


#####setBrightness(deviceNumber, brightness)

Adjusts the brightness of the display specified by **deviceNumber**, where **brightness** can be an integer from 0 (dimmest) to 15 (brightest). If you are just using one display, **deviceNumber** should always be 0. 


#####clearDisplay(devicenumber)

Turns all the LEDs on the display off, where **deviceNumber** is the relevant display. 
    
#####setLed(deviceNumber, column, row, state)

This is for use on the 8x8 LED matrix displays, turns an individual LED on or off. 

  * deviceNumber - the display you are addressing
  * column, row  - the x and y position for the pixel you want to change, each range from 0 to 7. 
  * state - 0 for off and 1 for on
  
#####setDigit(deviceNumber, digit, value, [dp])

For use on 7 segment displays, displays a number on a given digit of the display. 

  * deviceNumber - the display you are addressing
  * digit  - the digit number on the display ranges from 0 to 7. 0 is usually the digit on the right.  
  * value - a number from 0 to 15. Will display 0 to 9, and then hex A to F for 10 to 15. 
  * dp - optional, if true, the decimal point on that digit will light. (default is false)
  
#####setChar(deviceNumber, digit, character, [dp])

The same as setDigit, except it will attempt to display an alphanumeric character on the display. Obviously it is impossible to represent some letters in seven segments (ie m and v) but it makes a valient attempt nonetheless. 

#####showNumber(deviceNumber, num, [decimalplaces], [minimumdigits], [leftjustified], [pos], [dontclear]) 

A simple way to show a number on the display. If you just provide a number, it will work out how to represent that on the display, right justified by default, and including the decimal point where relevant. 

  * deviceNumber - the display you are addressing
  * num - the number you want to display. 
  * decimalplaces (optional) - round to a specified number of decimal places. 
  * mindigits (optional) - if specified the number will be padded with leading zeros until the minimum number of digits has been reached. 
  * leftjustified (optional) - if true, the number will be left aligned, defaults to false, ie aligned to the right. 
  * pos (optional) - allows you to specify a digit number for the number to be displayed at. If right justified, this postion will be the right most digit. If left, the left-most. Accepts a number from 0 to 7, where 7 is the left-most digit. If undefined, the number will be fully to the left or right, depeneding on the justification setting.  
  * dontclear (optional) - by default, the entire display is rewritten, even empty spaces. This advanced setting enables you to show two separate numbers on the left and right hand side of the display (although be sure to manually call clearDisplay first). 
  
  
  


  
  
  
  
