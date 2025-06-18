/**
 * LandingPage Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: Welcome page and entry point for the habit tracking application
 */

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Build Better Habits, Transform Your Life</h1>
          <p>Track your daily habits, build lasting streaks, and achieve your goals with our intuitive habit tracking system.</p>
          
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">
              Get Started Free
            </Link>
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="habit-card-preview">
            <div className="habit-item">
              <span className="habit-icon">💧</span>
              <span className="habit-name">Drink Water</span>
              <span className="habit-streak">5 days</span>
            </div>
            <div className="habit-item">
              <span className="habit-icon">📖</span>
              <span className="habit-name">Read Books</span>
              <span className="habit-streak">12 days</span>
            </div>
            <div className="habit-item">
              <span className="habit-icon">🏃</span>
              <span className="habit-name">Exercise</span>
              <span className="habit-streak">3 days</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="container">
          <h2>Why Choose Our Habit Tracker?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Visualize your progress with beautiful charts and analytics</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3>Streak Building</h3>
              <p>Build momentum and maintain streaks to stay motivated</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Goal Setting</h3>
              <p>Set personalized goals and track your achievements</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access your habits anywhere with our responsive design</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Achievements</h3>
              <p>Earn badges and celebrate your milestones</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy First</h3>
              <p>Your data is secure and private with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="testimonials-section">
        <div className="container">
          <h2>What Our Users Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"This app has completely transformed my daily routine. I've maintained a 60-day streak of reading!"</p>
              <div className="testimonial-author">
                <span className="author-name">Sarah Johnson</span>
                <span className="author-role">Student</span>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p>"The visual progress tracking keeps me motivated. I love seeing my habits improve over time."</p>
              <div className="testimonial-author">
                <span className="author-name">Mike Chen</span>
                <span className="author-role">Software Engineer</span>
              </div>
            </div>
            
            <div className="testimonial-card">
              <p>"Simple, effective, and beautifully designed. This is exactly what I needed to stay consistent."</p>
              <div className="testimonial-author">
                <span className="author-name">Emma Davis</span>
                <span className="author-role">Designer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
