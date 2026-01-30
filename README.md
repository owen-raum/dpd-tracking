# DPD Tracking CLI

> 📦 Track DPD parcels from your terminal

A simple, reliable CLI tool for tracking DPD shipments with multi-country support and smart error handling.

## Features

✅ **Multi-Country Support** - Austria (AT), Germany (DE)  
✅ **Postal Code Verification** - Ensures you're tracking the right package  
✅ **Retry Logic** - Exponential backoff for transient failures  
✅ **JSON Output** - Perfect for scripting and automation  
✅ **Exit Codes** - Scriptable error handling  
✅ **Human-Readable** - Beautiful colored terminal output  

## Installation

```bash
npm install -g dpd-tracking
```

Or use directly without installing:

```bash
npx dpd-tracking <tracking-number> --zip <postal-code>
```

## Quick Start

```bash
# Track a parcel
dpd 12345678901234 --zip 1100

# Specify country (default: AT)
dpd 12345678901234 --zip 1100 --country DE

# Get JSON output
dpd 12345678901234 --zip 1100 --json
```

## Usage

```
dpd <tracking-number> [options]

Options:
  -z, --zip <code>       Postal code for verification
  -c, --country <code>   Country code (AT, DE) [default: AT]
  -j, --json             Output as JSON
  --retries <count>      Max retry attempts [default: 3]
  -h, --help             Display help
  -V, --version          Display version
```

## Example Output

```
📦 DPD Tracking: 12345678901234
Country: AT

Status: In Transit
Destination: Wien 1100
Last Update: 30.01.2024, 14:23 Wien Package sorted at parcel center

Event History:
  • 30.01.2024, 14:23 Wien Package sorted at parcel center
  • 30.01.2024, 09:15 Gerasdorf Package in transit to delivery depot
  • 29.01.2024, 18:42 München Package received at depot
```

## Scripting Example

```bash
#!/bin/bash

# Track parcel and handle errors
dpd 12345678901234 --zip 1100 --json > tracking.json

case $? in
  0) echo "✓ Tracking successful" ;;
  2) echo "✗ Tracking number not found" ;;
  3) echo "✗ Wrong postal code" ;;
  *) echo "✗ Error occurred" ;;
esac
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Tracking number not found |
| 3 | Postal code mismatch |
| 4 | Unsupported country |

## Supported Countries

| Code | Country |
|------|---------|
| AT | Austria |
| DE | Germany |

Want more countries? Open an issue or submit a PR!

## Known Limitations

**DPD API behavior:**
- Returns `null` for shipments older than ~30 days
- May return `null` for brand new packages (not yet in system)
- Requires postal code for verification (optional but recommended)

**Workaround:**  
If tracking fails for a new package, wait a few hours and retry.

## Development

```bash
# Clone repo
git clone https://github.com/owen-raum/dpd-tracking.git
cd dpd-tracking

# Install dependencies
npm install

# Test
node bin/dpd.js <your-tracking-number> --zip <your-zip>
```

## Architecture

- `bin/dpd.js` - CLI entry point (Commander.js)
- `lib/api.js` - DPD API client with retry logic
- `lib/formatter.js` - Output formatters (human/JSON)
- `config/countries.json` - Country endpoints

## Contributing

Contributions welcome! Please open an issue first to discuss changes.

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a PR

## License

MIT © Owen the Frog

## Related

Part of the [OpenClaw](https://openclaw.ai) ecosystem.  
Find more skills at [ClawdHub](https://clawdhub.com).
