/**
 * Dashboard Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: Main dashboard for viewing and managing daily habits
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../styles/Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [habits, setHabits] = useState([]);
  const [todayCompletions, setTodayCompletions] = useState([]);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('habitTracker_token');
      
      if (!token) {
        toast.error('Authentication token missing');
        return;
      }
      
      console.log('Fetching dashboard data with token:', token);
      
      // Fetch today's habits with completion status
      const habitsResponse = await fetch('/api/v1/habits/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (habitsResponse.ok) {
        const habitsData = await habitsResponse.json();
        console.log('Habits data:', habitsData);
        setHabits(habitsData.habits || []);
      } else {
        console.error('Failed to fetch habits:', await habitsResponse.text());
      }
      
      // Fetch today's completion data
      const completionsResponse = await fetch('/api/v1/completions/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (completionsResponse.ok) {
        const completionsData = await completionsResponse.json();
        console.log('Completions data:', completionsData);
        setTodayCompletions(completionsData.completions || []);
      } else {
        console.error('Failed to fetch completions:', await completionsResponse.text());
      }
      
      // Fetch user stats
      const statsResponse = await fetch('/api/v1/completions/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Stats API Response:', statsData); // Debug logging
        
        // Make sure we have fallback values for all stats
        setStats({
          totalHabits: statsData.totalHabits || 0,
          completedToday: statsData.completedToday || 0,
          currentStreak: statsData.currentStreak || 0,
          completionRate: statsData.completionRate || 0,
          totalCompletions: statsData.totalCompletions || 0,
          longestStreak: statsData.longestStreak || 0
        });
        
        // Also log what we're setting for debugging
        console.log('Setting stats:', {
          totalHabits: statsData.totalHabits || 0,
          completedToday: statsData.completedToday || 0,
          currentStreak: statsData.currentStreak || 0,
          completionRate: statsData.completionRate || 0,
          totalCompletions: statsData.totalCompletions || 0,
          longestStreak: statsData.longestStreak || 0
        });
      } else {
        console.error('Failed to fetch stats:', await statsResponse.text());
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitCompletion = async (habitId, isCompleted) => {
    try {
      const token = localStorage.getItem('habitTracker_token');
      const url = isCompleted 
        ? `/api/v1/completions/${habitId}/uncomplete`
        : `/api/v1/completions/${habitId}/complete`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success(isCompleted ? 'Habit marked as incomplete' : 'Habit completed!');
        fetchDashboardData(); // Refresh data
      } else {
        toast.error('Failed to update habit');
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your habits...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-welcome">
            <h1>Welcome back, {user.firstname}!</h1>
            <p>{formatDate(new Date())}</p>
          </div>
          <div className="header-actions">
            <Link to="/habits/new" className="btn btn-primary">
              + Add Habit
            </Link>
            <Link to="/progress" className="btn btn-secondary">
              View Progress
            </Link>
            <button onClick={onLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>{stats.totalHabits}</h3>
            <p>Total Habits</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.completedToday}</h3>
            <p>Completed Today</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h3>{stats.currentStreak}</h3>
            <p>Current Streak</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.completionRate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="habits-section">
        <div className="section-header">
          <h2>Today's Habits</h2>
          <Link to="/habits/new" className="add-habit-link">
            + Add New Habit
          </Link>
        </div>

        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No habits yet</h3>
            <p>Start building better habits by creating your first habit tracker.</p>
            <Link to="/habits/new" className="btn btn-primary">
              Create Your First Habit
            </Link>
          </div>
        ) : (
          <div className="habits-grid">
            {habits.map((habit) => (
              <div key={habit._id} className="habit-card">
                <div className="habit-header">
                  <div className="habit-icon">{habit.icon || '📋'}</div>
                  <div className="habit-info">
                    <h3>{habit.name}</h3>
                    <p className="habit-category">{habit.category}</p>
                  </div>
                  <div className="habit-frequency">
                    <span className={`frequency-badge ${habit.frequency && habit.frequency.type ? habit.frequency.type : 'daily'}`}>
                      {habit.frequency && habit.frequency.type ? habit.frequency.type.charAt(0).toUpperCase() + habit.frequency.type.slice(1) : 'Daily'}
                    </span>
                  </div>
                </div>
                
                <div className="habit-description">
                  <p>{habit.description}</p>
                </div>
                
                <div className="habit-progress">
                  <div className="progress-info">
                    <span>Current Streak: {habit.currentStreak || 0} days</span>
                    <span>Best Streak: {habit.longestStreak || 0} days</span>
                  </div>
                </div>
                
                <div className="habit-actions">
                  <button
                    className={`completion-btn ${habit.completedToday ? 'completed' : ''}`}
                    onClick={() => toggleHabitCompletion(habit._id, habit.completedToday)}
                  >
                    {habit.completedToday ? '✅ Completed' : '⭕ Mark Complete'}
                  </button>
                  
                  <Link to={`/habits/edit/${habit._id}`} className="edit-btn">
                    ✏️ Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/progress" className="action-card">
            <div className="action-icon">📈</div>
            <h3>View Progress</h3>
            <p>Check your habit analytics and trends</p>
          </Link>
          
          <Link to="/settings" className="action-card">
            <div className="action-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Customize your profile and preferences</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
