import React from 'react';
import FoodStallSidebar from './FoodStallSidebar';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '@iconify/react';
import './OrganizerLayout.css';

const FoodStallLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="food-vendor-layout">
      <FoodStallSidebar handleLogout={logout} />
      <div className="food-main-content">
        <main className="food-page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FoodStallLayout;
