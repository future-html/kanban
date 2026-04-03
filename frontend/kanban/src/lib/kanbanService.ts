import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Adjust if needed

// --- BOARD SERVICE ---
export const boardService = {
  getBoards: (userId) => 
    axios.get(`${API_BASE_URL}/board`, { params: { userId } }),
  createBoard: (userId, boardName, dashboardId = null) => 
    axios.post(`${API_BASE_URL}/board`, { userId, boardName, dashboardId }),
  updateBoard: (dashboardId, boardId, newName) => 
    axios.put(`${API_BASE_URL}/board`, { dashboardId, boardId, newValueOfBoardName: newName }),
  deleteBoards: (userId, dashboardId, boardIds) => 
    axios.delete(`${API_BASE_URL}/board`, { data: { userId, dashboardId, boardId: boardIds } })
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
    // Added boardId to payload because your backend needs it for array_filters
    axios.delete(`${API_BASE_URL}/board/task`, { data: { userId, dashboardId, boardId, columnId, taskId: taskIds } })
};

export const userService = {
  // Get all users except the current owner
  getAllOtherUsers: (ownerId) => 
    axios.get(`${API_BASE_URL}/user`, { params: { ownerId } }),

  // Invite selected users to the owner's dashboard
  inviteUsers: (ownerId, memberIds) => 
    axios.post(`${API_BASE_URL}/user/invite`, { ownerId, memberId: memberIds })
};