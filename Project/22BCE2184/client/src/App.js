/**
 * App Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: Main application component with routing and authentication
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Import new components
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import HabitForm from './components/HabitForm';
import ProgressView from './components/ProgressView';
import SettingsView from './components/SettingsView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user session on app load
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const token = localStorage.getItem('habitTracker_token');
        const savedUser = localStorage.getItem('habitTracker_user');
        
        if (token && savedUser) {
          // Verify token is not expired
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenPayload.exp > currentTime) {
            setUser(JSON.parse(savedUser));
          } else {
            // Token expired, clear storage
            localStorage.removeItem('habitTracker_token');
            localStorage.removeItem('habitTracker_user');
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        localStorage.removeItem('habitTracker_token');
        localStorage.removeItem('habitTracker_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('habitTracker_user', JSON.stringify(userData));
    localStorage.setItem('habitTracker_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('habitTracker_user');
    localStorage.removeItem('habitTracker_token');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Habit Tracker...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <Signup onSignup={handleLogin} />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/habits/new" 
            element={
              <ProtectedRoute user={user}>
                <HabitForm user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/habits/edit/:id" 
            element={
              <ProtectedRoute user={user}>
                <HabitForm user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute user={user}>
                <ProgressView user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute user={user}>
                <SettingsView user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
