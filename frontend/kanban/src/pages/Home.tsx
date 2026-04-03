import React, { useEffect, useState } from 'react';
import { boardService, columnService, taskService, userService } from '../lib/kanbanService';

const Home = ({ userId }) => {
  const [dashboards, setDashboards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  
  // Input states mapping specific IDs to input values
  const [newColNames, setNewColNames] = useState({});
  const [newTaskNames, setNewTaskNames] = useState({});
  
  // Editing states tracking which item is currently being edited
  const [editState, setEditState] = useState({ type: null, id: null, name: '' });

  const [showInviteMenu, setShowInviteMenu] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

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

  // --- BOARDS ---
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      await boardService.createBoard(userId, newBoardName);
      setNewBoardName(''); 
      fetchBoards();    
    } catch (err) { alert("Error creating board"); }
  };

  const handleUpdateBoard = async (dashboardId, boardId) => {
    if (!editState.name.trim()) return;
    try {
      await boardService.updateBoard(dashboardId, boardId, editState.name);
      setEditState({ type: null, id: null, name: '' });
      fetchBoards();
    } catch (err) { alert("Error updating board"); }
  };

  const handleDeleteBoard = async (dashboardId, boardId) => {
    if (!window.confirm("Delete this board?")) return;
    try {
      await boardService.deleteBoards(userId, dashboardId, [boardId]);
      fetchBoards();
    } catch (err) { alert("Error deleting board"); }
  };

  // --- COLUMNS ---
  const handleCreateColumn = async (dashboardId, boardId) => {
    const colName = newColNames[boardId];
    if (!colName || !colName.trim()) return;
    try {
      await columnService.createColumn(userId, dashboardId, boardId, colName);
      setNewColNames(prev => ({ ...prev, [boardId]: '' }));
      fetchBoards();
    } catch (err) { alert("Error creating column"); }
  };

  const handleUpdateColumn = async (dashboardId, boardId, columnId) => {
    if (!editState.name.trim()) return;
    try {
      await columnService.updateColumn(dashboardId, boardId, columnId, editState.name);
      setEditState({ type: null, id: null, name: '' });
      fetchBoards();
    } catch (err) { alert("Error updating column"); }
  };

  const handleDeleteColumn = async (dashboardId, boardId, columnId) => {
    if (!window.confirm("Delete this column?")) return;
    try {
      await columnService.deleteColumn(userId, dashboardId, boardId, [columnId]);
      fetchBoards();
    } catch (err) { alert("Error deleting column"); }
  };

  // --- TASKS ---
  const handleCreateTask = async (dashboardId, boardId, columnId) => {
    const taskName = newTaskNames[columnId];
    if (!taskName || !taskName.trim()) return;
    try {
      await taskService.createTask(userId, dashboardId, boardId, columnId, taskName);
      setNewTaskNames(prev => ({ ...prev, [columnId]: '' }));
      fetchBoards();
    } catch (err) { alert("Error creating task"); }
  };

  const handleUpdateTask = async (dashboardId, boardId, columnId, taskId) => {
    if (!editState.name.trim()) return;
    try {
      await taskService.updateTask(dashboardId, boardId, columnId, taskId, editState.name);
      setEditState({ type: null, id: null, name: '' });
      fetchBoards();
    } catch (err) { alert("Error updating task"); }
  };

  const handleDeleteTask = async (dashboardId, boardId, columnId, taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await taskService.deleteTask(userId, dashboardId, boardId, columnId, [taskId]);
      fetchBoards();
    } catch (err) { alert("Error deleting task"); }
  };

  // --- NEW: Invite Logic ---
  const toggleInviteMenu = async () => {
    const willShow = !showInviteMenu;
    setShowInviteMenu(willShow);
    
    // Fetch users only when opening the menu
    if (willShow) {
      try {
        const res = await userService.getAllOtherUsers(userId);
        setAvailableUsers(res.data);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    }
  };

  const handleToggleUserSelection = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSendInvites = async () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one user to invite.");
      return;
    }
    try {
      await userService.inviteUsers(userId, selectedUserIds);
      alert("Users invited successfully!");
      setSelectedUserIds([]); // Clear selections
      setShowInviteMenu(false); // Close menu
      fetchBoards(); // Refresh boards to ensure latest data
    } catch (err) {
      alert("Error sending invites");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  // --- RENDER HELPERS ---
  const startEdit = (type, id, currentName) => {
    setEditState({ type, id, name: currentName });
  };

  return (
    <div style={{ padding: '20px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>My Workspace</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={toggleInviteMenu}>
            {showInviteMenu ? "Close Invite Menu" : "Invite Users"}
          </button>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      {/* --- NEW: Invite Menu UI --- */}
      {showInviteMenu && (
        <div style={{ padding: '15px', border: '1px solid #007bff', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
          <h3>Invite Team Members</h3>
          {availableUsers.length === 0 ? (
            <p>No other users found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', maxHeight: '150px', overflowY: 'auto' }}>
              {availableUsers.map(user => (
                <label key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedUserIds.includes(user._id)}
                    onChange={() => handleToggleUserSelection(user._id)}
                  />
                  {user.email} {/* Assuming your user object has an email field. Change to user.username if applicable */}
                </label>
              ))}
            </div>
          )}
          <button onClick={handleSendInvites} disabled={selectedUserIds.length === 0} style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>
            Send Invites
          </button>
        </div>
      )}
      
      <form onSubmit={handleCreateBoard} style={{ marginBottom: '30px' }}>
        <input 
          value={newBoardName} 
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="New Board Name"
          required
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Create Board</button>
      </form>

      {/* RENDER DASHBOARDS */}
      {dashboards.map(dash => {
        const isOwner = dash.userId === userId;

        return (
          <div key={dash._id} style={{ border: '2px solid #444', borderRadius: '8px', marginBottom: '40px', padding: '20px' }}>
            <h3>{isOwner ? "Personal Dashboard" : "Shared Dashboard"}</h3>
            
            {/* RENDER BOARDS */}
            {dash.todos.map(board => (
              <div key={board._id} style={{ border: '1px solid #ccc', margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5' }}>
                
                {/* Board Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  {editState.type === 'board' && editState.id === board._id ? (
                    <div>
                      <input value={editState.name} onChange={(e) => setEditState({ ...editState, name: e.target.value })} autoFocus/>
                      <button onClick={() => handleUpdateBoard(dash._id, board._id)}>Save</button>
                      <button onClick={() => setEditState({ type: null, id: null, name: '' })}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>Board: {board.boardName}</h4>
                      <button onClick={() => startEdit('board', board._id, board.boardName)}>Edit</button>
                      {isOwner && <button onClick={() => handleDeleteBoard(dash._id, board._id)} style={{ color: 'red' }}>Delete</button>}
                    </div>
                  )}
                </div>

                {/* Create Column Input */}
                <div style={{ marginBottom: '15px' }}>
                  <input 
                    placeholder="New Column Name" 
                    value={newColNames[board._id] || ''} 
                    onChange={(e) => setNewColNames(prev => ({ ...prev, [board._id]: e.target.value }))}
                  />
                  <button onClick={() => handleCreateColumn(dash._id, board._id)}>Add Column</button>
                </div>

                {/* RENDER COLUMNS (Horizontal Layout) */}
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {board.columns?.map(col => (
                    <div key={col._id} style={{ minWidth: '250px', backgroundColor: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                      
                      {/* Column Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                        {editState.type === 'column' && editState.id === col._id ? (
                          <div>
                            <input value={editState.name} onChange={(e) => setEditState({ ...editState, name: e.target.value })} style={{ width: '100px' }} autoFocus/>
                            <button onClick={() => handleUpdateColumn(dash._id, board._id, col._id)}>✓</button>
                            <button onClick={() => setEditState({ type: null, id: null, name: '' })}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '5px', width: '100%', justifyContent: 'space-between' }}>
                            <strong>{col.columnName}</strong>
                            <div>
                              <button onClick={() => startEdit('column', col._id, col.columnName)} style={{ fontSize: '12px' }}>✎</button>
                              {isOwner && <button onClick={() => handleDeleteColumn(dash._id, board._id, col._id)} style={{ color: 'red', fontSize: '12px' }}>✗</button>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* RENDER TASKS */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                        {col.tasks?.map(task => (
                          <div key={task._id} style={{ backgroundColor: '#e9ecef', padding: '8px', borderRadius: '4px', fontSize: '14px' }}>
                            {editState.type === 'task' && editState.id === task._id ? (
                              <div>
                                <input value={editState.name} onChange={(e) => setEditState({ ...editState, name: e.target.value })} style={{ width: '90%' }} autoFocus/>
                                <button onClick={() => handleUpdateTask(dash._id, board._id, col._id, task._id)}>✓</button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{task.taskName}</span>
                                <div>
                                  <button onClick={() => startEdit('task', task._id, task.taskName)} style={{ fontSize: '10px' }}>✎</button>
                                  {isOwner && <button onClick={() => handleDeleteTask(dash._id, board._id, col._id, task._id)} style={{ color: 'red', fontSize: '10px' }}>✗</button>}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Create Task Input */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <input 
                          placeholder="New Task" 
                          value={newTaskNames[col._id] || ''} 
                          onChange={(e) => setNewTaskNames(prev => ({ ...prev, [col._id]: e.target.value }))}
                          style={{ padding: '5px' }}
                        />
                        <button onClick={() => handleCreateTask(dash._id, board._id, col._id)}>Add Task</button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default Home;