#include "LMIC-node.h"
#include "funcs.h"

extern osjob_t collectJob;
extern Serial_& serial;
extern EasyLed led;



// Set LoRaWAN keys defined in lorawan-keys.h.
#ifdef OTAA_ACTIVATION
static const u1_t PROGMEM DEVEUI[8] = {OTAA_DEVEUI};
static const u1_t PROGMEM APPEUI[8] = {OTAA_APPEUI};
static const u1_t PROGMEM APPKEY[16] = {OTAA_APPKEY};
// Below callbacks are used by LMIC for reading above values.
void os_getDevEui(u1_t *buf) { memcpy_P(buf, DEVEUI, 8); }
void os_getArtEui(u1_t *buf) { memcpy_P(buf, APPEUI, 8); }
void os_getDevKey(u1_t *buf) { memcpy_P(buf, APPKEY, 16); }
#else
                                                           // ABP activation
static const u4_t DEVADDR = ABP_DEVADDR;
static const PROGMEM u1_t NWKSKEY[16] = {ABP_NWKSKEY};
static const u1_t PROGMEM APPSKEY[16] = {ABP_APPSKEY};
// Below callbacks are not used be they must be defined.
void os_getDevEui(u1_t *buf) {}
void os_getArtEui(u1_t *buf) {}
void os_getDevKey(u1_t *buf) {}
#endif

int16_t getSnrTenfold()
{
    // Returns ten times the SNR (dB) value of the last received packet.
    // Ten times to prevent the use of float but keep 1 decimal digit accuracy.
    // Calculation per SX1276 datasheet rev.7 §6.4, SX1276 datasheet rev.4 §6.4.
    // LMIC.snr contains value of PacketSnr, which is 4 times the actual SNR value.
    return (LMIC.snr * 10) / 4;
}

int16_t getRssi(int8_t snr)
{
    // Returns correct RSSI (dBm) value of the last received packet.
    // Calculation per SX1276 datasheet rev.7 §5.5.5, SX1272 datasheet rev.4 §5.5.5.

#define RSSI_OFFSET 64
#define SX1276_FREQ_LF_MAX 525000000 // per datasheet 6.3
#define SX1272_RSSI_ADJUST -139
#define SX1276_RSSI_ADJUST_LF -164
#define SX1276_RSSI_ADJUST_HF -157

    int16_t rssi;

#ifdef MCCI_LMIC

    rssi = LMIC.rssi - RSSI_OFFSET;

#else
    int16_t rssiAdjust;
#ifdef CFG_sx1276_radio
    if (LMIC.freq > SX1276_FREQ_LF_MAX)
    {
        rssiAdjust = SX1276_RSSI_ADJUST_HF;
    }
    else
    {
        rssiAdjust = SX1276_RSSI_ADJUST_LF;
    }
#else
    // CFG_sx1272_radio
    rssiAdjust = SX1272_RSSI_ADJUST;
#endif

    // Revert modification (applied in lmic/radio.c) to get PacketRssi.
    int16_t packetRssi = LMIC.rssi + 125 - RSSI_OFFSET;
    if (snr < 0)
    {
        rssi = rssiAdjust + packetRssi + snr;
    }
    else
    {
        rssi = rssiAdjust + (16 * packetRssi) / 15;
    }
#endif

    return rssi;
}


