/**
 * HabitForm Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: Form component for creating and editing habits with customization options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const HabitForm = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Health',
    frequency: 'daily',
    icon: '📋',
    color: '#667eea',
    target: 1,
    reminder: {
      enabled: false,
      time: '09:00'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchHabit();
    }
  }, [id, isEditing]);

  const fetchHabit = async () => {
    try {
      const token = localStorage.getItem('habitTracker_token');
      const response = await fetch(`/api/v1/habits/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data.habit);
      } else {
        toast.error('Failed to fetch habit');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching habit:', error);
      toast.error('Failed to fetch habit');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('habitTracker_token');
      const url = isEditing ? `/api/v1/habits/${id}` : '/api/v1/habits';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(isEditing ? 'Habit updated!' : 'Habit created!');
        navigate('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save habit');
      }
    } catch (error) {
      console.error('Error saving habit:', error);
      toast.error('Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const categories = ['Health', 'Fitness', 'Learning', 'Work', 'Personal', 'Social', 'Hobbies'];
  const frequencies = ['daily', 'weekly', 'custom'];
  const icons = ['📋', '💧', '📖', '🏃', '🧘', '💻', '🎨', '🎵', '🍎', '💪'];

  return (
    <div className="habit-form-container">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Habit' : 'Create New Habit'}</h1>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="habit-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Habit Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Drink 8 glasses of water"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe your habit and why it's important to you"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Customization</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Icon</label>
              <div className="icon-grid">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-btn ${formData.icon === icon ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="target">Daily Target</label>
            <input
              type="number"
              id="target"
              name="target"
              value={formData.target}
              onChange={handleChange}
              min="1"
              placeholder="1"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Reminder Settings</h2>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="reminder.enabled"
                checked={formData.reminder.enabled}
                onChange={handleChange}
              />
              Enable daily reminders
            </label>
          </div>

          {formData.reminder.enabled && (
            <div className="form-group">
              <label htmlFor="reminder.time">Reminder Time</label>
              <input
                type="time"
                name="reminder.time"
                value={formData.reminder.time}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : (isEditing ? 'Update Habit' : 'Create Habit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitForm;
