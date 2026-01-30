# 📦 dpd-tracking

Track DPD parcels. No fluff, just tracking.

```bash
npm install -g dpd-tracking
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
import { track } from 'dpd-tracking';

const result = await track('01234567890123', {
  country: 'AT',
  postalCode: '5020'
});
```

## Options

| Flag | Description |
|------|-------------|
| `--zip`, `-z` | Postal code for verification |
| `--country`, `-c` | Country code (default: AT) |
| `--json`, `-j` | Output as JSON |
| `--retries` | Max retry attempts (default: 3) |

## Why?

Because checking the DPD website is annoying. 🐸

## License

MIT
