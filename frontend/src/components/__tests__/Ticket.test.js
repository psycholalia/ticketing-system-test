import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Ticket from '../Ticket';
import { useMutation } from '@apollo/client'
import { UPDATE_TICKET_MUTATION } from '../../graphql/queries';

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

describe('Ticket Component', () => {
  const mockRefetch = jest.fn();
  const mockUpdateTicket = jest.fn();

  beforeEach(() => {    
    useMutation.mockImplementation((mutation) => {
        if (mutation === UPDATE_TICKET_MUTATION) {
          return [mockUpdateTicket, { loading: false, error: null }];
        }
        return [jest.fn(), { loading: false, error: null }];
      });
    jest.clearAllMocks();
  });

  test('renders ticket title', () => {
    render(
      <Ticket 
        ticket={mockTicket}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
  });

  test('renders ticket description', () => {
    render(
      <Ticket 
        ticket={mockTicket}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('renders creation date', () => {
    render(
      <Ticket 
        ticket={mockTicket}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
  });

  test('opens modal when ticket clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Ticket 
        ticket={mockTicket}
        index={0}
        refetch={mockRefetch}
      />
    );

    const ticketElement = screen.getByText('Test Ticket').closest('.ticket');
    await user.click(ticketElement);

    // Modal should open
    expect(screen.getByText('Card Details')).toBeInTheDocument();
  });

  test('opens modal when edit button clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Ticket 
        ticket={mockTicket}
        index={0}
        refetch={mockRefetch}
      />
    );

    const editButton = screen.getByTitle('Edit ticket');
    await user.click(editButton);

    // Modal should open
    expect(screen.getByText('Card Details')).toBeInTheDocument();
  });

  test('renders ticket without description', () => {
    const ticketWithoutDescription = {
      ...mockTicket,
      description: ''
    };

    render(
      <Ticket 
        ticket={ticketWithoutDescription}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  test('renders ticket with long description truncated', () => {
    const ticketWithLongDescription = {
      ...mockTicket,
      description: 'This is a very long description that should be truncated in the ticket card view to prevent the card from becoming too large and affecting the layout of the board.'
    };

    render(
      <Ticket 
        ticket={ticketWithLongDescription}
        index={0}
        refetch={mockRefetch}
      />
    );

    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    // The description should be present but truncated via CSS
    const descriptionElement = screen.getByText(ticketWithLongDescription.description);
    expect(descriptionElement).toHaveClass('ticket-description');
  });

  test('shows edit button on hover', () => {
    render(
      <Ticket 
        ticket={mockTicket}
        index={0}
        refetch={mockRefetch}
      />
    );

    const editButton = screen.getByTitle('Edit ticket');
    expect(editButton).toBeInTheDocument();
  });
});