import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@apollo/client';
import TicketModal from '../TicketModal';

jest.mock('@apollo/client');

const mockTicket = {
  id: 'ticket-1',
  columnId: 'col-1',
  title: 'Test Ticket',
  description: 'Test Description',
  position: 0,
  createdAt: '2023-01-01T00:00:00'
};

describe('TicketModal Component', () => {
  const mockOnClose = jest.fn();
  const mockRefetch = jest.fn();
  const mockUpdateTicket = jest.fn();
  const mockDeleteTicket = jest.fn();

  beforeEach(() => {
    useMutation.mockImplementation((mutation) => {
      if (mutation.toString().includes('UpdateTicket')) {
        return [mockUpdateTicket];
      }
      if (mutation.toString().includes('DeleteTicket')) {
        return [mockDeleteTicket];
      }
      return [jest.fn()];
    });
    jest.clearAllMocks();
  });

  test('renders ticket details', () => {
    render(
      <TicketModal 
        ticket={mockTicket}
        onClose={mockOnClose}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Card Details')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('closes modal when close button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TicketModal 
        ticket={mockTicket}
        onClose={mockOnClose}
        refetch={mockRefetch}
      />
    );

    const closeButton = screen.getByTitle('Close');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes modal when overlay clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TicketModal 
        ticket={mockTicket}
        onClose={mockOnClose}
        refetch={mockRefetch}
      />
    );

    const overlay = screen.getByRole('dialog').parentElement;
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TicketModal 
        ticket={mockTicket}
        onClose={mockOnClose}
        refetch={mockRefetch}
      />
    );

    const editButton = screen.getByTitle('Edit card');
    await user.click(editButton);

    expect(screen.getByText('Edit Card')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Ticket')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  test('saves changes when form submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <TicketModal 
        ticket={mockTicket}
        onClose={mockOnClose}
        refetch={mockRefetch}
      />
    );

    // Enter edit mode
    const editButton = screen.getByTitle('Edit card');
    await user.click(editButton);

    // Update title
    const titleInput = screen.getByDisplayValue('Test Ticket');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Ticket');

    // Save changes
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTicket).toHaveBeenCalledWith({
        variables: {
          input: {
            id: 'ticket-1',
            title: 'Updated Ticket',
            description: 'Test Description'
          }
        }
      });
    });
  });

  test('shows delete confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    
    render(
      <TicketModal 
        ticket={mockTicket}
        onClose={mockOnClose}
        refetch={mockRefetch}
      />
    );

    const deleteButton = screen.getByTitle('Delete card');
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this ticket?'
    );
  });
});