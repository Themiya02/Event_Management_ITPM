import React from 'react';
import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar';
import './OrganizerLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="organizer-layout">
      <AdminSidebar />
      <div className="main-wrapper admin-app-shell">
        <Topbar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
