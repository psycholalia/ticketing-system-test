import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_TICKET_MUTATION, DELETE_TICKET_MUTATION } from '../graphql/queries';
import { X, Trash2, Edit } from 'lucide-react';

const TicketModal = ({ ticket, onClose, refetch }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);

  const [updateTicket] = useMutation(UPDATE_TICKET_MUTATION);
  const [deleteTicket] = useMutation(DELETE_TICKET_MUTATION);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateTicket({
        variables: {
          input: {
            id: ticket.id,
            title: title.trim(),
            description: description.trim(),
          },
        },
      });
      setIsEditing(false);
      refetch();
      onClose();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket({
          variables: { id: ticket.id },
        });
        refetch();
        onClose();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const handleCancel = () => {
    setTitle(ticket.title);
    setDescription(ticket.description);
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Card' : 'Card Details'}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isEditing && (
              <>
                <button
                  className="close-btn"
                  onClick={handleEdit}
                  title="Edit card"
                >
                  <Edit size={20} />
                </button>
                <button
                  className="close-btn"
                  onClick={handleDelete}
                  title="Delete card"
                  style={{ color: '#de350b' }}
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button className="close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '8px', fontWeight: '600', color: '#172b4d' }}>
                {ticket.title}
              </h3>
            </div>

            {ticket.description && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '8px', fontWeight: '600', color: '#5e6c84' }}>
                  Description
                </h4>
                <p style={{ color: '#172b4d', lineHeight: '1.5' }}>
                  {ticket.description}
                </p>
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#6b778c' }}>
              Created: {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketModal;