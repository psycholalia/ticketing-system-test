import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { useMutation } from '@apollo/client';
import Column from './Column';
import { UPDATE_BOARD_MUTATION, CREATE_COLUMN_MUTATION } from '../graphql/queries';
import { Plus } from 'lucide-react';

const Board = ({ board, columns, tickets, refetch }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState(board?.name || '');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const [updateBoard] = useMutation(UPDATE_BOARD_MUTATION);
  const [createColumn] = useMutation(CREATE_COLUMN_MUTATION);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    if (boardTitle.trim()) {
      try {
        await updateBoard({
          variables: { id: board.id, name: boardTitle.trim() }
        });
        setIsEditingTitle(false);
        refetch();
      } catch (error) {
        console.error('Error updating board title:', error);
      }
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setBoardTitle(board?.name || '');
      setIsEditingTitle(false);
    }
  };

  const handleAddColumn = () => {
    setIsAddingColumn(true);
  };

  const handleAddColumnSubmit = async (e) => {
    e.preventDefault();
    if (newColumnName.trim()) {
      try {
        const nextPosition = columns.length;
        await createColumn({
          variables: {
            input: {
              boardId: board.id,
              name: newColumnName.trim(),
              position: nextPosition,
            },
          },
        });
        setNewColumnName('');
        setIsAddingColumn(false);
        refetch();
      } catch (error) {
        console.error('Error creating column:', error);
      }
    }
  };

  const handleCancelAddColumn = () => {
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  // Sort columns by position
  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  return (
    <div>
      <div className="board-header">
        <div className="board-title-section">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="board-title"
              />
            </form>
          ) : (
            <h1 className="board-title" onClick={handleTitleClick}>
              {board?.name}
            </h1>
          )}
        </div>
      </div>

      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <div
            className="columns-container"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {sortedColumns.map((column, index) => (
              <Column
                key={column.id}
                column={column}
                tickets={tickets.filter(ticket => ticket.columnId === column.id)}
                index={index}
                refetch={refetch}
              />
            ))}
            {provided.placeholder}
            
            {isAddingColumn ? (
              <div className="column">
                <form onSubmit={handleAddColumnSubmit} className="add-form">
                  <input
                    type="text"
                    placeholder="Enter column name..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    autoFocus
                  />
                  <div className="form-buttons">
                    <button type="submit" className="btn-primary">
                      Add Column
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddColumn}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button className="add-column-btn" onClick={handleAddColumn}>
                <Plus size={20} />
                Add another column
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Board;