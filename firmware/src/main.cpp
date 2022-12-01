/*******************************************************************************
 *
 *  File:          LMIC-node.cpp
 *
 *  Function:      LMIC-node main application file.
 *
 *  Copyright:     Copyright (c) 2021 Leonel Lopes Parente
 *                 Copyright (c) 2018 Terry Moore, MCCI
 *                 Copyright (c) 2015 Thomas Telkamp and Matthijs Kooijman
 *
 *                 Permission is hereby granted, free of charge, to anyone
 *                 obtaining a copy of this document and accompanying files to do,
 *                 whatever they want with them without any restriction, including,
 *                 but not limited to, copying, modification and redistribution.
 *                 The above copyright notice and this permission notice shall be
 *                 included in all copies or substantial portions of the Software.
 *
 *                 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY.
 *
 *  License:       MIT License. See accompanying LICENSE file.
 *
 *  Author:        Leonel Lopes Parente
 *
 *  Description:   To get LMIC-node up and running no changes need to be made
 *                 to any source code. Only configuration is required
 *                 in platform-io.ini and lorawan-keys.h.
 *
 *                 If you want to modify the code e.g. to add your own sensors,
 *                 that can be done in the two area's that start with
 *                 USER CODE BEGIN and end with USER CODE END. There's no need
 *                 to change code in other locations (unless you have a reason).
 *                 See README.md for documentation and how to use LMIC-node.
 *
 *                 LMIC-node uses the concepts from the original ttn-otaa.ino
 *                 and ttn-abp.ino examples provided with the LMIC libraries.
 *                 LMIC-node combines both OTAA and ABP support in a single example,
 *                 supports multiple LMIC libraries, contains several improvements
 *                 and enhancements like display support, support for downlinks,
 *                 separates LoRaWAN keys from source code into a separate keyfile,
 *                 provides formatted output to serial port and display
 *                 and supports many popular development boards out of the box.
 *                 To get a working node up and running only requires some configuration.
 *                 No programming or customization of source code required.
 *
 *  Dependencies:  External libraries:
 *                 MCCI LoRaWAN LMIC library  https://github.com/mcci-catena/arduino-lmic
 *                 IBM LMIC framework         https://github.com/matthijskooijman/arduino-lmic
 *                 U8g2                       https://github.com/olikraus/u8g2
 *                 EasyLed                    https://github.com/lnlp/EasyLed
 *
 ******************************************************************************/

#include "LMIC-node.h"
#include "funcs.h"
#include "pins.h"
#include "channels.h"
#include <CayenneLPP.h>
#include "Adafruit_SGP30.h"
#include "Adafruit_SHTC3.h"

//  █ █ █▀▀ █▀▀ █▀▄   █▀▀ █▀█ █▀▄ █▀▀   █▀▄ █▀▀ █▀▀ ▀█▀ █▀█
//  █ █ ▀▀█ █▀▀ █▀▄   █   █ █ █ █ █▀▀   █▀▄ █▀▀ █ █  █  █ █
//  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀

CayenneLPP lpp(51);
Adafruit_SGP30 sgp;
Adafruit_SHTC3 shtc3 = Adafruit_SHTC3();

// custom globals:

uint32_t opens;


Serial_& serial = Serial;
#ifdef USE_LED
    EasyLed led(LED_BUILTIN, EasyLed::ActiveLevel::High);
#endif
extern const char * const lmicErrorNames[];

//  █ █ █▀▀ █▀▀ █▀▄   █▀▀ █▀█ █▀▄ █▀▀   █▀▀ █▀█ █▀▄
//  █ █ ▀▀█ █▀▀ █▀▄   █   █ █ █ █ █▀▀   █▀▀ █ █ █ █
//  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀▀ ▀ ▀ ▀▀

static osjob_t collectJob;
uint32_t doWorkIntervalSeconds = DO_WORK_INTERVAL_SECONDS; // Change value in platformio.ini

// Note: LoRa module pin mappings are defined in the Board Support Files.

static void doWorkCallback(osjob_t *job)
{
    // Event hander for collectJob. Gets called by the LMIC scheduler.
    // The actual work is performed in function processWork() which is called below.

    ostime_t timestamp = os_getTime();
#ifdef USE_SERIAL
    serial.println();
    printEvent(timestamp, "doWork job started", PrintTarget::Serial);
#endif

    // Do the work that needs to be performed.
    processWork(timestamp);

    // This job must explicitly reschedule itself for the next run.
    ostime_t startAt = timestamp + sec2osticks((int64_t)doWorkIntervalSeconds);
    os_setTimedCallback(&collectJob, startAt, doWorkCallback);
}

