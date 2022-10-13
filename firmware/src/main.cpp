#include <Arduino.h>
#include <ArduinoLowPower.h>
#include <CayenneLPP.h>
#include <TinyLoRa.h>
#include <SPI.h>
#include "Adafruit_SHTC3.h"
#include <Adafruit_SGP30.h>
#include "secrets.h"

#define CCS811_ADDR 0x5B
#define VBATPIN A7
#define SLEEP_INTERVAL 10 * 60 * 1000

// #define DEBUG Serial
#define DEBUG_ENABLED true
#if DEBUG_ENABLED
#define Println(x) Serial.println(x)
#define Print(x) Serial.print(x)
#define PrintNum(x, y) Serial.print(x, y)
#else
#define Println(x)
#define Print(x)
#define PrintNum(x, y)
#endif

// LPP Data Packet to Send to TTN
CayenneLPP lpp(51);

TinyLoRa lora = TinyLoRa(3, 8, 4);

Adafruit_SHTC3 shtc3 = Adafruit_SHTC3(); // temp sensor
Adafruit_SGP30 sgp30 = Adafruit_SGP30(); // gas sensor

void printSensorError();

void setup()
{
  delay(2000);
  if (DEBUG_ENABLED)
  {
    Serial.begin(9600);
    delay(2000);
  }
  Println("TTN Air Quality Sensor");
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  lora.setChannel(CH0);
  lora.setDatarate(SF7BW125);

  if (!lora.begin())
  {
    Println("Failed");
    Println("Check your radio");
    Println("LoRa Failed");
    delay(500);
    NVIC_SystemReset();
  }
  Println("OK");

  delay(30 * 1000);
}

void loop()
{
  digitalWrite(LED_BUILTIN, HIGH);


  float batValue = ((analogRead(VBATPIN) * 2) * 3.3) / 1024;

  lpp.reset();

  lpp.addAnalogInput(1, batValue);

  Println("Sending LoRa Data...");
  lora.sendData(lpp.getBuffer(), lpp.getSize(), lora.frameCounter);
  Print("Frame Counter: ");
  Println(lora.frameCounter);
  lora.frameCounter++;

  delay(2000);

  digitalWrite(LED_BUILTIN, LOW);

  LowPower.sleep(SLEEP_INTERVAL);

#ifdef USBCON
  // USBDevice.attach();
#endif
  // delay(SLEEP_INTERVAL);

  Print("I'm awake now! I slept for ");
  PrintNum(SLEEP_INTERVAL / 1000, DEC);
  Println(" seconds.");
  Println();

  //delay(30 * 1000);
}
