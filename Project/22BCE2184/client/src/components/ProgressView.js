/**
 * ProgressView Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: Analytics dashboard for habit progress tracking and visualization
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/ProgressView.css';

const ProgressView = ({ user }) => {
  const [stats, setStats] = useState({});
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completionCalendar, setCompletionCalendar] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('habitTracker_token');
      console.log('⏳ Fetching progress data...');
      
      // Fetch overall stats
      const statsResponse = await fetch('/api/v1/completions/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        console.log('📊 Stats data:', data);
        // Extract stats directly from response
        setStats({
          totalHabitsCompleted: data.totalCompletions || 0,
          completionRate: data.completionRate || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.currentGlobalStreak || 0
        });
      }

      // Fetch weekly progress
      const weeklyResponse = await fetch('/api/v1/completions/weekly-progress', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (weeklyResponse.ok) {
        const data = await weeklyResponse.json();
        console.log('📈 Weekly progress data:', data);
        setWeeklyProgress(data.progress || []);
      } else {
        console.error('Failed to fetch weekly progress:', await weeklyResponse.text());
      }

      // Fetch habits for individual tracking
      const habitsResponse = await fetch('/api/v1/habits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (habitsResponse.ok) {
        const data = await habitsResponse.json();
        console.log('🎯 Habits data:', data);
        
        // Calculate completion rate for each habit if not provided
        const habitsWithRates = (data.habits || []).map(habit => ({
          ...habit,
          completionRate: habit.completionRate || 
            (habit.totalCompletions > 0 ? 
              Math.round((habit.currentStreak / habit.totalCompletions) * 100) : 0)
        }));
        
        setHabits(habitsWithRates);
      } else {
        console.error('Failed to fetch habits:', await habitsResponse.text());
      }

      // Fetch completion calendar data
      const calendarResponse = await fetch('/api/v1/completions/calendar', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (calendarResponse.ok) {
        const data = await calendarResponse.json();
        console.log('📅 Calendar data:', data);
        setCompletionCalendar(data.completions || []);
      } else {
        console.error('Failed to fetch calendar:', await calendarResponse.text());
      }

    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getTileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const completion = completionCalendar.find(c => c.date === dateStr);
    
    if (!completion) return '';
    
    const rate = completion.completionRate;
    if (rate >= 80) return 'high-completion';
    if (rate >= 50) return 'medium-completion';
    if (rate > 0) return 'low-completion';
    return '';
  };

  const formatStreakText = (streak) => {
    if (streak === 0) return 'No streak';
    if (streak === 1) return '1 day';
    return `${streak} days`;
  };

  if (loading) {
    return (
      <div className="progress-loading">
        <div className="loading-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="progress-header">
        <div className="header-content">
          <h1>Your Progress</h1>
          <p>Track your habit-building journey</p>
        </div>
        <Link to="/dashboard" className="back-btn">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="overview-stats">
        <div className="stat-card large">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h2>{stats.totalCompletions || 0}</h2>
            <p>Total Completions</p>
          </div>
        </div>
        
        <div className="stat-card large">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h2>{formatStreakText(stats.longestStreak || 0)}</h2>
            <p>Longest Streak</p>
          </div>
        </div>
        
        <div className="stat-card large">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h2>{stats.averageCompletionRate || 0}%</h2>
            <p>Average Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="chart-section">
        <h2>Weekly Progress</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#667eea" />
              <Bar dataKey="total" fill="#e0e7ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Calendar */}
      <div className="calendar-section">
        <h2>Completion Calendar</h2>
        <div className="calendar-container">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={getTileClassName}
            className="completion-calendar"
          />
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color high-completion"></div>
              <span>80-100% completion</span>
            </div>
            <div className="legend-item">
              <div className="legend-color medium-completion"></div>
              <span>50-79% completion</span>
            </div>
            <div className="legend-item">
              <div className="legend-color low-completion"></div>
              <span>1-49% completion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Habit Progress */}
      <div className="habits-progress">
        <h2>Individual Habit Progress</h2>
        <div className="habits-grid">
          {habits.map((habit) => (
            <div key={habit._id} className="habit-progress-card">
              <div className="habit-header">
                <span className="habit-icon">{habit.icon || '📋'}</span>
                <div className="habit-info">
                  <h3>{habit.name}</h3>
                  <p>{habit.category}</p>
                </div>
              </div>
              
              <div className="habit-stats">
                <div className="stat-row">
                  <span>Current Streak:</span>
                  <span className="stat-value">{formatStreakText(habit.currentStreak || 0)}</span>
                </div>
                <div className="stat-row">
                  <span>Best Streak:</span>
                  <span className="stat-value">{formatStreakText(habit.longestStreak || 0)}</span>
                </div>
                <div className="stat-row">
                  <span>Completion Rate:</span>
                  <span className="stat-value">{habit.completionRate || 0}%</span>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${habit.completionRate || 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h2>Achievements</h2>
        <div className="achievements-grid">
          <div className={`achievement-card ${stats.totalHabitsCompleted >= 10 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🌟</div>
            <h3>Getting Started</h3>
            <p>Complete 10 habits</p>
            <span className="achievement-progress">{Math.min(stats.totalHabitsCompleted || 0, 10)}/10</span>
          </div>
          
          <div className={`achievement-card ${stats.longestStreak >= 7 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🔥</div>
            <h3>Week Warrior</h3>
            <p>Maintain a 7-day streak</p>
            <span className="achievement-progress">{Math.min(stats.longestStreak || 0, 7)}/7</span>
          </div>
          
          <div className={`achievement-card ${stats.totalHabitsCompleted >= 100 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">💯</div>
            <h3>Centurion</h3>
            <p>Complete 100 habits</p>
            <span className="achievement-progress">{Math.min(stats.totalHabitsCompleted || 0, 100)}/100</span>
          </div>
          
          <div className={`achievement-card ${stats.longestStreak >= 30 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🏆</div>
            <h3>Monthly Master</h3>
            <p>Maintain a 30-day streak</p>
            <span className="achievement-progress">{Math.min(stats.longestStreak || 0, 30)}/30</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
