# SignalRGB support for NUT65

Direct per-LED control of the NUT65 from [SignalRGB](https://signalrgb.com), covering
all 151 LEDs (71 per-key + 80 lightbar).

## Limitations

- **USB only.** The protocol runs over raw HID, so lighting is not driven in
  Bluetooth or 2.4G mode. The keyboard falls back to its own effects there.
- **One tool at a time.** VIA and SignalRGB both talk on the same raw HID
  interface. Close one before using the other.

## Firmware

Built in by default; no extra flags. Flash over USB:

    qmk flash -kb leku/nut65 -km default

`signalrgb.mk` adds `signalrgb.c` and defines `SIGNALRGB_SUPPORT_ENABLE`, which
gates three things:

- the `SIGNALRGB` effect in `../rgb_matrix_user.inc` — a deliberate no-op that
  stops `rgb_matrix` painting over the streamed framebuffer,
- the command hook in `../wls/wls.c` (`via_command_kb`), which gets first crack
  at raw HID before VIA's dispatch,
- an early return in `rgb_matrix_indicators_advanced_kb` in `../nut65.c`, so the
  board's own indicators and lightbar renderer don't overwrite host colors.

Caps Lock is still shown while SignalRGB is driving, forced white from inside
`led_streaming()`.

## Plugin

Copy `LEKU_NUT65_QMK.js` to SignalRGB's plugin folder:

    %USERPROFILE%\Documents\WhirlwindFX\Plugins\

Then restart SignalRGB. The board should appear as "LEKU NUT65 QMK Keyboard".

## Notes

- Protocol version 1.0.6, ported from the
  [SRGBmods QMK Community Module](https://github.com/SRGBmods/QMK_Community_Module).
  That module needs QMK 0.28+ community-module support, which this tree predates,
  so the sources are vendored here instead.
- `QMK_VERSION_BYTE_*` in `signalrgb.h` is display-only; update it if this tree
  is rebased onto a different QMK release.
- `DEVICE_UNIQUE_IDENTIFIER_BYTE_*` is 0/0/0 ("unregistered"). SRGBmods assigns
  these for boards in their registry.
- If SignalRGB does not detect the board, check `Validate()` in the plugin — it
  matches raw HID on USB interface 1, which is where this build places it.
