# DPD Tracking Skill

Track DPD parcels via CLI with multi-country support.

## Installation

```bash
npm install -g .
```

Or use directly:
```bash
node bin/dpd.js <tracking-number> --zip <postal-code>
```

## Usage

### Basic Tracking

```bash
# Track with postal code verification
dpd 12345678901234 --zip 1100

# Specify country (default: AT)
dpd 12345678901234 --zip 1100 --country DE

# JSON output (for scripting)
dpd 12345678901234 --zip 1100 --json
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--zip <code>` | `-z` | Postal code for verification | (none) |
| `--country <code>` | `-c` | Country code (AT, DE) | AT |
| `--json` | `-j` | Output as JSON | false |
| `--retries <count>` | | Max retry attempts | 3 |

### Exit Codes

The CLI uses specific exit codes for scripting:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error (network, API failure) |
| 2 | Tracking number not found |
| 3 | Postal code mismatch |
| 4 | Unsupported country |

### Example: Scripting

```bash
#!/bin/bash

dpd 12345678901234 --zip 1100 --json > tracking.json

if [ $? -eq 0 ]; then
  echo "✓ Tracking successful"
elif [ $? -eq 2 ]; then
  echo "✗ Tracking number not found (might not be in system yet)"
fi
```

## Supported Countries

| Code | Country | Endpoint |
|------|---------|----------|
| AT | Austria | tracking.dpd.de/rest/plc/de_AT/ |
| DE | Germany | tracking.dpd.de/rest/plc/de_DE/ |

## Error Handling

The tool implements exponential backoff retry logic:
- Default: 3 attempts
- Delays: 1s → 2s → 4s
- Retries only on transient errors (network, timeout)
- No retry on permanent errors (not found, invalid country)

## Known Issues

**DPD API returns `null` for:**
- Old shipments (deleted from system after ~30 days)
- Invalid tracking numbers
- Packages not yet in the system

**Workaround:**
Wait a few hours and retry if package is brand new.

## Agent Usage

```markdown
User: "Track my DPD package 12345678901234, PLZ 1100"

Agent should:
1. Extract tracking number and postal code
2. Run: dpd 12345678901234 --zip 1100
3. Parse and summarize the output
```

## Development

### Test

```bash
# With real tracking number
npm test

# Or manually
node bin/dpd.js <your-tracking-number> --zip <your-zip>
```

### Add Countries

Edit `config/countries.json`:
```json
{
  "CH": {
    "name": "Switzerland",
    "code": "de_CH",
    "endpoint": "https://tracking.dpd.de/rest/plc/de_CH/"
  }
}
```

## Architecture

```
dpd-tracking/
├── bin/dpd.js           # CLI entry point
├── lib/
│   ├── api.js           # DPD API client with retry logic
│   └── formatter.js     # Output formatters (human/JSON)
└── config/
    └── countries.json   # Country endpoints
```

## License

MIT
