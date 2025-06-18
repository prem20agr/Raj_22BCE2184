/**
 * ProtectedRoute Component - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: Route protection wrapper for authenticated user access
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