lmic_tx_error_t scheduleUplink(uint8_t fPort, uint8_t *data, uint8_t dataLength, bool confirmed = false)
{
    // This function is called from the processWork() function to schedule
    // transmission of an uplink message that was prepared by processWork().
    // Transmission will be performed at the next possible time

    ostime_t timestamp = os_getTime();
    printEvent(timestamp, "Packet queued");

    lmic_tx_error_t retval = LMIC_setTxData2(fPort, data, dataLength, confirmed ? 1 : 0);
    timestamp = os_getTime();

    if (retval == LMIC_ERROR_SUCCESS)
    {
#ifdef CLASSIC_LMIC
        // For MCCI_LMIC this will be handled in EV_TXSTART
        setTxIndicatorsOn();
#endif
    }
    else
    {
        String errmsg;
#ifdef USE_SERIAL
        errmsg = "LMIC Error: ";
#ifdef MCCI_LMIC
        errmsg.concat(lmicErrorNames[abs(retval)]);
#else
        errmsg.concat(retval);
#endif
        printEvent(timestamp, errmsg.c_str(), PrintTarget::Serial);
#endif
#ifdef USE_DISPLAY
        errmsg = "LMIC Err: ";
        errmsg.concat(retval);
        printEvent(timestamp, errmsg.c_str(), PrintTarget::Display);
#endif
    }
    return retval;
}

//  █ █ █▀▀ █▀▀ █▀▄   █▀▀ █▀█ █▀▄ █▀▀   █▀▄ █▀▀ █▀▀ ▀█▀ █▀█
//  █ █ ▀▀█ █▀▀ █▀▄   █   █ █ █ █ █▀▀   █▀▄ █▀▀ █ █  █  █ █
//  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀

void processWork(ostime_t doWorkJobTimeStamp)
{
    // This function is called from the doWorkCallback()
    // callback function when the doWork job is executed.

    // Uses globals: payloadBuffer and LMIC data structure.

    // This is where the main work is performed like
    // reading sensor and GPS data and schedule uplink
    // messages if anything needs to be transmitted.

    // Skip processWork if using OTAA and still joining.
    if (LMIC.devaddr != 0)
    {

        lpp.reset();

        ostime_t timestamp = os_getTime();

#ifdef USE_DISPLAY
        // Interval and Counter values are combined on a single row.
        // This allows to keep the 3rd row empty which makes the
        // information better readable on the small display.
        display.clearLine(INTERVAL_ROW);
        display.setCursor(COL_0, INTERVAL_ROW);
        display.print("I:");
        display.print(doWorkIntervalSeconds);
        display.print("s");
        display.print(" Ctr:");
        display.print(counterValue);
#endif
#ifdef USE_SERIAL
        printEvent(timestamp, "Input data collected", PrintTarget::Serial);
        printSpaces(serial, MESSAGE_INDENT);
#endif

        // For simplicity LMIC-node will try to send an uplink
        // message every time processWork() is executed.

        uint32_t PIR = digitalRead(PIR_PIN);
        serial.print("Got PIR Input:");
        serial.println(PIR);
        lpp.addDigitalInput(CHANNEL_PIR, PIR);

        printSpaces(serial, MESSAGE_INDENT);
        uint32_t charging = digitalRead(CHARGING_PIN);
        serial.print("Charging:");
        serial.print(charging);
        uint32_t pgood = digitalRead(POWER_GOOD_PIN);
        serial.print(" Power Good:");
        serial.println(pgood);
        lpp.addDigitalInput(CHANNEL_CHARGING, charging);
        lpp.addDigitalInput(CHANNEL_POWER_GOOD, pgood);

        uint32_t liquid = analogRead(LIQUID_PIN);
        printSpaces(serial, MESSAGE_INDENT);
        serial.print("Got liquid Input:");
        serial.println(liquid);
        lpp.addAnalogInput(CHANNEL_LIQUID, liquid);

        uint32_t door = digitalRead(DOOR_PIN);
        printSpaces(serial, MESSAGE_INDENT);
        serial.print("Door: ");
        serial.print(door);
        lpp.addDigitalInput(CHANNEL_DOOR, door);
        serial.print("  Total Opens: ");
        serial.println(opens);
        lpp.addDigitalInput(CHANNEL_OPENS, opens);
        opens = 0;

        uint32_t water = digitalRead(WATER_LEVEL_0_PIN);
        printSpaces(serial, MESSAGE_INDENT);
        serial.print("Water: ");
        serial.println(water);
        lpp.addDigitalInput(CHANNEL_WATER, water);

        if(!sgp.IAQmeasure()){
            printEvent(os_getTime(), "IAQ (Gas Sensor) measurement failed!");
        }
        printSpaces(serial, MESSAGE_INDENT);
        serial.print("CO2:");
        serial.print(sgp.eCO2);
        serial.print("  TVOC:");
        serial.println(sgp.TVOC);
        lpp.addTemperature(CHANNEL_CO2, sgp.eCO2);
        lpp.addTemperature(CHANNEL_TVOC, sgp.TVOC);

        sensors_event_t humidity, temp;
        if(!shtc3.getEvent(&humidity, &temp)){
            printEvent(os_getTime(), "SHTC3 (Temp/Hum) measurement failed!");
        }
        printSpaces(serial, MESSAGE_INDENT);
        serial.print("Temp:");
        serial.print(temp.temperature);
        serial.print("  Humidity:");
        serial.println(humidity.relative_humidity);
        lpp.addTemperature(CHANNEL_TEMP, temp.temperature);
        lpp.addRelativeHumidity(CHANNEL_HUM, humidity.relative_humidity);

        // Schedule uplink message if possible
        if (LMIC.opmode & OP_TXRXPEND)
        {
// TxRx is currently pending, do not send.
#ifdef USE_SERIAL
            printEvent(timestamp, "Uplink not scheduled because TxRx pending", PrintTarget::Serial);
#endif
#ifdef USE_DISPLAY
            printEvent(timestamp, "UL not scheduled", PrintTarget::Display);
#endif
        }
        else
        {
            // Prepare uplink payload.
            uint8_t fPort = 10;
            scheduleUplink(fPort, lpp.getBuffer(), lpp.getSize());
        }
    }
}

