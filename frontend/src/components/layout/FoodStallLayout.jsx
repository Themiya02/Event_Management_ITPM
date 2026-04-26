import React from 'react';
import FoodStallSidebar from './FoodStallSidebar';
import './OrganizerLayout.css';

const FoodStallLayout = ({ children }) => {
  return (
    <div className="organizer-layout">
      <FoodStallSidebar />
      <div className="main-wrapper">
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FoodStallLayout;
