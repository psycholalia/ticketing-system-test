import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_MUTATION } from '../graphql/queries';

const BoardModal = ({ onSetBoardId, onClose, refetch }) => {
  const [newBoardName, setNewBoardName] = useState('');

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const [createBoard] = useMutation(CREATE_BOARD_MUTATION);

    const resetBoardName = () => {
        setNewBoardName('')
    }

    const handleSetNewBoard = async (e) => {
        e.preventDefault();
        try {
            const board = await createBoard({
                variables: {
                    input: {
                        name: newBoardName.trim(),
                    }
                },
            });
            // refetch();
            onSetBoardId(board.data.createBoard.id);
            setNewBoardName('');
        } catch (error) {
            console.error('Error creating a new board!:', error);
        }
    };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            Add a Board
          </h2>
          <div className="modal-actions">
            <form onSubmit={handleSetNewBoard} className="add-form">
              <input
                type="text"
                placeholder="Enter a name for this board"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                autoFocus
              />
              <div className="form-buttons">
                <button type="submit" className="btn-primary">
                  Add Board
                </button>
                <button
                  type="button"
                  onClick={resetBoardName}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;