/**
 * Login Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: User authentication form component for habit tracking system
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../styles/Auth.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful! Token:', data.token);
        toast.success('Login successful!');
        // Make sure the token is properly saved
        localStorage.setItem('habitTracker_token', data.token);
        onLogin(data.user, data.token);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue tracking your habits</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-side">
        <div className="auth-side-content">
          <h2>Track Your Progress</h2>
          <p>Build lasting habits with our comprehensive tracking system</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-icon">📈</span>
              <span>Progress Analytics</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">🔥</span>
              <span>Streak Tracking</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">🎯</span>
              <span>Goal Achievement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