// Interrupt Handlers:
ostime_t lastDoor;
// Called on RISING of the door pin
void handleDoorOpen()
{
    ostime_t timestamp = os_getTime();
    if (timestamp - lastDoor < 500)
        return;

    printEvent(timestamp, "Door Open");
    lastDoor = timestamp;
    opens++;
}

void handlePIRChange()
{
    bool pir = digitalRead(PIR_PIN);
    printEvent(os_getTime(), "PIR Input Changed");
    digitalWrite(LIGHT_PIN, pir);
}

void processDownlink(ostime_t txCompleteTimestamp, uint8_t fPort, uint8_t *data, uint8_t dataLength)
{
    // This function is called from the onEvent() event handler
    // on EV_TXCOMPLETE when a downlink message was received.

    // Implements a 'reset counter' command that can be sent via a downlink message.
    // To send the reset counter command to the node, send a downlink message
    // (e.g. from the TTN Console) with single byte value resetCmd on port cmdPort.

    const uint8_t cmdPort = 100;
    const uint8_t resetCmd = 0xC0;

    if (fPort == cmdPort && dataLength == 1 && data[0] == resetCmd)
    {
#ifdef USE_SERIAL
        printSpaces(serial, MESSAGE_INDENT);
        serial.println(F("Reset cmd received"));
#endif
        ostime_t timestamp = os_getTime();
        printEvent(timestamp, "Counter reset", PrintTarget::All, false);
    }
}

//  █ █ █▀▀ █▀▀ █▀▄   █▀▀ █▀█ █▀▄ █▀▀   █▀▀ █▀█ █▀▄
//  █ █ ▀▀█ █▀▀ █▀▄   █   █ █ █ █ █▀▀   █▀▀ █ █ █ █
//  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀▀ ▀ ▀ ▀▀

void setup()
{

#ifdef USE_DISPLAY
    initDisplay();
#endif

#ifdef USE_SERIAL
    initSerial(MONITOR_SPEED, WAITFOR_SERIAL_S);
#endif


#if defined(USE_SERIAL) || defined(USE_DISPLAY)
    printHeader(doWorkIntervalSeconds);
#endif

    initLmic();

    //  █ █ █▀▀ █▀▀ █▀▄   █▀▀ █▀█ █▀▄ █▀▀   █▀▄ █▀▀ █▀▀ ▀█▀ █▀█
    //  █ █ ▀▀█ █▀▀ █▀▄   █   █ █ █ █ █▀▀   █▀▄ █▀▀ █ █  █  █ █
    //  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀ 

    pinMode(PIR_PIN, INPUT);
    pinMode(WATER_LEVEL_0_PIN, INPUT_PULLDOWN);
    pinMode(WATER_LEVEL_1_PIN, INPUT_PULLDOWN);
    pinMode(WATER_LEVEL_2_PIN, INPUT_PULLDOWN);
    pinMode(WATER_LEVEL_3_PIN, INPUT_PULLDOWN);
    pinMode(LIQUID_PIN, INPUT);
    pinMode(DOOR_PIN, INPUT_PULLDOWN);
    pinMode(POWER_GOOD_PIN, INPUT);
    pinMode(CHARGING_PIN, INPUT);

    pinMode(LIGHT_PIN, OUTPUT);

    if (sgp.begin())
    {
        ostime_t timestamp = os_getTime();
        printEvent(timestamp, "Found SGP30");
        printSpaces(serial, MESSAGE_INDENT);
        Serial.print(sgp.serialnumber[0], HEX);
        Serial.print(sgp.serialnumber[1], HEX);
        Serial.println(sgp.serialnumber[2], HEX);
    }
    else
    {
        ostime_t timestamp = os_getTime();
        printEvent(timestamp, "SGP Sensor not found ");
    }

    if (shtc3.begin())
    {
        ostime_t timestamp = os_getTime();
        printEvent(timestamp, "Found SHTC3 Sensor");
    }
    else
    {
        ostime_t timestamp = os_getTime();
        printEvent(timestamp, "SHTC3 Sensor not found ");
    }

    attachInterrupt(digitalPinToInterrupt(DOOR_PIN), handleDoorOpen, RISING);
    attachInterrupt(digitalPinToInterrupt(PIR_PIN), handlePIRChange, CHANGE);

    //  █ █ █▀▀ █▀▀ █▀▄   █▀▀ █▀█ █▀▄ █▀▀   █▀▀ █▀█ █▀▄
    //  █ █ ▀▀█ █▀▀ █▀▄   █   █ █ █ █ █▀▀   █▀▀ █ █ █ █
    //  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀▀ ▀ ▀ ▀▀

    if (activationMode == ActivationMode::OTAA)
    {
        LMIC_startJoining();
    }

    // Schedule initial doWork job for immediate execution.
    os_setCallback(&collectJob, doWorkCallback);
}

