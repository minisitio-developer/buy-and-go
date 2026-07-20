import pytest
from mcp.server import MCPServer

@pytest.fixture
def mcp():
    return MCPServer()

class TestMCPServer:
    def test_list_tools(self, mcp):
        tools = mcp.list_tools()
        assert len(tools) > 10
        tool_names = [t["name"] for t in tools]
        assert "create_event" in tool_names
        assert "query_bi" in tool_names
        assert "create_qr" in tool_names

    @pytest.mark.asyncio
    async def test_execute_create_event(self, mcp):
        result = await mcp.execute("create_event", {
            "name": "Test Event",
            "type": "presential",
            "start_date": "2026-09-15",
            "end_date": "2026-09-18",
        })
        assert result["status"] == "simulated"
        assert result["action"] == "create_event"

    @pytest.mark.asyncio
    async def test_execute_unknown_tool(self, mcp):
        with pytest.raises(ValueError, match="Unknown tool"):
            await mcp.execute("unknown_tool", {})

    @pytest.mark.asyncio
    async def test_execute_analyze_roi(self, mcp):
        result = await mcp.execute("analyze_roi", {
            "sponsor_id": "sponsor-1",
            "event_id": "event-1",
        })
        assert "roi" in result
        assert "visits" in result
