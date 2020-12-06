# Twatch_Espruino
 
Provides an environment for running Espruino apps on a Lilygo TTGO T-watch 2020 v1.

You can see it in action at on Youtube [here](https://youtu.be/j1dHLK7ZZ_4).

### Installation Notes ###

You first need the firmware [espruino_2v07.69_twatch.tgz](https://github.com/jeffmer/Twatch_Espruino/blob/master/espruino_2v07.69_twatch.tgz) which has the changes to Espruino outlined below. You can find instructions for flashing firmware to an ESP32 [here](https://www.espruino.com/ESP32).
 

Since the Espruino App Loader does not work over a serial link, javascript has to be uploaded using the WebIDE.

Files need to be renamed as they are uploaded as follows:

`boot0.js` => `.boot0`
`bootcde.js` => `.bootcde`

Javascript applications :

`xxx.js` => `xxx.app.js`

The easiest way to do this is click on the Device Storage icon of the WebIDE. Choose "Upload a file" and then rename the selected file in the name field that appears before the upload is executed.


### Apps ###

Bangle Apps can be ported fairly easily. The reprogramming required is to adapt the Bangle button controls to the touch screen. You can see my Multiclock app and @fredericrous 's excellent calculator in the video. 

An implementation of `E.showMenu()` provides emulated buttons. Here is an example using this to run the Bangle App Manager:

 ![](https://raw.githubusercontent.com/jeffmer/Twatch_Espruino/master/apps/fileman/menupic.jpg)

### Battery life ###

This was the biggest headache. I implemented access to the ESP32's light sleep, however, initially, the current consumption during sleep was 20ma. I nearly gave up at that point but eventually discovered that the ESP32 Espruino port initialises all GPIO pins with pullups. When I removed this initialisation, the sleep current dropped to 4ma. The T-watch has an AXP202 power management chip and by reducing the CPU supply voltage to 2.7V, the sleep current is now 2.5ma. The battery is nominally 380mah and probably more realistically around 300mah giving around 5 days standby power - not amazing compared to the Bangle but at least useable.

The active power consumption is around 90ma - again not great when compared to the Bangle, however the screen is brighter even at 30% of maximum brightness. To get to 90ma, I have removed the BLUETOOTH component which consumes around 40ma.

### Graphics ###

The T-watch has a 240*240 1.54ins screen driven by an ST7789V driver - the same chip as the Bangle, however the interface is SPI not 8-bit parallel. Thanks to @MaBe ‘s `lcd_unbuf_spi` module with recent performance enhancements, graphics are not as fast as the Bangle but are not unusably slow. The T-Watch has SPIRAM and consequently has 20,000 vars versus 2200 on the Bangle. This means you can freely use large ArrayBuffers and drawImage to reduce screen flicker - the analogue clock in the video uses a 200 x 240 2-bit buffer.

Read more on the Espruino forum [here](http://forum.espruino.com/conversations/347670/).