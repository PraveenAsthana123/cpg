import TabStub from '../common/TabStub';
export default function MCPServersTab({ dept }) {
  return <TabStub
    name={`${dept?.name || 'Department'} — MCP Servers`}
    description="Model Context Protocol server registrations: URL, transport (stdio/HTTP/SSE), auth, advertised tools & resources, health check, rate limits."
  />;
}
