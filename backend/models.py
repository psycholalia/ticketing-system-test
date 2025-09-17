import strawberry
from typing import Optional

"""
TYPES
"""

@strawberry.type
class Board:
    id: str
    name: str
    created_at: str

@strawberry.type
class Column:
    id: str
    board_id: str
    name: str
    position: int
    created_at: str

@strawberry.type
class Ticket:
    id: str
    column_id: str
    title: str
    description: str
    position: int
    created_at: str

"""
INPUTS
"""
@strawberry.input
class CreateBoardInput:
    name: str

@strawberry.input
class CreateColumnInput:
    board_id: str
    name: str
    position: int

@strawberry.input
class UpdateColumnInput:
    id: str
    name: Optional[str] = None
    position: Optional[int] = None

@strawberry.input
class CreateTicketInput:
    column_id: str
    title: str
    description: str
    position: int

@strawberry.input
class UpdateTicketInput:
    id: str
    title: Optional[str] = None
    description: Optional[str] = None
    column_id: Optional[str] = None
    position: Optional[int] = None