import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useQuery, useMutation } from '@apollo/client';
import Board from './components/Board';
import { GET_BOARD_DATA, UPDATE_TICKET_MUTATION, UPDATE_COLUMN_MUTATION } from './graphql/queries';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [boardId] = useState('default-board');
  
  const { loading, error, data, refetch } = useQuery(GET_BOARD_DATA, {
    variables: { boardId },
    pollInterval: 5000, // Poll every 5 seconds for updates
  });

  const [updateTicket] = useMutation(UPDATE_TICKET_MUTATION);
  const [updateColumn] = useMutation(UPDATE_COLUMN_MUTATION);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'column') {
      // Handle column reordering
      const columns = Array.from(data.columns);
      const [reorderedColumn] = columns.splice(source.index, 1);
      columns.splice(destination.index, 0, reorderedColumn);

      // Update positions for all affected columns
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].position !== i) {
          await updateColumn({
            variables: {
              input: {
                id: columns[i].id,
                position: i,
              },
            },
          });
        }
      }
    } else {
      // Handle ticket reordering
      const sourceColumn = data.columns.find(col => col.id === source.droppableId);
      const destColumn = data.columns.find(col => col.id === destination.droppableId);
      
      if (sourceColumn.id === destColumn.id) {
        // Same column reordering
        const tickets = data.tickets.filter(ticket => ticket.column_id === sourceColumn.id);
        const sortedTickets = tickets.sort((a, b) => a.position - b.position);
        const [reorderedTicket] = sortedTickets.splice(source.index, 1);
        sortedTickets.splice(destination.index, 0, reorderedTicket);

        // Update positions
        for (let i = 0; i < sortedTickets.length; i++) {
          if (sortedTickets[i].position !== i) {
            await updateTicket({
              variables: {
                input: {
                  id: sortedTickets[i].id,
                  position: i,
                },
              },
            });
          }
        }
      } else {
        // Moving between columns
        const destTickets = data.tickets.filter(ticket => ticket.column_id === destColumn.id);
        const newPosition = destination.index;

        await updateTicket({
          variables: {
            input: {
              id: draggableId,
              column_id: destination.droppableId,
              position: newPosition,
            },
          },
        });

        // Update positions in destination column
        destTickets.sort((a, b) => a.position - b.position);
        for (let i = newPosition; i < destTickets.length; i++) {
          await updateTicket({
            variables: {
              input: {
                id: destTickets[i].id,
                position: i + 1,
              },
            },
          });
        }
      }
    }

    refetch();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board-container">
        <Board 
          board={data.board}
          columns={data.columns}
          tickets={data.tickets}
          refetch={refetch}
        />
      </div>
    </DragDropContext>
  );
}

export default App;