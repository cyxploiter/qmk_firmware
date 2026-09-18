export function Name() { return "LEKU NUT65 QMK Keyboard"; }
export function Version() { return "1.0.0"; }
export function VendorId() { return 0x342D; }
export function ProductId() { return 0xE51A; }
export function Publisher() { return "cyxploiter"; }
export function Documentation(){ return "qmk/srgbmods-qmk-firmware"; }
export function DeviceType() { return "keyboard"; }
export function Size() { return [15, 6]; }
export function DefaultPosition(){ return [10, 100]; }
export function DefaultScale(){ return 8.0; }
/* global
shutdownMode:readonly
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
*/
export function ControllableParameters() {
	return [
		{"property":"shutdownMode", "group":"lighting", "label":"Shutdown Mode", "type":"combobox", "values":["SignalRGB", "Hardware"], "default":"SignalRGB"},
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#000000"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
	];
}

// Plugin Version: Built for Protocol V1.0.6
//
// 151 LEDs: 0-70 are the per-key matrix, 71-150 are the side lightbar.
// Indices 10/11/13/14 sit between Left Alt and Right Alt in the LED chain,
// i.e. under the spacebar, so they are mapped there rather than discarded.
// The lightbar is one strip; keyboard.json anchors every ~5th LED to a column
// and the LEDs in between are interpolated across those anchors.

const vKeys = [
	  0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14,  15,
	 16,  17,  18,  19,  20,  21,  22,  23,  24,  25,  26,  27,  28,  29,  30,  31,
	 32,  33,  34,  35,  36,  37,  38,  39,  40,  41,  42,  43,  44,  45,  46,  47,
	 48,  49,  50,  51,  52,  53,  54,  55,  56,  57,  58,  59,  60,  61,  62,  63,
	 64,  65,  66,  67,  68,  69,  70,  71,  72,  73,  74,  75,  76,  77,  78,  79,
	 80,  81,  82,  83,  84,  85,  86,  87,  88,  89,  90,  91,  92,  93,  94,  95,
	 96,  97,  98,  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
	112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127,
	128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,
	144, 145, 146, 147, 148, 149, 150
];

const vKeyNames = [
	"T", "R", "E", "W", "Q", "Tab", "CapsLock", "Left Ctrl",
	"Left Win", "Left Alt", "Space 1", "Space 2", "Space", "Space 3", "Space 4", "Right Alt",
	"Fn", "Left Arrow", "Down Arrow", "Right Arrow", "Page Down", "Up Arrow", "Right Shift", "/",
	".", ",", "M", "N", "B", "V", "C", "X",
	"Z", "Left Shift", "A", "S", "D", "F", "G", "H",
	"J", "K", "L", ";", "'", "Enter", "Page Up", "Delete",
	"\\", "]", "[", "P", "O", "I", "U", "Y",
	"Esc", "1", "2", "3", "4", "5", "6", "7",
	"8", "9", "0", "-", "=", "Backspace", "Insert", "Lightbar 1",
	"Lightbar 2", "Lightbar 3", "Lightbar 4", "Lightbar 5", "Lightbar 6", "Lightbar 7", "Lightbar 8", "Lightbar 9",
	"Lightbar 10", "Lightbar 11", "Lightbar 12", "Lightbar 13", "Lightbar 14", "Lightbar 15", "Lightbar 16", "Lightbar 17",
	"Lightbar 18", "Lightbar 19", "Lightbar 20", "Lightbar 21", "Lightbar 22", "Lightbar 23", "Lightbar 24", "Lightbar 25",
	"Lightbar 26", "Lightbar 27", "Lightbar 28", "Lightbar 29", "Lightbar 30", "Lightbar 31", "Lightbar 32", "Lightbar 33",
	"Lightbar 34", "Lightbar 35", "Lightbar 36", "Lightbar 37", "Lightbar 38", "Lightbar 39", "Lightbar 40", "Lightbar 41",
	"Lightbar 42", "Lightbar 43", "Lightbar 44", "Lightbar 45", "Lightbar 46", "Lightbar 47", "Lightbar 48", "Lightbar 49",
	"Lightbar 50", "Lightbar 51", "Lightbar 52", "Lightbar 53", "Lightbar 54", "Lightbar 55", "Lightbar 56", "Lightbar 57",
	"Lightbar 58", "Lightbar 59", "Lightbar 60", "Lightbar 61", "Lightbar 62", "Lightbar 63", "Lightbar 64", "Lightbar 65",
	"Lightbar 66", "Lightbar 67", "Lightbar 68", "Lightbar 69", "Lightbar 70", "Lightbar 71", "Lightbar 72", "Lightbar 73",
	"Lightbar 74", "Lightbar 75", "Lightbar 76", "Lightbar 77", "Lightbar 78", "Lightbar 79", "Lightbar 80"
];

