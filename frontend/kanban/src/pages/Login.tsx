import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Note: Make sure your Flask backend is running on 5000, 
      // your snippet says 3000, which is usually the React port!
      const response = await axios.post('http://localhost:3000/login', formData);

      const { userInfo } = response.data;

      // 1. Save to local storage for future visits
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
     
      // 2. Update React's state in App.js to unlock the PrivateRoutes
      setAuth(userInfo.id);

      // 3. Now navigate will work perfectly
      navigate('/');

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Network error. Is the backend running?');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Login Page</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};