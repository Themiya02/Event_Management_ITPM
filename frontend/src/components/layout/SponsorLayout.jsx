import React from 'react';
import SponsorSidebar from './SponsorSidebar';
import './OrganizerLayout.css';

const SponsorLayout = ({ children }) => {
  return (
    <div className="organizer-layout">
      <SponsorSidebar />
      <div className="main-wrapper">
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SponsorLayout;
