import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@apollo/client';
import Board from '../Board';
import { UPDATE_BOARD_MUTATION, CREATE_COLUMN_MUTATION, DELETE_BOARD_MUTATION } from '../../graphql/queries';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
}));

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  createdAt: '2023-01-01T00:00:00'
};

const mockColumns = [
  {
    id: 'col-1',
    boardId: 'board-1',
    name: 'To Do',
    position: 0,
    createdAt: '2023-01-01T00:00:00'
  },
  {
    id: 'col-2',
    boardId: 'board-1',
    name: 'In Progress',
    position: 1,
    createdAt: '2023-01-01T00:00:00'
  }
];

const mockTickets = [
  {
    id: 'ticket-1',
    columnId: 'col-1',
    title: 'Test Ticket',
    description: 'Test Description',
    position: 0,
    createdAt: '2023-01-01T00:00:00'
  }
];

describe('Board Component', () => {
  const mockRefetch = jest.fn();
  const mockOnDeleteBoard = jest.fn();
  const mockUpdateBoard = jest.fn();
  const mockCreateColumn = jest.fn();
  const mockDeleteBoard = jest.fn();

  beforeEach(() => {
    // Mock useMutation to return different functions based on the mutation
    useMutation.mockImplementation((mutation) => {
      if (mutation === UPDATE_BOARD_MUTATION) {
        return [mockUpdateBoard, { loading: false, error: null }];
      }
      if (mutation === CREATE_COLUMN_MUTATION) {
        return [mockCreateColumn, { loading: false, error: null }];
      }
      if (mutation === DELETE_BOARD_MUTATION) {
        return [mockDeleteBoard, { loading: false, error: null }];
      }
      return [jest.fn(), { loading: false, error: null }];
    });

    // Setup mock resolved values
    mockUpdateBoard.mockResolvedValue({
      data: { updateBoard: { id: 'board-1', name: 'Updated Board Title', createdAt: '2023-01-01T00:00:00' } }
    });
    
    mockCreateColumn.mockResolvedValue({
      data: { createColumn: { id: 'col-new', boardId: 'board-1', name: 'New Column', position: 2, createdAt: '2023-01-01T00:00:00' } }
    });
    
    mockDeleteBoard.mockResolvedValue({
      data: { deleteBoard: true }
    });

    jest.clearAllMocks();
  });

  test('renders board title', () => {
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockOnDeleteBoard}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Test Board')).toBeInTheDocument();
  });

  test('renders columns', () => {
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockOnDeleteBoard}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('allows board title editing and calls mutation with correct variables', async () => {
    const user = userEvent.setup();
    
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockOnDeleteBoard}
        refetch={mockRefetch}
      />
    );

    const boardTitle = screen.getByText('Test Board');
    await user.click(boardTitle);

    const input = screen.getByDisplayValue('Test Board');
    expect(input).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'Updated Board Title');
    await user.keyboard('[Enter]');

    await waitFor(() => {
      expect(mockUpdateBoard).toHaveBeenCalledWith({
        variables: { id: 'board-1', name: 'Updated Board Title' }
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('shows add column button', () => {
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockOnDeleteBoard}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Add another column')).toBeInTheDocument();
  });

  test('allows adding new column and calls mutation with correct variables', async () => {
    const user = userEvent.setup();
    
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockOnDeleteBoard}
        refetch={mockRefetch}
      />
    );

    const addColumnButton = screen.getByText('Add another column');
    await user.click(addColumnButton);

    const input = screen.getByPlaceholderText('Enter column name...');
    expect(input).toBeInTheDocument();

    await user.type(input, 'New Column');
    
    const addButton = screen.getByText('Add Column');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockCreateColumn).toHaveBeenCalledWith({
        variables: {
          input: {
            boardId: 'board-1',
            name: 'New Column',
            position: 2
          }
        }
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('handles board deletion with confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockOnDeleteBoard}
        refetch={mockRefetch}
      />
    );

    const deleteButton = screen.getByTitle('Delete Board');
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this board? All tickets and columns in this board will be deleted.'
    );

    await waitFor(() => {
      expect(mockDeleteBoard).toHaveBeenCalledWith({
        variables: { id: 'board-1' }
      });
    });

    expect(mockOnDeleteBoard).toHaveBeenCalled();
  });
});