import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery, useMutation } from '@apollo/client';
import App from '../App';
import { GET_BOARD_DATA, UPDATE_TICKET_MUTATION, UPDATE_COLUMN_MUTATION } from '../graphql/queries';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

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
    // Mock useMutation to return different functions based on the mutation
    useMutation.mockImplementation((mutation) => {
      if (mutation === UPDATE_TICKET_MUTATION) {
        return [mockUpdateTicket, { loading: false, error: null }];
      }
      if (mutation === UPDATE_COLUMN_MUTATION) {
        return [mockUpdateColumn, { loading: false, error: null }];
      }
      return [jest.fn(), { loading: false, error: null }];
    });

    // Setup mock resolved values
    mockUpdateTicket.mockResolvedValue({
      data: { updateTicket: { id: 'ticket-1', title: 'Updated Ticket', columnId: 'col-2', position: 0 } }
    });
    
    mockUpdateColumn.mockResolvedValue({
      data: { updateColumn: { id: 'col-1', name: 'Updated Column', position: 1 } }
    });

    // Mock localStorage
    mockLocalStorage.getItem.mockReturnValue('default-board');

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

  test('renders board data when loaded', () => {
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

  test('calls useQuery with correct variables', () => {
    useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockBoardData,
      refetch: mockRefetch
    });

    render(<App />);

    expect(useQuery).toHaveBeenCalledWith(GET_BOARD_DATA, {
      variables: { boardId: 'default-board' },
      pollInterval: 5000
    });
  });

  test('shows board modal when add board button clicked', async () => {
    const user = userEvent.setup();
    
    useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockBoardData,
      refetch: mockRefetch
    });

    render(<App />);

    const addBoardButton = screen.getByText('Add a board');
    await user.click(addBoardButton);

    expect(screen.getByText('Add a Board')).toBeInTheDocument();
  });

  test('handles localStorage board ID correctly', () => {
    mockLocalStorage.getItem.mockReturnValue('custom-board-id');
    
    useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockBoardData,
      refetch: mockRefetch
    });

    render(<App />);

    expect(useQuery).toHaveBeenCalledWith(GET_BOARD_DATA, {
      variables: { boardId: 'custom-board-id' },
      pollInterval: 5000
    });
  });

  test('uses default board ID when localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    useQuery.mockReturnValue({
      loading: false,
      error: null,
      data: mockBoardData,
      refetch: mockRefetch
    });

    render(<App />);

    expect(useQuery).toHaveBeenCalledWith(GET_BOARD_DATA, {
      variables: { boardId: 'default-board' },
      pollInterval: 5000
    });
  });
});