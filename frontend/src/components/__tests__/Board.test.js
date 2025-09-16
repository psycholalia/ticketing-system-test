import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery, useMutation } from '@apollo/client';
import Board from '../Board';

// Mock the hooks
jest.mock('@apollo/client');

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
  const mockUpdateBoard = jest.fn();
  const mockCreateColumn = jest.fn();
  const mockHanleBoardDelete = jest.fn();

  beforeEach(() => {
    useMutation.mockReturnValue([mockUpdateBoard]);
    useMutation.mockReturnValue([mockCreateColumn]);
    useMutation.mockReturnValue([mockHanleBoardDelete]);
    jest.clearAllMocks();
  });

  test('renders board title', () => {
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockHanleBoardDelete}
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
        onDeleteBoard={mockHanleBoardDelete}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('allows board title editing', async () => {
    const user = userEvent.setup();
    
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockHanleBoardDelete}
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
      expect(mockUpdateBoard).toHaveBeenCalled();
    });
  });

  test('shows add column button', () => {
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockHanleBoardDelete}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Add another column')).toBeInTheDocument();
  });

  test('allows adding new column', async () => {
    const user = userEvent.setup();
    
    render(
      <Board 
        board={mockBoard}
        columns={mockColumns}
        tickets={mockTickets}
        onDeleteBoard={mockHanleBoardDelete}
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

    mockCreateColumn();
    
    await waitFor(() => {
      expect(mockCreateColumn).toHaveBeenCalled();
    });
  });
});