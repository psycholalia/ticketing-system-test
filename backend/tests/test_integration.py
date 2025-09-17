import pytest
import asyncio
from httpx import AsyncClient
from app import app

@pytest.mark.asyncio
async def test_graphql_endpoint():
    """Test GraphQL endpoint is accessible"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test GraphQL introspection query
        query = """
        query IntrospectionQuery {
            __schema {
                types {
                    name
                }
            }
        }
        """
        
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        
        data = response.json()
        assert "data" in data
        assert "__schema" in data["data"]

@pytest.mark.asyncio
async def test_boards_query():
    """Test boards GraphQL query"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        query = """
        query {
            boards {
                id
                name
                createdAt
            }
        }
        """
        
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        
        data = response.json()
        assert "data" in data
        assert "boards" in data["data"]
        assert isinstance(data["data"]["boards"], list)

@pytest.mark.asyncio
async def test_board_with_columns_and_tickets():
    """Test complete board data query"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        query = """
        query GetBoardData($boardId: String!) {
            board(id: $boardId) {
                id
                name
                createdAt
            }
            columns(boardId: $boardId) {
                id
                boardId
                name
                position
                createdAt
            }
            allTickets(boardId: $boardId) {
                id
                columnId
                title
                description
                position
                createdAt
            }
        }
        """
        
        variables = {"boardId": "default-board"}
        response = await client.post("/graphql", json={"query": query, "variables": variables})
        assert response.status_code == 200
        
        data = response.json()
        assert "data" in data
        assert data["data"]["board"] is not None
        assert isinstance(data["data"]["columns"], list)
        assert isinstance(data["data"]["allTickets"], list)

@pytest.mark.asyncio
async def test_create_and_update_ticket():
    """Test ticket creation and update mutations"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # First get a column ID
        columns_query = """
        query {
            columns(boardId: "default-board") {
                id
            }
        }
        """
        
        response = await client.post("/graphql", json={"query": columns_query})
        columns = response.json()["data"]["columns"]
        column_id = columns[0]["id"]
        
        # Create ticket
        create_mutation = """
        mutation CreateTicket($input: CreateTicketInput!) {
            createTicket(input: $input) {
                id
                title
                description
                columnId
            }
        }
        """
        
        create_variables = {
            "input": {
                "columnId": column_id,
                "title": "Test Ticket",
                "description": "Test Description",
                "position": 0
            }
        }
        
        response = await client.post("/graphql", json={
            "query": create_mutation, 
            "variables": create_variables
        })
        assert response.status_code == 200
        
        created_ticket = response.json()["data"]["createTicket"]
        assert created_ticket["title"] == "Test Ticket"
        
        # Update ticket
        update_mutation = """
        mutation UpdateTicket($input: UpdateTicketInput!) {
            updateTicket(input: $input) {
                id
                title
                description
            }
        }
        """
        
        update_variables = {
            "input": {
                "id": created_ticket["id"],
                "title": "Updated Test Ticket",
                "description": "Updated Description"
            }
        }
        
        response = await client.post("/graphql", json={
            "query": update_mutation,
            "variables": update_variables
        })
        assert response.status_code == 200
        
        updated_ticket = response.json()["data"]["updateTicket"]
        assert updated_ticket["title"] == "Updated Test Ticket"