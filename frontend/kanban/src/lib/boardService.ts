import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Adjust to your Flask port

export const boardService = {
  // Get all dashboards/boards for a user
  getBoards: (userId) => 
    axios.get(`${API_BASE_URL}/board`, { params: { userId } }),

  // Create a new board
  createBoard: (userId, boardName, dashboardId = null) => 
    axios.post(`${API_BASE_URL}/board`, { userId, boardName, dashboardId }),

  // Invite users to your dashboard
  inviteUsers: (ownerId, memberIds) => 
    axios.post(`${API_BASE_URL}/user/invite`, { ownerId, memberId: memberIds }),

  // Update a board's name
  updateBoard: (dashboardId, boardId, newName) => 
    axios.put(`${API_BASE_URL}/board`, {
      dashboardId: dashboardId,
      boardId: boardId,
      newValueOfBoardName: newName
    }),

  // Delete boards (requires userId for ownership check)
  deleteBoards: (userId, dashboardId, boardIds) => 
    axios.delete(`${API_BASE_URL}/board`, { 
      data: { userId, dashboardId, boardId: boardIds } 
    })
};