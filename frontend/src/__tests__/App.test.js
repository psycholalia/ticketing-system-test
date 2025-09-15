import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useQuery, useMutation } from '@apollo/client';
import App from '../App';

jest.mock('@apollo/client');

const mockBoardData = {
  board: {
    id: 'default-board',
    name: 'My Trello Board',
    createdAt: '2023-01-01T00:00:00'
  },
  columns: [
    {
      id: 'col-1',
      boardId: 'default-board',
      name: 'To Do',
      position: 0,
      createdAt: '2023-01-01T00:00:00'
    }
  ],
  allTickets: [
    {
      id: 'ticket-1',
      columnId: 'col-1',
      title: 'Test Ticket',
      description: 'Test Description',
      position: 0,
      createdAt: '2023-01-01T00:00:00'
    }
  ]
};

describe('App Component', () => {
  const mockRefetch = jest.fn();
  const mockUpdateTicket = jest.fn();
  const mockUpdateColumn = jest.fn();

  beforeEach(() => {
    useMutation.mockImplementation((mutation) => {
      if (mutation.toString().includes('UpdateTicket')) {
        return [mockUpdateTicket];
      }
      if (mutation.toString().includes('UpdateColumn')) {
        return [mockUpdateColumn];
      }
      return [jest.fn()];
    });
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    useQuery.mockReturnValue({
      loading: true,
      error: null,
      data: null,
      refetch: mockRefetch
    });

    render(<App />);

    expect(screen.getByText('Loading board...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    useQuery.mockReturnValue({
      loading: false,
      error: { message: 'Network error' },
      data: null,
      refetch: mockRefetch
    });

    render(<App />);

    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });

  test('renders board data', () => {
    useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockBoardData,
      refetch: mockRefetch
    });

    render(<App />);

    expect(screen.getByText('My Trello Board')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
  });

  test('renders add board button', () => {
    useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockBoardData,
      refetch: mockRefetch
    });

    render(<App />);

    expect(screen.getByText('Add a board')).toBeInTheDocument();
  });
});