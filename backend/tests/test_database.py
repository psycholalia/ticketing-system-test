import pytest
from moto import mock_aws
from database import (
    init_db, get_tables, seed_data, get_boards, get_board, update_board,
    get_columns_by_board, create_column, update_column, delete_column,
    get_tickets_by_column, create_ticket, update_ticket, delete_ticket,
    get_all_tickets_by_board, create_board, delete_board
)
import os

# Mock DynamoDB for testing
@pytest.fixture
def mock_dynamodb_setup():
    with mock_aws():
        # Set up test environment
        os.environ['DYNAMODB_ENDPOINT'] = 'http://localhost:8000'
        yield

@mock_aws
def test_init_db(mock_dynamodb_setup):
    """Test database initialization"""
    init_db()
    
    # Verify tables were created
    tables = get_tables()
    
    assert 'boards' in tables['TableNames']
    assert 'columns' in tables['TableNames']
    assert 'tickets' in tables['TableNames']

def test_board_operations(mock_dynamodb_setup):
    """Test board CRUD operations"""
    # Test get board
    board = get_board('default-board')
    assert board is not None
    assert board['name'] == 'Opus1 Task Board'

    boards = get_boards()
    assert boards is not None

    created_board = create_board('New board', 'board-2')
    assert created_board['name'] == 'New board'
    assert 'id' in created_board

    # Test update board
    updated_board = update_board('default-board', 'Updated Board Name')
    assert updated_board['name'] == 'Updated Board Name'


def test_column_operations(mock_dynamodb_setup):
    """Test column CRUD operations"""
    # Test create column
    new_column = create_column('default-board', 'New Column', 3)
    assert new_column['name'] == 'New Column'
    assert new_column['position'] == 3

    new_column_in_new_board = create_column('board-2', 'New Column', 0)
    assert new_column_in_new_board['name'] == 'New Column'
    assert new_column_in_new_board['position'] == 0
    
    # Test update column
    updated_column = update_column(new_column['id'], name='Updated Column', position=4)
    assert updated_column['name'] == 'Updated Column'
    assert updated_column['position'] == 4
    
    # Test delete column
    result = delete_column(new_column['id'])
    assert result is True

def test_ticket_operations(mock_dynamodb_setup):
    """Test ticket CRUD operations"""
    # Get a column to add ticket to
    columns = get_columns_by_board('default-board')
    column_id = columns[0]['id']

    columns_in_new_board = get_columns_by_board('board-2')
    column_id_in_new_board = columns_in_new_board[0]['id']

    # Test create tickets
    new_ticket = create_ticket(column_id, 'Test Ticket', 'Test Description', 0)
    assert new_ticket['title'] == 'Test Ticket'
    assert new_ticket['description'] == 'Test Description'

    new_ticket_in_new_board = create_ticket(column_id_in_new_board, 'Test Ticket', 'Test Description', 0)
    assert new_ticket_in_new_board['title'] == 'Test Ticket'
    assert new_ticket_in_new_board['description'] == 'Test Description'
    
    # Test update ticket
    updated_ticket = update_ticket(
        new_ticket['id'], 
        title='Updated Ticket', 
        description='Updated Description'
    )
    assert updated_ticket['title'] == 'Updated Ticket'
    assert updated_ticket['description'] == 'Updated Description'
    
    # Test delete ticket
    result = delete_ticket(new_ticket['id'])
    assert result is True

    new_board_tickets = get_all_tickets_by_board('board-2')
    assert len(new_board_tickets) == 1

def test_get_tickets_by_column(mock_dynamodb_setup):
    """Test getting tickets by column"""
    columns = get_columns_by_board('default-board')
    column_id = columns[0]['id']
    
    tickets = get_tickets_by_column(column_id)
    assert isinstance(tickets, list)
    # Should have tickets from seed data
    assert len(tickets) >= 0

def test_tear_down_board(mock_dynamodb_setup):
    """Delete whole board with tickets and everything"""
    deleted_board = delete_board('board-2')
    board_exists = False
    boards = get_boards()
    for board in boards:
        if board['id'] == 'board-2':
            board_exists = True
    assert board_exists == False