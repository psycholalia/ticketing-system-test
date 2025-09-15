import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Ticket from '../Ticket';

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

  beforeEach(() => {
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

  test('opens modal when clicked', async () => {
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

    // Modal should open (we'd need to mock the TicketModal component to test this properly)
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
});