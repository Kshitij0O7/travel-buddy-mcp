import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const TRAVEL_BUDDY_BASE = "https://travel-buddy-api-khaki.vercel.app";
const USER_AGENT = "travel-planner-mcp/1.0";
const server = new McpServer({
    name: "travel-planner",
    version: "1.0.0",
});
function buildTravelBuddyUrl(path, params) {
    const url = new URL(path, `${TRAVEL_BUDDY_BASE}/`);
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
            url.searchParams.set(key, String(value));
        }
    }
    return url.toString();
}
async function fetchTravelBuddy(url) {
    try {
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": USER_AGENT,
            },
        });
        const raw = await response.text();
        if (!response.ok) {
            return `Request failed (${response.status}): ${raw.slice(0, 2000)}`;
        }
        try {
            return JSON.stringify(JSON.parse(raw), null, 2);
        }
        catch {
            return raw;
        }
    }
    catch (error) {
        return error instanceof Error ? error.message : String(error);
    }
}
const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Date in YYYY-MM-DD format");
server.tool("get_travel_weather", "Get weather for a destination and date range (Travel Buddy API). Use for trip planning.", {
    location: z.string().min(1).describe("City or place name (e.g. Manali)"),
    startDate: isoDate.describe("Range start (YYYY-MM-DD)"),
    endDate: isoDate.describe("Range end (YYYY-MM-DD)"),
}, async ({ location, startDate, endDate }) => {
    const url = buildTravelBuddyUrl("/api/v1/weather/mcp", {
        location,
        startDate,
        endDate,
    });
    const text = await fetchTravelBuddy(url);
    return {
        content: [{ type: "text", text }],
    };
});
server.tool("search_hotels", "Search hotels by location and stay dates (Travel Buddy API).", {
    location: z.string().min(1).describe("City or area (e.g. Manali)"),
    checkin: isoDate.describe("Check-in date (YYYY-MM-DD)"),
    checkout: isoDate.describe("Check-out date (YYYY-MM-DD)"),
    adults: z
        .number()
        .int()
        .min(1)
        .optional()
        .default(2)
        .describe("Number of adults (default 2)"),
}, async ({ location, checkin, checkout, adults }) => {
    const url = buildTravelBuddyUrl("/api/v1/hotels", {
        location,
        checkin,
        checkout,
        adults,
    });
    const text = await fetchTravelBuddy(url);
    return {
        content: [{ type: "text", text }],
    };
});
server.tool("search_flights", "Search flights by origin, destination airport/city codes, and departure date (Travel Buddy API).", {
    origin: z
        .string()
        .min(2)
        .describe("Origin IATA code (e.g. DEL for Delhi)"),
    destination: z
        .string()
        .min(2)
        .describe("Destination IATA code (e.g. BHO for Bhopal)"),
    date: isoDate.describe("Departure date (YYYY-MM-DD)"),
}, async ({ origin, destination, date }) => {
    const url = buildTravelBuddyUrl("/api/v1/flights", {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
    });
    const text = await fetchTravelBuddy(url);
    return {
        content: [{ type: "text", text }],
    };
});
server.tool("get_maps_context", "Get map context for multiple locations on a route or trip (Travel Buddy API).", {
    locations: z
        .string()
        .min(1)
        .describe("Comma-separated place names (e.g. Mumbai,Amritsar,Wagah_Border)"),
}, async ({ locations }) => {
    const url = buildTravelBuddyUrl("/api/v1/maps/mcp/context", {
        locations,
    });
    const text = await fetchTravelBuddy(url);
    return {
        content: [{ type: "text", text }],
    };
});
server.tool("get_travel_content", "Get travel content for a location (Travel Buddy API).", {
    location: z.string().min(1).describe("City or place name (e.g. Amritsar)"),
}, async ({ location }) => {
    const url = buildTravelBuddyUrl("/api/v1/content/mcp", {
        location,
    });
    const text = await fetchTravelBuddy(url);
    return {
        content: [{ type: "text", text }],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Travel planner MCP server running on stdio (Travel Buddy API)");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
