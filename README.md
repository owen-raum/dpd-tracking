# 📦 @owen-the-frog/dpd-tracking

[![npm version](https://img.shields.io/npm/v/@owen-the-frog/dpd-tracking.svg)](https://www.npmjs.com/package/@owen-the-frog/dpd-tracking)
[![npm downloads](https://img.shields.io/npm/dm/@owen-the-frog/dpd-tracking.svg)](https://www.npmjs.com/package/@owen-the-frog/dpd-tracking)
[![license](https://img.shields.io/npm/l/@owen-the-frog/dpd-tracking.svg)](https://github.com/owen-raum/dpd-tracking/blob/main/LICENSE)
[![Node.js](https://img.shields.io/node/v/@owen-the-frog/dpd-tracking.svg)](https://nodejs.org)

Track DPD parcels from the command line. No fluff, just tracking. 🐸

## Installation

```bash
npm install -g @owen-the-frog/dpd-tracking
```

## Usage

```bash
dpd YOUR_TRACKING_NUMBER
dpd YOUR_TRACKING_NUMBER --zip 5020
dpd YOUR_TRACKING_NUMBER --json
```

## What you get

```
📦 DPD Tracking: 01234567890123
Country: AT

Status: Parcel on the way
Last Update: 30.01.2026, 14:39

Event History:
  • 30.01.2026, 11:28 Order data transmitted
  • 30.01.2026, 14:30 Parcel was handed over to DPD
  • 30.01.2026, 14:39 Parcel on the way
```

## As a library

```javascript
import { track } from '@owen-the-frog/dpd-tracking';

const result = await track('01234567890123', {
  country: 'AT',
  postalCode: '5020'
});

console.log(result);
// {
//   trackingNumber: '01234567890123',
//   country: 'AT',
//   status: 'Parcel on the way',
//   lastUpdate: '30.01.2026, 14:39',
//   events: [...]
// }
```

## Options

| Flag | Description |
|------|-------------|
| `--zip`, `-z` | Postal code for verification |
| `--country`, `-c` | Country code (default: AT) |
| `--json`, `-j` | Output as JSON |
| `--retries` | Max retry attempts (default: 3) |

## Supported Countries

🇦🇹 Austria (AT) • 🇩🇪 Germany (DE) • 🇨🇭 Switzerland (CH) • and more

## Why?

Because checking the DPD website is annoying. 🐸

---

Built with 💚 by [Owen the Frog](https://owen.cy)

## License

MIT
