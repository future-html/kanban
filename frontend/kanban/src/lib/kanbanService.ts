import axios from 'axios';

// IMPORTANT: Ensure this matches your Flask backend port (usually 5000, not 3000)
const API_BASE_URL = 'http://localhost:3000'; 

// --- BOARD SERVICE ---
export const boardService = {
  getBoards: (userId) => 
    axios.get(`${API_BASE_URL}/board`, { params: { userId } }),
  createBoard: (userId, boardName, dashboardId = null) => 
    axios.post(`${API_BASE_URL}/board`, { userId, boardName, dashboardId }),
  updateBoard: (dashboardId, boardId, newName) => 
    axios.put(`${API_BASE_URL}/board`, { dashboardId, boardId, newValueOfBoardName: newName }),
  deleteBoards: (userId, dashboardId, boardIds) => 
    axios.delete(`${API_BASE_URL}/board`, { data: { userId, dashboardId, boardId: boardIds } }),
    
  // NEW: Get users who can be assigned to tasks on a specific dashboard
  getAssignableMembers: (dashboardId) => 
    axios.get(`${API_BASE_URL}/board/members`, { params: { dashboardId } })
};

// --- COLUMN SERVICE ---
export const columnService = {
  createColumn: (userId, dashboardId, boardId, columnName) => 
    axios.post(`${API_BASE_URL}/board/column`, { userId, dashboardId, boardId, columnName }),
  updateColumn: (dashboardId, boardId, columnId, newName) => 
    axios.put(`${API_BASE_URL}/board/column`, { dashboardId, boardId, columnId, newValueOfColumnName: newName }),
  deleteColumn: (userId, dashboardId, boardId, columnIds) => 
    axios.delete(`${API_BASE_URL}/board/column`, { data: { userId, dashboardId, boardId, columnId: columnIds } })
};

// --- TASK SERVICE ---
export const taskService = {
  createTask: (userId, dashboardId, boardId, columnId, taskName) => 
    axios.post(`${API_BASE_URL}/board/task`, { userId, dashboardId, boardId, columnId, taskName }),
  updateTask: (dashboardId, boardId, columnId, taskId, newName) => 
    axios.put(`${API_BASE_URL}/board/task`, { dashboardId, boardId, columnId, taskId, newValueOfTaskName: newName }),
  deleteTask: (userId, dashboardId, boardId, columnId, taskIds) => 
    axios.delete(`${API_BASE_URL}/board/task`, { data: { userId, dashboardId, boardId, columnId, taskId: taskIds } }),
    
  // NEW: Assign a task to a user
  assignTask: (dashboardId, boardId, columnId, taskId, assigneeId) => 
    axios.put(`${API_BASE_URL}/board/task/assign`, { dashboardId, boardId, columnId, taskId, assigneeId })
};

// --- USER SERVICE ---
export const userService = {
  getAllOtherUsers: (ownerId) => 
    axios.get(`${API_BASE_URL}/user`, { params: { ownerId } }),
  inviteUsers: (ownerId, memberIds) => 
    axios.post(`${API_BASE_URL}/user/invite`, { ownerId, memberId: memberIds })
};