#ifdef ABP_ACTIVATION
void setAbpParameters(dr_t dataRate = DefaultABPDataRate, s1_t txPower = DefaultABPTxPower)
{
// Set static session parameters. Instead of dynamically establishing a session
// by joining the network, precomputed session parameters are be provided.
#ifdef PROGMEM
    // On AVR, these values are stored in flash and only copied to RAM
    // once. Copy them to a temporary buffer here, LMIC_setSession will
    // copy them into a buffer of its own again.
    uint8_t appskey[sizeof(APPSKEY)];
    uint8_t nwkskey[sizeof(NWKSKEY)];
    memcpy_P(appskey, APPSKEY, sizeof(APPSKEY));
    memcpy_P(nwkskey, NWKSKEY, sizeof(NWKSKEY));
    LMIC_setSession(0x1, DEVADDR, nwkskey, appskey);
#else
    // If not running an AVR with PROGMEM, just use the arrays directly
    LMIC_setSession(0x1, DEVADDR, NWKSKEY, APPSKEY);
#endif

#if defined(CFG_eu868)
    // Set up the channels used by the Things Network, which corresponds
    // to the defaults of most gateways. Without this, only three base
    // channels from the LoRaWAN specification are used, which certainly
    // works, so it is good for debugging, but can overload those
    // frequencies, so be sure to configure the full frequency range of
    // your network here (unless your network autoconfigures them).
    // Setting up channels should happen after LMIC_setSession, as that
    // configures the minimal channel set. The LMIC doesn't let you change
    // the three basic settings, but we show them here.
    LMIC_setupChannel(0, 868100000, DR_RANGE_MAP(DR_SF12, DR_SF7), BAND_CENTI);  // g-band
    LMIC_setupChannel(1, 868300000, DR_RANGE_MAP(DR_SF12, DR_SF7B), BAND_CENTI); // g-band
    LMIC_setupChannel(2, 868500000, DR_RANGE_MAP(DR_SF12, DR_SF7), BAND_CENTI);  // g-band
    LMIC_setupChannel(3, 867100000, DR_RANGE_MAP(DR_SF12, DR_SF7), BAND_CENTI);  // g-band
    LMIC_setupChannel(4, 867300000, DR_RANGE_MAP(DR_SF12, DR_SF7), BAND_CENTI);  // g-band
    LMIC_setupChannel(5, 867500000, DR_RANGE_MAP(DR_SF12, DR_SF7), BAND_CENTI);  // g-band
    LMIC_setupChannel(6, 867700000, DR_RANGE_MAP(DR_SF12, DR_SF7), BAND_CENTI);  // g-band
    LMIC_setupChannel(7, 867900000, DR_RANGE_MAP(DR_SF12, DR_SF7), BAND_CENTI);  // g-band
    LMIC_setupChannel(8, 868800000, DR_RANGE_MAP(DR_FSK, DR_FSK), BAND_MILLI);   // g2-band
    // TTN defines an additional channel at 869.525Mhz using SF9 for class B
    // devices' ping slots. LMIC does not have an easy way to define set this
    // frequency and support for class B is spotty and untested, so this
    // frequency is not configured here.
#elif defined(CFG_us915) || defined(CFG_au915)
    // NA-US and AU channels 0-71 are configured automatically
    // but only one group of 8 should (a subband) should be active
    // TTN recommends the second sub band, 1 in a zero based count.
    // https://github.com/TheThingsNetwork/gateway-conf/blob/master/US-global_conf.json
    LMIC_selectSubBand(1);
#elif defined(CFG_as923)
    // Set up the channels used in your country. Only two are defined by default,
    // and they cannot be changed.  Use BAND_CENTI to indicate 1% duty cycle.
    // LMIC_setupChannel(0, 923200000, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_CENTI);
    // LMIC_setupChannel(1, 923400000, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_CENTI);

    // ... extra definitions for channels 2..n here
#elif defined(CFG_kr920)
    // Set up the channels used in your country. Three are defined by default,
    // and they cannot be changed. Duty cycle doesn't matter, but is conventionally
    // BAND_MILLI.
    // LMIC_setupChannel(0, 922100000, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_MILLI);
    // LMIC_setupChannel(1, 922300000, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_MILLI);
    // LMIC_setupChannel(2, 922500000, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_MILLI);

    // ... extra definitions for channels 3..n here.
#elif defined(CFG_in866)
    // Set up the channels used in your country. Three are defined by default,
    // and they cannot be changed. Duty cycle doesn't matter, but is conventionally
    // BAND_MILLI.
    // LMIC_setupChannel(0, 865062500, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_MILLI);
    // LMIC_setupChannel(1, 865402500, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_MILLI);
    // LMIC_setupChannel(2, 865985000, DR_RANGE_MAP(DR_SF12, DR_SF7),  BAND_MILLI);

    // ... extra definitions for channels 3..n here.
#endif

    // Disable link check validation
    LMIC_setLinkCheckMode(0);

    // TTN uses SF9 for its RX2 window.
    LMIC.dn2Dr = DR_SF9;

    // Set data rate and transmit power (note: txpow is possibly ignored by the library)
    LMIC_setDrTxpow(dataRate, txPower);
}
#endif // ABP_ACTIVATION

void initLmic(bit_t adrEnabled,
              dr_t abpDataRate,
              s1_t abpTxPower)
{
    // ostime_t timestamp = os_getTime();

    // Initialize LMIC runtime environment
    os_init();
    // Reset MAC state
    LMIC_reset();

#ifdef ABP_ACTIVATION
    setAbpParameters(abpDataRate, abpTxPower);
#endif

    // Enable or disable ADR (data rate adaptation).
    // Should be turned off if the device is not stationary (mobile).
    // 1 is on, 0 is off.
    LMIC_setAdrMode(adrEnabled);

    if (activationMode == ActivationMode::OTAA)
    {
#if defined(CFG_us915) || defined(CFG_au915)
        // NA-US and AU channels 0-71 are configured automatically
        // but only one group of 8 should (a subband) should be active
        // TTN recommends the second sub band, 1 in a zero based count.
        // https://github.com/TheThingsNetwork/gateway-conf/blob/master/US-global_conf.json
        LMIC_selectSubBand(1);
#endif
    }

// Relax LMIC timing if defined
#if defined(LMIC_CLOCK_ERROR_PPM)
    uint32_t clockError = 0;
#if LMIC_CLOCK_ERROR_PPM > 0
#if defined(MCCI_LMIC) && LMIC_CLOCK_ERROR_PPM > 4000
// Allow clock error percentage to be > 0.4%
#define LMIC_ENABLE_arbitrary_clock_error 1
#endif
    clockError = (LMIC_CLOCK_ERROR_PPM / 100) * (MAX_CLOCK_ERROR / 100) / 100;
    LMIC_setClockError(clockError);
#endif

#ifdef USE_SERIAL
    serial.print(F("Clock Error:   "));
    serial.print(LMIC_CLOCK_ERROR_PPM);
    serial.print(" ppm (");
    serial.print(clockError);
    serial.println(")");
#endif
#endif

#ifdef MCCI_LMIC
    // Register a custom eventhandler and don't use default onEvent() to enable
    // additional features (e.g. make EV_RXSTART available). User data pointer is omitted.
    LMIC_registerEventCb(&onLmicEvent, nullptr);
#endif
}



