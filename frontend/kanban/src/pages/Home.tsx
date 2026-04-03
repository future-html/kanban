import React, { useEffect, useState } from 'react';
import { boardService } from '../lib/boardService';
const Home = ({ userId }) => {
  const [dashboards, setDashboards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  
  // State to manage inline editing
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState('');

  // --- API CALLS USING boardService ---

  const fetchBoards = async () => {
    try {
      const res = await boardService.getBoards(userId);
      setDashboards(res.data);
    } catch (err) {
      console.error("Error fetching boards", err);
    }
  };

  useEffect(() => {
    if (userId) fetchBoards();
  }, [userId]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      // Using the service method
      await boardService.createBoard(userId, newBoardName);
      setNewBoardName(''); 
      fetchBoards();    
    } catch (err) {
      alert("Error creating board");
    }
  };

  const handleUpdateBoard = async (dashboardId, boardId) => {
    if (!editBoardName.trim()) return;
    try {
      // Using the service method
      await boardService.updateBoard(dashboardId, boardId, editBoardName);
      setEditingBoardId(null); // Exit edit mode
      fetchBoards(); // Refresh data
    } catch (err) {
      alert("Error updating board");
    }
  };

  const handleDeleteBoard = async (dashboardId, boardId) => {
    if (!window.confirm("Are you sure you want to delete this board?")) return;
    
    try {
      // Using the service method (passing boardId as an array)
      await boardService.deleteBoards(userId, dashboardId, [boardId]);
      fetchBoards(); // Refresh data
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert("You are not authorized to delete this board.");
      } else {
        alert("Error deleting board");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  // --- RENDER ---

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>My Boards</h2>
        <button onClick={handleLogout}>Log Out</button>
      </header>

      {/* Create Board Form */}
      <form onSubmit={handleCreateBoard} style={{ marginBottom: '30px' }}>
        <input 
          value={newBoardName} 
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="New Board Name"
          required
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Add Board</button>
      </form>

      {/* List Dashboards & Boards */}
      <div>
        {dashboards.map(dash => {
          const isOwner = dash.userId === userId;

          return (
            <div key={dash._id} style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', padding: '15px' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>
                {isOwner ? "Personal Workspace" : "Shared Workspace"}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dash.todos.map(board => (
                  <div key={board._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    
                    {/* EDIT MODE UI */}
                    {editingBoardId === board._id ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          value={editBoardName}
                          onChange={(e) => setEditBoardName(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => handleUpdateBoard(dash._id, board._id)}>Save</button>
                        <button onClick={() => setEditingBoardId(null)}>Cancel</button>
                      </div>
                    ) : (
                      /* NORMAL VIEW MODE UI */
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <strong style={{ alignSelf: 'center' }}>{board.boardName}</strong>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => {
                            setEditingBoardId(board._id);
                            setEditBoardName(board.boardName);
                          }}>
                            Edit
                          </button>
                          
                          {/* Only show delete button if the user is the owner */}
                          {isOwner && (
                            <button 
                              onClick={() => handleDeleteBoard(dash._id, board._id)}
                              style={{ color: 'red' }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;