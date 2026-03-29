# Travel Buddy MCP Server

An [MCP](https://modelcontextprotocol.io) (Model Context Protocol) server that exposes travel tools backed by the **Travel Buddy** HTTP API. Hosts connect over **stdio**; no API keys are required in the server itself.

## Requirements

- Node.js 18+ (uses global `fetch`)

## Setup

```bash
npm install
npm run build
```

This compiles TypeScript from `src/` into `build/`.

## Run

```bash
node build/index.js
```

The process speaks MCP on stdin/stdout. Log lines intended for humans go to stderr.

### Cursor / other MCP clients

Point your client at the built entrypoint, for example:

```json
{
  "mcpServers": {
    "travel-buddy": {
      "command": "node",
      "args": ["/absolute/path/to/travel/build/index.js"]
    }
  }
}
```

Adjust the path to match where you cloned this repo.

## Tools

| Tool | Purpose |
|------|--------|
| `get_travel_weather` | Weather for a place and date range |
| `search_hotels` | Hotel search by location and stay dates |
| `search_flights` | Flights by origin/destination IATA codes and date |
| `get_maps_context` | Map context for comma-separated locations |
| `get_travel_content` | Travel content for a single location |

All responses are returned as text (JSON pretty-printed when the API returns JSON).

## Project layout

- `src/index.ts` — server implementation
- `client/` — optional local CLI that uses Gemini + this server (separate `package.json`)
