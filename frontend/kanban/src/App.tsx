import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import Home from './pages/Home';

// 🔒 PROTECTED: Only logged-in users can enter
const PrivateRoutes = ({ userId }) => {
  return userId ? <Outlet /> : <Navigate to="/login" replace />;
};

// 🚫 GUEST ONLY: Logged-in users should be redirected to Home if they try to visit Login/Signup
const PublicRoutes = ({ userId }) => {
  return !userId ? <Outlet /> : <Navigate to="/" replace />;
};

export default function App() {
  // Pulling directly from localStorage to ensure state persists on refresh
 // We check localStorage inside the component body
  const [userId, setUserId] = useState(() => {
    const userJson = localStorage.getItem('userInfo');
    const user = userJson ? JSON.parse(userJson) : null;
    return user ? user.id : null;
  });

  return (
    <Routes>
      {/* --- GUEST ROUTES --- */}
      <Route element={<PublicRoutes userId={userId} />}>
        <Route path="/login" element={<Login setAuth={setUserId}/>} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* --- PRIVATE ROUTES --- */}
      <Route element={<PrivateRoutes userId={userId} />}>
        <Route path="/" element={<Home userId={userId} />} />
        {/* Add more protected pages here like /profile or /settings */}
      </Route>

      {/* --- CATCH ALL --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}