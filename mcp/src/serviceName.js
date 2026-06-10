// The single logical service name for this process — shared, so the OTel resource
// service.name (telemetry.js), the meter/tracer instrumentation scope, the
// @openagenda/logs namespace (log.js), and the MCP server handshake name (server.js)
// can never drift apart. They are the join key across metrics/traces/logs/MCP; one
// rename here keeps them aligned (a literal per module would split the service
// across Mimir/Tempo/Loki with no compile-time signal). Deliberately
// dependency-free so any module can import it without pulling in the OTel SDK.
export const SERVICE_NAME = 'openagenda-mcp';
