import strawberry
from typing import List, Optional
from models import Board, Column, Ticket, CreateColumnInput, UpdateColumnInput, CreateTicketInput, UpdateTicketInput
import database as db

@strawberry.type
class Query:
    @strawberry.field
    def boards(self) -> List[Board]:
        boards_data = db.get_boards()
        return [Board(**board) for board in boards_data]
    
    @strawberry.field
    def board(self, id: str) -> Optional[Board]:
        board_data = db.get_board(id)
        if board_data:
            return Board(**board_data)
        return None
    
    @strawberry.field
    def columns(self, board_id: str) -> List[Column]:
        columns_data = db.get_columns_by_board(board_id)
        return [Column(**column) for column in columns_data]
    
    @strawberry.field
    def tickets(self, column_id: str) -> List[Ticket]:
        tickets_data = db.get_tickets_by_column(column_id)
        return [Ticket(**ticket) for ticket in tickets_data]
    
    @strawberry.field
    def all_tickets(self, board_id: str) -> List[Ticket]:
        tickets_data = db.get_all_tickets_by_board(board_id)
        return [Ticket(**ticket) for ticket in tickets_data]

@strawberry.type
class Mutation:
    @strawberry.mutation
    def update_board(self, id: str, name: str) -> Board:
        board_data = db.update_board(id, name)
        return Board(**board_data)
    
    @strawberry.mutation
    def create_column(self, input: CreateColumnInput) -> Column:
        column_data = db.create_column(input.board_id, input.name, input.position)
        return Column(**column_data)
    
    @strawberry.mutation
    def update_column(self, input: UpdateColumnInput) -> Column:
        column_data = db.update_column(input.id, input.name, input.position)
        return Column(**column_data)
    
    @strawberry.mutation
    def delete_column(self, id: str) -> bool:
        return db.delete_column(id)
    
    @strawberry.mutation
    def create_ticket(self, input: CreateTicketInput) -> Ticket:
        ticket_data = db.create_ticket(input.column_id, input.title, input.description, input.position)
        return Ticket(**ticket_data)
    
    @strawberry.mutation
    def update_ticket(self, input: UpdateTicketInput) -> Ticket:
        ticket_data = db.update_ticket(input.id, input.title, input.description, input.column_id, input.position)
        return Ticket(**ticket_data)
    
    @strawberry.mutation
    def delete_ticket(self, id: str) -> bool:
        return db.delete_ticket(id)