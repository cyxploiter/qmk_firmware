// SignalRGB protocol support for leku/nut65.
// Ported from the SRGBmods QMK Community Module (GPL-2.0-or-later) because this
// QMK tree predates community-module support. Protocol version 1.0.6.
// Upstream: https://github.com/SRGBmods/QMK_Community_Module

#pragma once

#include <stdbool.h>
#include <stdint.h>

enum signalrgb_commands {
    GET_QMK_VERSION            = 0x21,
    GET_PROTOCOL_VERSION       = 0x22,
    GET_UNIQUE_IDENTIFIER      = 0x23,
    STREAM_RGB_DATA            = 0x24,
    SET_SIGNALRGB_MODE_ENABLE  = 0x25,
    SET_SIGNALRGB_MODE_DISABLE = 0x26,
    GET_TOTAL_LEDS             = 0x27,
    GET_FIRMWARE_TYPE          = 0x28,
};

/* SignalRGB protocol implemented by this firmware. */
#define PROTOCOL_VERSION_BYTE_1 1
#define PROTOCOL_VERSION_BYTE_2 0
#define PROTOCOL_VERSION_BYTE_3 6

/* QMK version this tree is based on. Reported to the host for display only;
   adjust if the tree is rebased onto a different QMK release. */
#define QMK_VERSION_BYTE_1 0
#define QMK_VERSION_BYTE_2 26
#define QMK_VERSION_BYTE_3 0

/* Model identifier. SRGBmods hands these out for boards in their registry;
   0/0/0 means "unregistered", which the plugin accepts. */
#define DEVICE_UNIQUE_IDENTIFIER_BYTE_1 0
#define DEVICE_UNIQUE_IDENTIFIER_BYTE_2 0
#define DEVICE_UNIQUE_IDENTIFIER_BYTE_3 0

/* 2 = VIA fork. This board builds with VIA_ENABLE, and the plugin uses this
   byte to decide how it drains reply packets. */
#define FIRMWARE_TYPE_BYTE 2

#define DEVICE_ERROR_LED_BOUNDS 253
#define DEVICE_ERROR_LED_COUNT  254

/* Returns true when the packet was a SignalRGB command and has been handled
   (including sending any reply). */
bool srgb_raw_hid_rx(uint8_t *data, uint8_t length);

/* True while the board is in SignalRGB direct-control mode. The keyboard's own
   indicator/lightbar rendering is skipped in that case so it does not overwrite
   the streamed colors. */
bool signalrgb_is_active(void);
