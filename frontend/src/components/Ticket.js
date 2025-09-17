import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import TicketModal from './TicketModal';
import { Edit3, Clock } from 'lucide-react';

const Ticket = ({ ticket, index, refetch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTicketClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Draggable draggableId={ticket.id} index={index}>
        {(provided, snapshot) => (
          <div
            className="ticket"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            onClick={handleTicketClick}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.8 : 1,
              transform: snapshot.isDragging
                ? `${provided.draggableProps.style?.transform} rotate(5deg)`
                : provided.draggableProps.style?.transform,
            }}
          >
            <div className="ticket-title">{ticket.title}</div>
            {ticket.description && (
              <div className="ticket-description">{ticket.description}</div>
            )}
            
            <div className="ticket-meta">
              <div className="ticket-date">
                <Clock size={12} />
                {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
              <div className="ticket-actions">
                <button
                  className="icon-btn btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTicketClick();
                  }}
                  title="Edit ticket"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {isModalOpen && (
        <TicketModal
          ticket={ticket}
          onClose={handleCloseModal}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default Ticket;