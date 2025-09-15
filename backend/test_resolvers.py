import pytest
from unittest.mock import patch, MagicMock
from resolvers import Query, Mutation
from models import CreateColumnInput, UpdateColumnInput, CreateTicketInput, UpdateTicketInput

class TestQuery:
    """Test GraphQL Query resolvers"""
    
    def setup_method(self):
        self.query = Query()
    
    @patch('resolvers.db.get_boards')
    def test_boards_resolver(self, mock_get_boards):
        """Test boards query resolver"""
        mock_get_boards.return_value = [
            {'id': 'board-1', 'name': 'Test Board', 'created_at': '2023-01-01T00:00:00'}
        ]
        
        result = self.query.boards()
        
        assert len(result) == 1
        assert result[0].id == 'board-1'
        assert result[0].name == 'Test Board'
        mock_get_boards.assert_called_once()
    
    @patch('resolvers.db.get_board')
    def test_board_resolver(self, mock_get_board):
        """Test single board query resolver"""
        mock_get_board.return_value = {
            'id': 'board-1', 
            'name': 'Test Board', 
            'created_at': '2023-01-01T00:00:00'
        }
        
        result = self.query.board('board-1')
        
        assert result.id == 'board-1'
        assert result.name == 'Test Board'
        mock_get_board.assert_called_once_with('board-1')
    
    @patch('resolvers.db.get_board')
    def test_board_resolver_not_found(self, mock_get_board):
        """Test board resolver when board not found"""
        mock_get_board.return_value = None
        
        result = self.query.board('nonexistent')
        
        assert result is None
        mock_get_board.assert_called_once_with('nonexistent')
    
    @patch('resolvers.db.get_columns_by_board')
    def test_columns_resolver(self, mock_get_columns):
        """Test columns query resolver"""
        mock_get_columns.return_value = [
            {
                'id': 'col-1', 
                'board_id': 'board-1', 
                'name': 'To Do', 
                'position': 0,
                'created_at': '2023-01-01T00:00:00'
            }
        ]
        
        result = self.query.columns('board-1')
        
        assert len(result) == 1
        assert result[0].id == 'col-1'
        assert result[0].name == 'To Do'
        mock_get_columns.assert_called_once_with('board-1')
    
    @patch('resolvers.db.get_all_tickets_by_board')
    def test_all_tickets_resolver(self, mock_get_tickets):
        """Test all tickets query resolver"""
        mock_get_tickets.return_value = [
            {
                'id': 'ticket-1',
                'column_id': 'col-1',
                'title': 'Test Ticket',
                'description': 'Test Description',
                'position': 0,
                'created_at': '2023-01-01T00:00:00'
            }
        ]
        
        result = self.query.all_tickets('board-1')
        
        assert len(result) == 1
        assert result[0].id == 'ticket-1'
        assert result[0].title == 'Test Ticket'
        mock_get_tickets.assert_called_once_with('board-1')

class TestMutation:
    """Test GraphQL Mutation resolvers"""
    
    def setup_method(self):
        self.mutation = Mutation()
    
    @patch('resolvers.db.update_board')
    def test_update_board_mutation(self, mock_update_board):
        """Test update board mutation"""
        mock_update_board.return_value = {
            'id': 'board-1',
            'name': 'Updated Board',
            'created_at': '2023-01-01T00:00:00'
        }
        
        result = self.mutation.update_board('board-1', 'Updated Board')
        
        assert result.id == 'board-1'
        assert result.name == 'Updated Board'
        mock_update_board.assert_called_once_with('board-1', 'Updated Board')
    
    @patch('resolvers.db.create_column')
    def test_create_column_mutation(self, mock_create_column):
        """Test create column mutation"""
        mock_create_column.return_value = {
            'id': 'col-new',
            'board_id': 'board-1',
            'name': 'New Column',
            'position': 1,
            'created_at': '2023-01-01T00:00:00'
        }
        
        input_data = CreateColumnInput(board_id='board-1', name='New Column', position=1)
        result = self.mutation.create_column(input_data)
        
        assert result.id == 'col-new'
        assert result.name == 'New Column'
        mock_create_column.assert_called_once_with('board-1', 'New Column', 1)
    
    @patch('resolvers.db.delete_ticket')
    def test_delete_ticket_mutation(self, mock_delete_ticket):
        """Test delete ticket mutation"""
        mock_delete_ticket.return_value = True
        
        result = self.mutation.delete_ticket('ticket-1')
        
        assert result is True
        mock_delete_ticket.assert_called_once_with('ticket-1')