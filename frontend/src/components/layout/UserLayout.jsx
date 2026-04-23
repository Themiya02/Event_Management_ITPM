import React from 'react';
import UserSidebar from './UserSidebar';
<<<<<<< HEAD
import './OrganizerLayout.css';
=======
import './OrganizerLayout.css'; 
>>>>>>> kumuthu01

const UserLayout = ({ children }) => {
    return (
        <div className="organizer-layout animated-bg">
            <UserSidebar />
            <div className="main-wrapper">
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
