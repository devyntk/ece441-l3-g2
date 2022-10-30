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

ostime_t lastOpen;
bool occupied;
uint32_t timeOpen;

bool sgp_enable, shtc3_enable;

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

        lpp.addUnixTime(CHANNEL_TIMESTAMP, timestamp);
        lpp.addDigitalInput(CHANNEL_PIR, digitalRead(PIR_PIN));

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

// Called on RISING of the door pin
void handleDoorOpen()
{
    ostime_t timestamp = os_getTime();
    if (!occupied)
    {
        lastOpen = timestamp;
    }
    else
    {
        timeOpen += (timestamp - lastOpen);
    }
}

void handlePIRChange()
{
    bool pir = digitalRead(PIR_PIN);
    occupied = pir;
    digitalWrite(LIGHT_PIN, HIGH);
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
    // boardInit(InitType::Hardware) must be called at start of setup() before anything else.
    bool hardwareInitSucceeded = boardInit(InitType::Hardware);

#ifdef USE_DISPLAY
    initDisplay();
#endif

#ifdef USE_SERIAL
    initSerial(MONITOR_SPEED, WAITFOR_SERIAL_S);
#endif

    boardInit(InitType::PostInitSerial);

#if defined(USE_SERIAL) || defined(USE_DISPLAY)
    printHeader(doWorkIntervalSeconds);
#endif

    if (!hardwareInitSucceeded)
    {
#ifdef USE_SERIAL
        serial.println(F("Error: hardware init failed."));
        serial.flush();
#endif
#ifdef USE_DISPLAY
        // Following mesage shown only if failure was unrelated to I2C.
        display.setCursor(COL_0, FRMCNTRS_ROW);
        display.print(F("HW init failed"));
#endif
        abort();
    }

    initLmic();

    //  █ █ █▀▀ █▀▀ █▀▄   █▀▀ █▀█ █▀▄ █▀▀   █▀▄ █▀▀ █▀▀ ▀█▀ █▀█
    //  █ █ ▀▀█ █▀▀ █▀▄   █   █ █ █ █ █▀▀   █▀▄ █▀▀ █ █  █  █ █
    //  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀   ▀▀▀ ▀▀▀ ▀▀  ▀▀▀   ▀▀  ▀▀▀ ▀▀▀ ▀▀▀ ▀ ▀

    pinMode(PIR_PIN, INPUT);
    pinMode(WATER_LEVEL_0_PIN, INPUT);
    pinMode(WATER_LEVEL_1_PIN, INPUT);
    pinMode(WATER_LEVEL_2_PIN, INPUT);
    pinMode(WATER_LEVEL_3_PIN, INPUT);
    pinMode(LIQUID_PIN, INPUT);
    pinMode(DOOR_PIN, INPUT);
    pinMode(POWER_GOOD_PIN, INPUT);
    pinMode(CHARGING_PIN, INPUT);

    pinMode(LIGHT_PIN, OUTPUT);

    if (sgp.begin())
    {
        Serial.print("Found SGP30 serial #");
        Serial.print(sgp.serialnumber[0], HEX);
        Serial.print(sgp.serialnumber[1], HEX);
        Serial.println(sgp.serialnumber[2], HEX);
        sgp_enable = true;
    }
    else
    {
        sgp_enable = false;
        Serial.println("SGP Sensor not found ");
    }

    if (shtc3.begin())
    {
        shtc3_enable = true;
        Serial.print("Found SHTC3 Sensor");
    }
    else
    {
        shtc3_enable = false;
        Serial.println("SHTC3 Sensor not found ");
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
