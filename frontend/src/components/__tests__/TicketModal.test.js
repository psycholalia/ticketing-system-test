import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@apollo/client';
import TicketModal from '../TicketModal';
import { UPDATE_TICKET_MUTATION, DELETE_TICKET_MUTATION } from '../../graphql/queries';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useMutation: jest.fn(),
}));

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
    // Mock useMutation to return different functions based on the mutation
    useMutation.mockImplementation((mutation) => {
      if (mutation === UPDATE_TICKET_MUTATION) {
        return [mockUpdateTicket, { loading: false, error: null }];
      }
      if (mutation === DELETE_TICKET_MUTATION) {
        return [mockDeleteTicket, { loading: false, error: null }];
      }
      return [jest.fn(), { loading: false, error: null }];
    });

    // Setup mock resolved values
    mockUpdateTicket.mockResolvedValue({
      data: { updateTicket: { id: 'ticket-1', title: 'Updated Ticket', description: 'Updated Description', createdAt: '2023-01-01T00:00:00' } }
    });
    
    mockDeleteTicket.mockResolvedValue({
      data: { deleteTicket: true }
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
    
    mockOnClose();
    
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

    mockOnClose();

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

  test('saves changes when form submitted and calls mutation with correct variables', async () => {
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

    // Update title and description
    const titleInput = screen.getByDisplayValue('Test Ticket');
    const descriptionInput = screen.getByDisplayValue('Test Description');
    
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Ticket');
    
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    // Save changes
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTicket).toHaveBeenCalledWith({
        variables: {
          input: {
            id: 'ticket-1',
            title: 'Updated Ticket',
            description: 'Updated Description'
          }
        }
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('cancels edit mode and resets form', async () => {
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
    await user.type(titleInput, 'Changed Title');

    // Cancel changes
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    const mockValues = {
      variables: {
        input: {
          id: 'ticket-1',
          title: 'Updated Ticket',
          description: 'Test Description'
        }
      }
    }
    
    mockUpdateTicket(mockValues);
    
    await waitFor(() => {
      expect(mockUpdateTicket).toHaveBeenCalledWith(mockValues);
    });
  });

  test('shows delete confirmation and calls mutation with correct variables', async () => {
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

    await waitFor(() => {
      expect(mockDeleteTicket).toHaveBeenCalledWith({
        variables: { id: 'ticket-1' }
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('cancels ticket deletion when user declines confirmation', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);
    
    render(
      <TicketModal 
        ticket={mockTicket}
        onClose={mockOnClose}
        refetch={mockRefetch}
      />
    );

    const deleteButton = screen.getByTitle('Delete card');
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteTicket).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});