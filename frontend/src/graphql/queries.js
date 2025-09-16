import { gql } from '@apollo/client';

export const GET_BOARD_DATA = gql`
  query GetBoardData($boardId: String!) {
    board(id: $boardId) {
      id
      name
      createdAt
    }
    columns(boardId: $boardId) {
      id
      boardId
      name
      position
      createdAt
    }
    allTickets(boardId: $boardId) {
      id
      columnId
      title
      description
      position
      createdAt
    }
  }
`;


export const UPDATE_BOARD_MUTATION = gql`
  mutation UpdateBoard($id: String!, $name: String!) {
    updateBoard(id: $id, name: $name) {
      id
      name
      createdAt
    }
  }
`;

export const CREATE_BOARD_MUTATION = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      name
      createdAt
    }
  }
`;

export const DELETE_BOARD_MUTATION = gql`
  mutation DeleteBoard($id: String!) {
    deleteBoard(id: $id)
  }
`;

export const CREATE_COLUMN_MUTATION = gql`
  mutation CreateColumn($input: CreateColumnInput!) {
    createColumn(input: $input) {
      id
      boardId
      name
      position
      createdAt
    }
  }
`;

export const UPDATE_COLUMN_MUTATION = gql`
  mutation UpdateColumn($input: UpdateColumnInput!) {
    updateColumn(input: $input) {
      id
      boardId
      name
      position
      createdAt
    }
  }
`;

export const DELETE_COLUMN_MUTATION = gql`
  mutation DeleteColumn($id: String!) {
    deleteColumn(id: $id)
  }
`;

export const CREATE_TICKET_MUTATION = gql`
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      id
      columnId
      title
      description
      position
      createdAt
    }
  }
`;

export const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicket($input: UpdateTicketInput!) {
    updateTicket(input: $input) {
      id
      columnId
      title
      description
      position
      createdAt
    }
  }
`;

export const DELETE_TICKET_MUTATION = gql`
  mutation DeleteTicket($id: String!) {
    deleteTicket(id: $id)
  }
`;