import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PublicRoute = () => {
  const accessToken = localStorage.getItem('accessToken');
  let isAuthenticated = false;

  if (accessToken) {
    try {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000; // Current time in seconds
      if (decodedToken.exp && decodedToken.exp > currentTime) {
        isAuthenticated = true; // Token is valid and not expired
      } else {
        // Clear invalid or expired token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('pendingUser');
      }
    } catch (error) {
      console.error('Invalid token:', error);
      // Clear invalid token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('pendingUser');
    }
  }

  // Redirect authenticated users to the homepage
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the child routes for unauthenticated users
  return <Outlet />;
};

export default PublicRoute;