#if defined(USE_SERIAL) || defined(USE_DISPLAY)

        

    void printChars(Print& printer, char ch, uint8_t count, bool linefeed)
    {
        for (uint8_t i = 0; i < count; ++i)
        {
            printer.print(ch);
        }
        if (linefeed)
        {
            printer.println();
        }
    }


    void printSpaces(Print& printer, uint8_t count, bool linefeed)
    {
        printChars(printer, ' ', count, linefeed);
    }


    void printHex(Print& printer, uint8_t* bytes, size_t length, bool linefeed, char separator)
    {
        for (size_t i = 0; i < length; ++i)
        {
            if (i > 0 && separator != 0)
            {
                printer.print(separator);
            }
            if (bytes[i] <= 0x0F)
            {
                printer.print('0');
            }
            printer.print(bytes[i], HEX);        
        }
        if (linefeed)
        {
            printer.println();
        }
    }


    void setTxIndicatorsOn(bool on)
    {
        if (on)
        {
            #ifdef USE_LED
                led.on();
            #endif
            #ifdef USE_DISPLAY
                displayTxSymbol(true);
            #endif           
        }
        else
        {
            #ifdef USE_LED
                led.off();
            #endif
            #ifdef USE_DISPLAY
                displayTxSymbol(false);
            #endif           
        }        
    }
    
#endif  // USE_SERIAL || USE_DISPLAY


#ifdef USE_DISPLAY 
    uint8_t transmitSymbol[8] = {0x18, 0x18, 0x00, 0x24, 0x99, 0x42, 0x3c, 0x00}; 
    #define ROW_0             0
    #define ROW_1             1
    #define ROW_2             2
    #define ROW_3             3
    #define ROW_4             4
    #define ROW_5             5
    #define ROW_6             6
    #define ROW_7             7    
    #define HEADER_ROW        ROW_0
    #define DEVICEID_ROW      ROW_1
    #define INTERVAL_ROW      ROW_2
    #define TIME_ROW          ROW_4
    #define EVENT_ROW         ROW_5
    #define STATUS_ROW        ROW_6
    #define FRMCNTRS_ROW      ROW_7
    #define COL_0             0
    #define ABPMODE_COL       10
    #define CLMICSYMBOL_COL   14
    #define TXSYMBOL_COL      15

    void initDisplay()
    {
        display.begin();
        display.setFont(u8x8_font_victoriamedium8_r); 
    }

    void displayTxSymbol(bool visible = true)
    {
        if (visible)
        {
            display.drawTile(TXSYMBOL_COL, ROW_0, 1, transmitSymbol);
        }
        else
        {
            display.drawGlyph(TXSYMBOL_COL, ROW_0, char(0x20));
        }
    }    
#endif // USE_DISPLAY


#ifdef USE_SERIAL
    bool initSerial(unsigned long speed, int16_t timeoutSeconds)
    {
        // Initializes the serial port.
        // Optionally waits for serial port to be ready.
        // Will display status and progress on display (if enabled)
        // which can be useful for tracing (e.g. ATmega328u4) serial port issues.
        // A negative timeoutSeconds value will wait indefinitely.
        // A value of 0 (default) will not wait.
        // Returns: true when serial port ready,
        //          false when not ready.

        serial.begin(speed);

        #if WAITFOR_SERIAL_S != 0
            if (timeoutSeconds != 0)
            {   
                bool indefinite = (timeoutSeconds < 0);
                uint16_t secondsLeft = timeoutSeconds; 
                #ifdef USE_DISPLAY
                    display.setCursor(0, ROW_1);
                    display.print(F("Waiting for"));
                    display.setCursor(0,  ROW_2);                
                    display.print(F("serial port"));
                #endif

                while (!serial && (indefinite || secondsLeft > 0))
                {
                    if (!indefinite)
                    {
                        #ifdef USE_DISPLAY
                            display.clearLine(ROW_4);
                            display.setCursor(0, ROW_4);
                            display.print(F("timeout in "));
                            display.print(secondsLeft);
                            display.print('s');
                        #endif
                        --secondsLeft;
                    }
                    delay(1000);
                }  
                #ifdef USE_DISPLAY
                    display.setCursor(0, ROW_4);
                    if (serial)
                    {
                        display.print(F("Connected"));
                    }
                    else
                    {
                        display.print(F("NOT connected"));
                    }
                #endif
            }
        #endif

        return serial;
    }
#endif
