import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@apollo/client';
import Column from '../Column';

jest.mock('@apollo/client');

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
    useMutation.mockImplementation((mutation) => {
      if (mutation.toString().includes('UpdateColumn')) {
        return [mockUpdateColumn];
      }
      if (mutation.toString().includes('DeleteColumn')) {
        return [mockDeleteColumn];
      }
      if (mutation.toString().includes('CreateTicket')) {
        return [mockCreateTicket];
      }
      return [jest.fn()];
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

  test('allows column title editing', async () => {
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
      expect(mockUpdateColumn).toHaveBeenCalled();
    });
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

  test('allows adding new ticket', async () => {
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
    expect(titleInput).toBeInTheDocument();

    await user.type(titleInput, 'New Ticket');
    
    const addButton = screen.getByText('Add Card');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalled();
    });
  });

  test('shows delete confirmation', async () => {
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
  });
});