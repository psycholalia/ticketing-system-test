import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@apollo/client';
import Column from '../Column';
import { UPDATE_COLUMN_MUTATION, DELETE_COLUMN_MUTATION, CREATE_TICKET_MUTATION } from '../../graphql/queries';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
}));

const mockColumn = {
  id: 'col-1',
  boardId: 'board-1',
  name: 'To Do',
  position: 0,
  createdAt: '2023-01-01T00:00:00'
};

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

describe('Column Component', () => {
  const mockRefetch = jest.fn();
  const mockUpdateColumn = jest.fn();
  const mockDeleteColumn = jest.fn();
  const mockCreateTicket = jest.fn();

  beforeEach(() => {
    // Mock useMutation to return different functions based on the mutation
    useMutation.mockImplementation((mutation) => {
      if (mutation === UPDATE_COLUMN_MUTATION) {
        return [mockUpdateColumn, { loading: false, error: null }];
      }
      if (mutation === DELETE_COLUMN_MUTATION) {
        return [mockDeleteColumn, { loading: false, error: null }];
      }
      if (mutation === CREATE_TICKET_MUTATION) {
        return [mockCreateTicket, { loading: false, error: null }];
      }
      return [jest.fn(), { loading: false, error: null }];
    });

    // Setup mock resolved values
    mockUpdateColumn.mockResolvedValue({
      data: { updateColumn: { id: 'col-1', name: 'Updated Column', position: 0, createdAt: '2023-01-01T00:00:00' } }
    });
    
    mockDeleteColumn.mockResolvedValue({
      data: { deleteColumn: true }
    });
    
    mockCreateTicket.mockResolvedValue({
      data: { createTicket: { id: 'ticket-new', columnId: 'col-1', title: 'New Ticket', description: 'New Description', position: 1, createdAt: '2023-01-01T00:00:00' } }
    });

    jest.clearAllMocks();
  });

  test('renders column title', () => {
    render(
      <Column 
        column={mockColumn}
        tickets={mockTickets}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  test('renders tickets in column', () => {
    render(
      <Column 
        column={mockColumn}
        tickets={mockTickets}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
  });

  test('allows column title editing and calls mutation with correct variables', async () => {
    const user = userEvent.setup();
    
    render(
      <Column 
        column={mockColumn}
        tickets={mockTickets}
        index={0}
        refetch={mockRefetch}
      />
    );

    const columnTitle = screen.getByText('To Do');
    await user.click(columnTitle);

    const input = screen.getByDisplayValue('To Do');
    expect(input).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'Updated Column');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockUpdateColumn).toHaveBeenCalledWith({
        variables: {
          input: {
            id: 'col-1',
            name: 'Updated Column'
          }
        }
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('shows add ticket button', () => {
    render(
      <Column 
        column={mockColumn}
        tickets={mockTickets}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Add a card')).toBeInTheDocument();
  });

  test('allows adding new ticket and calls mutation with correct variables', async () => {
    const user = userEvent.setup();
    
    render(
      <Column 
        column={mockColumn}
        tickets={mockTickets}
        index={0}
        refetch={mockRefetch}
      />
    );

    const addTicketButton = screen.getByText('Add a card');
    await user.click(addTicketButton);

    const titleInput = screen.getByPlaceholderText('Enter a title for this card...');
    const descriptionInput = screen.getByPlaceholderText('Enter a description...');
    
    expect(titleInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();

    await user.type(titleInput, 'New Ticket');
    await user.type(descriptionInput, 'New Description');
    
    const addButton = screen.getByText('Add Card');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalledWith({
        variables: {
          input: {
            columnId: 'col-1',
            title: 'New Ticket',
            description: 'New Description',
            position: 1
          }
        }
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('shows delete confirmation and calls mutation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    
    render(
      <Column 
        column={mockColumn}
        tickets={mockTickets}
        index={0}
        refetch={mockRefetch}
      />
    );

    const deleteButton = screen.getByTitle('Delete column');
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this column? All tickets in this column will be deleted.'
    );

    await waitFor(() => {
      expect(mockDeleteColumn).toHaveBeenCalledWith({
        variables: { id: 'col-1' }
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  test('cancels column deletion when user declines confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);
    
    render(
      <Column 
        column={mockColumn}
        tickets={mockTickets}
        index={0}
        refetch={mockRefetch}
      />
    );

    const deleteButton = screen.getByTitle('Delete column');
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteColumn).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
  });
});