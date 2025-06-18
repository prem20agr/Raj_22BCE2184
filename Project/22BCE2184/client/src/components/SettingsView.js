/**
 * SettingsView Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: User settings and profile management component with preferences
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../styles/SettingsView.css';

const SettingsView = ({ user, onLogout }) => {
  const [profileData, setProfileData] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || '',
    username: user.username || '',
    timezone: user.timezone || 'Asia/Kolkata',
    preferences: {
      theme: user.preferences?.theme || 'light',
      notifications: user.preferences?.notifications || true,
      weekStartsOn: user.preferences?.weekStartsOn || 'Monday'
    },
    streakGoals: {
      daily: user.streakGoals?.daily || 3,
      weekly: user.streakGoals?.weekly || 21,
      monthly: user.streakGoals?.monthly || 90
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('habitTracker_token');
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Profile updated successfully!');
        
        // Update localStorage with new user data
        localStorage.setItem('habitTracker_user', JSON.stringify(data.user));
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    console.log('Password change submit initiated');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('habitTracker_token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Sending password change request to API...');
      // Use relative URL to work with the proxy setting
      const apiUrl = '/api/v1/users/change-password';
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      console.log('Password change response status:', response.status);
      
      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const data = await response.json().catch(e => ({ error: 'Invalid JSON response' }));
        console.error('Password change error response:', data);
        toast.error(data.error || data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(`Failed to change password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action can be reversed by contacting support.')) {
      return;
    }

    try {
      const token = localStorage.getItem('habitTracker_token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Authentication error. Please log in again.');
        return;
      }
      
      console.log('Sending account deactivation request to API...');
      const apiUrl = '/api/v1/users/deactivate';
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      console.log('Deactivation response status:', response.status);

      if (response.ok) {
        toast.success('Account deactivated successfully');
        onLogout();
      } else {
        const data = await response.json().catch(e => ({ error: 'Invalid JSON response' }));
        console.error('Account deactivation error response:', data);
        toast.error(data.error || data.message || 'Failed to deactivate account');
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error(`Failed to deactivate account: ${error.message}`);
    }
  };

  const timezones = [
    'Asia/Kolkata',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Manage your profile and preferences</p>
        </div>
        <Link to="/dashboard" className="back-btn">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="settings-content">
        <div className="settings-nav">
          <button
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`nav-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferences
          </button>
          <button
            className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
          <button
            className={`nav-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            🗑️ Account
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <h2>Profile Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstname">First Name</label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={profileData.firstname}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastname">Last Name</label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={profileData.lastname}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  name="timezone"
                  value={profileData.timezone}
                  onChange={handleProfileChange}
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <h2>App Preferences</h2>
              
              <div className="form-group">
                <label htmlFor="preferences.theme">Theme</label>
                <select
                  id="preferences.theme"
                  name="preferences.theme"
                  value={profileData.preferences.theme}
                  onChange={handleProfileChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preferences.weekStartsOn">Week Starts On</label>
                <select
                  id="preferences.weekStartsOn"
                  name="preferences.weekStartsOn"
                  value={profileData.preferences.weekStartsOn}
                  onChange={handleProfileChange}
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="preferences.notifications"
                    checked={profileData.preferences.notifications}
                    onChange={handleProfileChange}
                  />
                  Enable notifications
                </label>
              </div>

              <h3>Streak Goals</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="streakGoals.daily">Daily Goal</label>
                  <input
                    type="number"
                    id="streakGoals.daily"
                    name="streakGoals.daily"
                    value={profileData.streakGoals.daily}
                    onChange={handleProfileChange}
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="streakGoals.weekly">Weekly Goal</label>
                  <input
                    type="number"
                    id="streakGoals.weekly"
                    name="streakGoals.weekly"
                    value={profileData.streakGoals.weekly}
                    onChange={handleProfileChange}
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="streakGoals.monthly">Monthly Goal</label>
                  <input
                    type="number"
                    id="streakGoals.monthly"
                    name="streakGoals.monthly"
                    value={profileData.streakGoals.monthly}
                    onChange={handleProfileChange}
                    min="1"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <h2>Change Password</h2>
              
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="settings-form">
              <h2>Account Management</h2>
              
              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>These actions cannot be undone. Please be careful.</p>
                
                <button 
                  onClick={handleDeactivateAccount}
                  className="btn btn-danger"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
