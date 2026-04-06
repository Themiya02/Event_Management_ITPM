import React from 'react';
import Sidebar from './Sidebar';
import './OrganizerLayout.css';

const OrganizerLayout = ({ children }) => {
  return (
    <div className="organizer-layout">
      <Sidebar />
      <div className="main-wrapper">
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
