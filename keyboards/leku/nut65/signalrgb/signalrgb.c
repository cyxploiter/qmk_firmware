// SignalRGB protocol support for leku/nut65.
// Ported from the SRGBmods QMK Community Module (GPL-2.0-or-later).
// SPDX-License-Identifier: GPL-2.0-or-later

#include QMK_KEYBOARD_H

#include "quantum.h"
#include "color.h"
#include "raw_hid.h"
#include "signalrgb.h"

#ifndef RAW_ENABLE
#    error "SignalRGB support requires RAW_ENABLE"
#endif

#ifndef RGB_MATRIX_ENABLE
#    error "SignalRGB support requires RGB_MATRIX_ENABLE"
#endif

/* keyboards/linker/wireless/md_raw.h is force-included into every translation
   unit and rewrites raw_hid_send() into a __LINE__-keyed macro that only
   resolves at two specific call sites (raw_hid.h:29 and via.c:461). Everywhere
   else it would expand to an undefined symbol, so the real function -- which
   also routes replies over the wireless link when not on USB -- has to be
   called by its post-macro name. */
extern void replaced_hid_send(uint8_t *data, uint8_t length);

static uint8_t packet[32];

static void get_qmk_version(void) {
    packet[0] = GET_QMK_VERSION;
    packet[1] = QMK_VERSION_BYTE_1;
    packet[2] = QMK_VERSION_BYTE_2;
    packet[3] = QMK_VERSION_BYTE_3;
    replaced_hid_send(packet, 32);
}

static void get_signalrgb_protocol_version(void) {
    packet[0] = GET_PROTOCOL_VERSION;
    packet[1] = PROTOCOL_VERSION_BYTE_1;
    packet[2] = PROTOCOL_VERSION_BYTE_2;
    packet[3] = PROTOCOL_VERSION_BYTE_3;
    replaced_hid_send(packet, 32);
}

static void get_unique_identifier(void) {
    packet[0] = GET_UNIQUE_IDENTIFIER;
    packet[1] = DEVICE_UNIQUE_IDENTIFIER_BYTE_1;
    packet[2] = DEVICE_UNIQUE_IDENTIFIER_BYTE_2;
    packet[3] = DEVICE_UNIQUE_IDENTIFIER_BYTE_3;
    replaced_hid_send(packet, 32);
}

static void get_total_leds(void) {
    packet[0] = GET_TOTAL_LEDS;
    packet[1] = RGB_MATRIX_LED_COUNT;
    replaced_hid_send(packet, 32);
}

static void get_firmware_type(void) {
    packet[0] = GET_FIRMWARE_TYPE;
    packet[1] = FIRMWARE_TYPE_BYTE;
    replaced_hid_send(packet, 32);
}

/* data = [ cmd, start_index, led_count, r0, g0, b0, r1, g1, b1, ... ]
   At most 9 LEDs fit in the 32-byte report. */
static void led_streaming(uint8_t *data) {
    uint8_t index        = data[1];
    uint8_t numberofleds = data[2];

    if (index + numberofleds > RGB_MATRIX_LED_COUNT) {
        packet[1] = DEVICE_ERROR_LED_BOUNDS;
        replaced_hid_send(packet, 32);
        return;
    }

    if (numberofleds >= 10) {
        packet[1] = DEVICE_ERROR_LED_COUNT;
        replaced_hid_send(packet, 32);
        return;
    }

    for (uint8_t i = 0; i < numberofleds; i++) {
        uint8_t offset = (i * 3) + 3;
        uint8_t r      = data[offset];
        uint8_t g      = data[offset + 1];
        uint8_t b      = data[offset + 2];

#if defined(HS_RGB_INDEX_CAPS)
        /* Keep Caps Lock readable even while the host owns the lighting. */
        if ((index + i) == HS_RGB_INDEX_CAPS && host_keyboard_led_state().caps_lock) {
            rgb_matrix_set_color(index + i, 255, 255, 255);
            continue;
        }
#endif
        rgb_matrix_set_color(index + i, r, g, b);
    }
}

static void signalrgb_mode_enable(void) {
    rgb_matrix_mode_noeeprom(RGB_MATRIX_CUSTOM_SIGNALRGB);
}

static void signalrgb_mode_disable(void) {
    rgb_matrix_reload_from_eeprom();
}

bool signalrgb_is_active(void) {
    return rgb_matrix_get_mode() == RGB_MATRIX_CUSTOM_SIGNALRGB;
}

bool srgb_raw_hid_rx(uint8_t *data, uint8_t length) {
    switch (data[0]) {
        case GET_QMK_VERSION:
            get_qmk_version();
            break;
        case GET_PROTOCOL_VERSION:
            get_signalrgb_protocol_version();
            break;
        case GET_UNIQUE_IDENTIFIER:
            get_unique_identifier();
            break;
        case STREAM_RGB_DATA:
            led_streaming(data);
            break;
        case SET_SIGNALRGB_MODE_ENABLE:
            signalrgb_mode_enable();
            break;
        case SET_SIGNALRGB_MODE_DISABLE:
            signalrgb_mode_disable();
            break;
        case GET_TOTAL_LEDS:
            get_total_leds();
            break;
        case GET_FIRMWARE_TYPE:
            get_firmware_type();
            break;
        default:
            return false;
    }
    return true;
}