const vKeyPositions = [
	[5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [0, 1], [0, 2], [0, 4], [1, 4], [2, 4],
	[3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4],
	[14, 3], [13, 3], [12, 3], [11, 3], [10, 3], [9, 3], [8, 3], [7, 3], [6, 3], [5, 3],
	[4, 3], [3, 3], [2, 3], [0, 3], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
	[7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [13, 2], [14, 2], [14, 1], [13, 1], [12, 1],
	[11, 1], [10, 1], [9, 1], [8, 1], [7, 1], [6, 1], [0, 0], [1, 0], [2, 0], [3, 0],
	[4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0],
	[14, 0], [0, 5], [0, 5], [0, 5], [0, 5], [1, 5], [1, 5], [1, 5], [1, 5], [1, 5],
	[2, 5], [2, 5], [2, 5], [2, 5], [2, 5], [2, 5], [2, 5], [3, 5], [3, 5], [3, 5],
	[3, 5], [3, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [4, 5], [5, 5],
	[5, 5], [5, 5], [5, 5], [5, 5], [6, 5], [6, 5], [6, 5], [6, 5], [6, 5], [7, 5],
	[7, 5], [7, 5], [7, 5], [7, 5], [8, 5], [8, 5], [8, 5], [8, 5], [8, 5], [9, 5],
	[9, 5], [9, 5], [9, 5], [9, 5], [10, 5], [10, 5], [10, 5], [10, 5], [10, 5], [11, 5],
	[11, 5], [11, 5], [11, 5], [11, 5], [12, 5], [12, 5], [12, 5], [12, 5], [12, 5], [13, 5],
	[13, 5], [13, 5], [13, 5], [13, 5], [14, 5], [14, 5], [14, 5], [14, 5], [14, 5], [14, 5],
	[14, 5]
];

let LEDCount = 0;
let IsViaKeyboard = false;
const MainlineQMKFirmware = 1;
const VIAFirmware = 2;
const PluginProtocolVersion = "1.0.6";

export function LedNames() {
	return vKeyNames;
}

export function LedPositions() {
	return vKeyPositions;
}

export function vKeysArrayCount() {
	device.log('vKeys ' + vKeys.length);
	device.log('vKeyNames ' + vKeyNames.length);
	device.log('vKeyPositions ' + vKeyPositions.length);
}

export function Initialize() {
	requestFirmwareType();
	requestQMKVersion();
	requestSignalRGBProtocolVersion();
	requestUniqueIdentifier();
	requestTotalLeds();
	effectEnable();
}

export function Render() {
	sendColors();
}

export function Shutdown(SystemSuspending) {
	if(SystemSuspending) {
		sendColors("#000000"); // Go Dark on System Sleep/Shutdown
	} else {
		if (shutdownMode === "SignalRGB") {
			sendColors(shutdownColor);
		} else {
			effectDisable();
		}
	}

	vKeysArrayCount();
}

function commandHandler() {
	const readCounts = [];

	do {
		const returnpacket = device.read([0x00], 32, 10);
		processCommands(returnpacket);

		readCounts.push(device.getLastReadSize());

		// Extra read to throw away the empty packet VIA sends back.
		if(IsViaKeyboard) {
			device.read([0x00], 32, 10);
		}
	}
	while(device.getLastReadSize() > 0);
}

function processCommands(data) {
	switch(data[1]) {
	case 0x21:
		returnQMKVersion(data);
		break;
	case 0x22:
		returnSignalRGBProtocolVersion(data);
		break;
	case 0x23:
		returnUniqueIdentifier(data);
		break;
	case 0x24:
		sendColors();
		break;
	case 0x27:
		returnTotalLeds(data);
		break;
	case 0x28:
		returnFirmwareType(data);
		break;
	}
}

function requestQMKVersion() {
	device.write([0x00, 0x21], 32);
	device.pause(30);
	commandHandler();
}

function returnQMKVersion(data) {
	device.log("QMK Version: " + data[2] + "." + data[3] + "." + data[4]);
	device.log("QMK SRGB Plugin Version: " + Version());
	device.pause(30);
}

function requestSignalRGBProtocolVersion() {
	device.write([0x00, 0x22], 32);
	device.pause(30);
	commandHandler();
}

function returnSignalRGBProtocolVersion(data) {
	const SignalRGBProtocolVersion = data[2] + "." + data[3] + "." + data[4];
	device.log(`SignalRGB Protocol Version: ${SignalRGBProtocolVersion}`);

	if(PluginProtocolVersion !== SignalRGBProtocolVersion) {
		device.notify("Unsupported Protocol Version", `This plugin is intended for SignalRGB Protocol version ${PluginProtocolVersion}. This device is version: ${SignalRGBProtocolVersion}`, 2, "Documentation");
	}

	device.pause(30);
}

function requestUniqueIdentifier() {
	if(device.write([0x00, 0x23], 32) === -1) {
		device.notify("Unsupported Firmware", "This device is not running SignalRGB-compatible firmware. Click the Documentation button to learn more.", 3, "Documentation");
	}

	device.pause(30);
	commandHandler();
}

function returnUniqueIdentifier(data) {
	const UniqueIdentifierByte1 = data[2];
	const UniqueIdentifierByte2 = data[3];
	const UniqueIdentifierByte3 = data[4];

	if(!(UniqueIdentifierByte1 === 0 && UniqueIdentifierByte2 === 0 && UniqueIdentifierByte3 === 0)) {
		device.log("Unique Device Identifier: " + UniqueIdentifierByte1 + UniqueIdentifierByte2 + UniqueIdentifierByte3);
	}

	device.pause(30);
}

function requestTotalLeds() {
	device.write([0x00, 0x27], 32);
	device.pause(30);
	commandHandler();
}

function returnTotalLeds(data) {
	LEDCount = data[2];
	device.log("Device Total LED Count: " + LEDCount);
	device.pause(30);
}

function requestFirmwareType() {
	device.write([0x00, 0x28], 32);
	device.pause(30);
	commandHandler();
}

function returnFirmwareType(data) {
	const FirmwareTypeByte = data[2];

	if(!(FirmwareTypeByte === MainlineQMKFirmware || FirmwareTypeByte === VIAFirmware)) {
		device.notify("Unsupported Firmware", "Click the Documentation button to learn more.", 3, "Documentation");
	}

	if(FirmwareTypeByte === MainlineQMKFirmware) {
		IsViaKeyboard = false;
		device.log("Firmware Type: Mainline");
	}

	if(FirmwareTypeByte === VIAFirmware) {
		IsViaKeyboard = true;
		device.log("Firmware Type: VIA");
	}

	device.pause(30);
}

function effectEnable() {
	device.write([0x00, 0x25], 32);
	device.pause(30);
}

function effectDisable() {
	device.write([0x00, 0x26], 32);
	device.pause(30);
}

function createSolidColorArray(color) {
	const rgbdata = new Array(vKeys.length * 3).fill(0);

	for(let iIdx = 0; iIdx < vKeys.length; iIdx++) {
		const iLedIdx = vKeys[iIdx] * 3;
		rgbdata[iLedIdx] = color[0];
		rgbdata[iLedIdx+1] = color[1];
		rgbdata[iLedIdx+2] = color[2];
	}

	return rgbdata;
}

function grabColors(overrideColor) {
	if(overrideColor) {
		return createSolidColorArray(hexToRgb(overrideColor));
	} else if (LightingMode === "Forced") {
		return createSolidColorArray(hexToRgb(forcedColor));
	}

	const rgbdata = new Array(vKeys.length * 3).fill(0);

	for(let iIdx = 0; iIdx < vKeys.length; iIdx++) {
		const iPxX = vKeyPositions[iIdx][0];
		const iPxY = vKeyPositions[iIdx][1];
		const color = device.color(iPxX, iPxY);

		const iLedIdx = vKeys[iIdx] * 3;
		rgbdata[iLedIdx] = color[0];
		rgbdata[iLedIdx+1] = color[1];
		rgbdata[iLedIdx+2] = color[2];
	}

	return rgbdata;
}

function sendColors(overrideColor) {
	const rgbdata = grabColors(overrideColor);

	const LedsPerPacket = 9;
	let BytesSent = 0;
	let BytesLeft = rgbdata.length;

	while(BytesLeft > 0) {
		const BytesToSend = Math.min(LedsPerPacket * 3, BytesLeft);
		StreamLightingData(Math.floor(BytesSent / 3), rgbdata.splice(0, BytesToSend));

		BytesLeft -= BytesToSend;
		BytesSent += BytesToSend;
	}
}

function StreamLightingData(StartLedIdx, RGBData) {
	const packet = [0x00, 0x24, StartLedIdx, Math.floor(RGBData.length / 3)].concat(RGBData);
	device.write(packet, 33);
}

function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	const colors = [];
	colors[0] = parseInt(result[1], 16);
	colors[1] = parseInt(result[2], 16);
	colors[2] = parseInt(result[3], 16);

	return colors;
}

export function Validate(endpoint) {
	return endpoint.interface === 1;
}

export function Image() {
	return "";
}
