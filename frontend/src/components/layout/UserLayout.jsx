import React from 'react';
import UserSidebar from './UserSidebar';
import Topbar from './Topbar';
import './OrganizerLayout.css'; 

const UserLayout = ({ children }) => {
    return (
        <div className="organizer-layout animated-bg">
            <UserSidebar />
            <div className="main-wrapper">
                <Topbar />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