void loop()
{
    os_runloop_once();
}

const lmic_pinmap lmic_pins = {
    .nss = 8,
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 4,
    .dio = { /*dio0*/ 3, /*dio1*/ 6, /*dio2*/ LMIC_UNUSED_PIN }
#ifdef MCCI_LMIC
    ,
    .rxtx_rx_active = 0,
    .rssi_cal = 8,
    .spi_freq = 8000000     /* 8 MHz */
#endif    
};


#ifdef MCCI_LMIC
void onLmicEvent(void *pUserData, ev_t ev)
#else
void onEvent(ev_t ev)
#endif
{
    // LMIC event handler
    ostime_t timestamp = os_getTime();

    switch (ev)
    {
#ifdef MCCI_LMIC
    // Only supported in MCCI LMIC library:
    case EV_RXSTART:
        // Do not print anything for this event or it will mess up timing.
        break;

    case EV_TXSTART:
        setTxIndicatorsOn();
        printEvent(timestamp, ev);
        break;

    case EV_JOIN_TXCOMPLETE:
    case EV_TXCANCELED:
        setTxIndicatorsOn(false);
        printEvent(timestamp, ev);
        break;
#endif
    case EV_JOINED:
        setTxIndicatorsOn(false);
        printEvent(timestamp, ev);
        printSessionKeys();

        // Disable link check validation.
        // Link check validation is automatically enabled
        // during join, but because slow data rates change
        // max TX size, it is not used in this example.
        LMIC_setLinkCheckMode(0);

        // The doWork job has probably run already (while
        // the node was still joining) and have rescheduled itself.
        // Cancel the next scheduled doWork job and re-schedule
        // for immediate execution to prevent that any uplink will
        // have to wait until the current doWork interval ends.
        os_clearCallback(&collectJob);
        os_setCallback(&collectJob, doWorkCallback);
        break;

    case EV_TXCOMPLETE:
        // Transmit completed, includes waiting for RX windows.
        setTxIndicatorsOn(false);
        printEvent(timestamp, ev);
        printFrameCounters();

        // Check if downlink was received
        if (LMIC.dataLen != 0 || LMIC.dataBeg != 0)
        {
            uint8_t fPort = 0;
            if (LMIC.txrxFlags & TXRX_PORT)
            {
                fPort = LMIC.frame[LMIC.dataBeg - 1];
            }
            printDownlinkInfo();
            processDownlink(timestamp, fPort, LMIC.frame + LMIC.dataBeg, LMIC.dataLen);
        }
        break;

    // Below events are printed only.
    case EV_SCAN_TIMEOUT:
    case EV_BEACON_FOUND:
    case EV_BEACON_MISSED:
    case EV_BEACON_TRACKED:
    case EV_RFU1: // This event is defined but not used in code
    case EV_JOINING:
    case EV_JOIN_FAILED:
    case EV_REJOIN_FAILED:
    case EV_LOST_TSYNC:
    case EV_RESET:
    case EV_RXCOMPLETE:
    case EV_LINK_DEAD:
    case EV_LINK_ALIVE:
#ifdef MCCI_LMIC
    // Only supported in MCCI LMIC library:
    case EV_SCAN_FOUND: // This event is defined but not used in code
#endif
        printEvent(timestamp, ev);
        break;

    default:
        printEvent(timestamp, "Unknown Event");
        break;
    }
}


