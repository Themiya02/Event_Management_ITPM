import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './OrganizerLayout.css';

const OrganizerLayout = ({ children }) => {
  return (
    <div className="organizer-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
