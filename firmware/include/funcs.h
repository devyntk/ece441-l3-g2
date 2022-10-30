#include "LMIC-node.h"

// print.cpp
void printEvent(ostime_t timestamp,
                const char *const message,
                PrintTarget target = PrintTarget::All,
                bool clearDisplayStatusRow = true,
                bool eventLabel = false);
void printEvent(ostime_t timestamp,
                ev_t ev,
                PrintTarget target = PrintTarget::All,
                bool clearDisplayStatusRow = true);
void printFrameCounters(PrintTarget target = PrintTarget::All);
void printSessionKeys();
void printDownlinkInfo(void);
void printHeader(int doWorkIntervalSeconds);

// lora.cpp
int16_t getSnrTenfold();
int16_t getRssi(int8_t snr);
void initLmic(bit_t adrEnabled = 1,
              dr_t abpDataRate = DefaultABPDataRate,
              s1_t abpTxPower = DefaultABPTxPower);