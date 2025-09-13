import React, { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useMutation } from '@apollo/client';
import Ticket from './Ticket';
import { UPDATE_COLUMN_MUTATION, DELETE_COLUMN_MUTATION, CREATE_TICKET_MUTATION } from '../graphql/queries';
import { Plus, Trash2, MoreVertical, Edit3, Copy } from 'lucide-react';

const Column = ({ column, tickets, index, refetch }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.name);
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');

  const [updateColumn] = useMutation(UPDATE_COLUMN_MUTATION);
  const [deleteColumn] = useMutation(DELETE_COLUMN_MUTATION);
  const [createTicket] = useMutation(CREATE_TICKET_MUTATION);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    if (columnTitle.trim() && columnTitle.trim() !== column.name) {
      try {
        await updateColumn({
          variables: {
            input: {
              id: column.id,
              name: columnTitle.trim(),
            },
          },
        });
        setIsEditingTitle(false);
        refetch();
      } catch (error) {
        console.error('Error updating column title:', error);
      }
    } else {
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setColumnTitle(column.name);
      setIsEditingTitle(false);
    }
  };

  const handleDeleteColumn = async () => {
    if (window.confirm('Are you sure you want to delete this column? All tickets in this column will be deleted.')) {
      try {
        await deleteColumn({
          variables: { id: column.id },
        });
        refetch();
      } catch (error) {
        console.error('Error deleting column:', error);
      }
    }
  };

  const handleAddTicket = () => {
    setIsAddingTicket(true);
  };

  const handleAddTicketSubmit = async (e) => {
    e.preventDefault();
    if (newTicketTitle.trim()) {
      try {
        const nextPosition = tickets.length;
        await createTicket({
          variables: {
            input: {
              columnId: column.id,
              title: newTicketTitle.trim(),
              description: newTicketDescription.trim(),
              position: nextPosition,
            },
          },
        });
        setNewTicketTitle('');
        setNewTicketDescription('');
        setIsAddingTicket(false);
        refetch();
      } catch (error) {
        console.error('Error creating ticket:', error);
      }
    }
  };

  const handleCancelAddTicket = () => {
    setNewTicketTitle('');
    setNewTicketDescription('');
    setIsAddingTicket(false);
  };

  // Sort tickets by position
  const sortedTickets = [...tickets].sort((a, b) => a.position - b.position);

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          className="column"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div className="column-header" {...provided.dragHandleProps}>
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} style={{ flexGrow: 1 }}>
                <input
                  type="text"
                  value={columnTitle}
                  onChange={(e) => setColumnTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="column-title"
                />
              </form>
            ) : (
              <h3 className="column-title" onClick={handleTitleClick}>
                {column.name}
              </h3>
            )}
            
            <div className="column-actions">
              <button
                className="icon-btn"
                onClick={handleTitleClick}
                title="Edit column name"
              >
                <Edit3 size={14} />
              </button>
              <button
                className="icon-btn"
                title="Copy column"
              >
                <Copy size={14} />
              </button>
              <button
                className="icon-btn"
                title="More options"
              >
                <MoreVertical size={14} />
              </button>
              <button
                className="icon-btn danger"
                onClick={handleDeleteColumn}
                title="Delete column"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <Droppable droppableId={column.id} type="ticket">
            {(provided, snapshot) => (
              <div
                className="tickets-container"
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  backgroundColor: snapshot.isDraggingOver ? '#f4f5f7' : 'transparent',
                }}
              >
                {sortedTickets.map((ticket, ticketIndex) => (
                  <Ticket
                    key={ticket.id}
                    ticket={ticket}
                    index={ticketIndex}
                    refetch={refetch}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {isAddingTicket ? (
            <form onSubmit={handleAddTicketSubmit} className="add-form">
              <input
                type="text"
                placeholder="Enter a title for this card..."
                value={newTicketTitle}
                onChange={(e) => setNewTicketTitle(e.target.value)}
                autoFocus
              />
              <textarea
                placeholder="Enter a description..."
                value={newTicketDescription}
                onChange={(e) => setNewTicketDescription(e.target.value)}
              />
              <div className="form-buttons">
                <button type="submit" className="btn-primary">
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={handleCancelAddTicket}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button className="add-ticket-btn" onClick={handleAddTicket}>
              <Plus size={16} />
              Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Column;