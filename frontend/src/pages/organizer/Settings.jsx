import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');
    const user = JSON.parse(localStorage.getItem('user')) || {};

    return (
        <div className="settings-page animation-fade-in">
            <div className="settings-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your organizer profile, security, and notification preferences.</p>
            </div>

            <div className="settings-layout">
                {/* Sidebar Settings Navigation */}
                <div className="settings-sidebar glass-panel">
                    <nav className="settings-nav">
                        <button
                            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Account Profile
                        </button>
                        <button
                            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Security & Privacy
                        </button>
                        <button
                            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            Notifications
                        </button>
                    </nav>
                </div>

                {/* Settings Content Area */}
                <div className="settings-content glass-panel">

                    {/* ACCOUNT TAB */}
                    {activeTab === 'account' && (
                        <div className="tab-pane fade-in">
                            <h2 className="section-title">Public Profile</h2>
                            <p className="section-desc">This information will be displayed to attendees on your event pages.</p>

                            <hr className="divider" />

                            <div className="profile-photo-section">
                                <div className="avatar-large">
                                    <img src="https://i.pravatar.cc/150?img=32" alt="Organizer Avatar" />
                                </div>
                                <div className="photo-actions">
                                    <button className="btn btn-secondary btn-sm">Upload New Photo</button>
                                    <button className="btn btn-text btn-sm text-danger">Remove</button>
                                </div>
                            </div>

                            <form className="settings-form mt-6">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Organization / Club Name</label>
                                        <input type="text" defaultValue="Computing Society" className="styled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Administrator Name</label>
                                        <input type="text" defaultValue={user.name || "Jane Doe"} className="styled-input" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Support Email Address</label>
                                        <input type="email" defaultValue={user.email || "admin@compsec.org"} className="styled-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Phone</label>
                                        <input type="tel" defaultValue="0712345678" className="styled-input" />
                                    </div>
                                </div>

                                <div className="form-group mt-2">
                                    <label>Brief Bio / Description</label>
                                    <textarea rows={4} defaultValue="We are a university club dedicated to tech events." className="styled-input"></textarea>
                                </div>

                                <div className="form-actions mt-6">
                                    <button type="button" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="tab-pane fade-in">
                            <h2 className="section-title">Security Settings</h2>
                            <p className="section-desc">Keep your organizer account secure by updating your password regularly.</p>

                            <hr className="divider" />

                            <form className="settings-form">
                                <div className="form-group max-w-md">
                                    <label>Current Password</label>
                                    <input type="password" placeholder="••••••••" className="styled-input" />
                                </div>
                                <div className="form-group max-w-md">
                                    <label>New Password</label>
                                    <input type="password" placeholder="••••••••" className="styled-input" />
                                </div>
                                <div className="form-group max-w-md">
                                    <label>Confirm New Password</label>
                                    <input type="password" placeholder="••••••••" className="styled-input" />
                                </div>

                                <div className="form-actions mt-6">
                                    <button type="button" className="btn btn-primary">Update Password</button>
                                </div>
                            </form>

                            <h3 className="sub-section-title mt-8">Two-Factor Authentication (2FA)</h3>
                            <div className="security-card">
                                <div>
                                    <h4>Protect your account</h4>
                                    <p className="text-muted text-sm mt-1">Add an extra layer of security to your organization's data.</p>
                                </div>
                                <button className="btn btn-secondary outline-only">Enable 2FA</button>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="tab-pane fade-in">
                            <h2 className="section-title">Notification Preferences</h2>
                            <p className="section-desc">Control what alerts and emails you receive from the platform.</p>

                            <hr className="divider" />

                            <div className="toggle-list">
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <h4>New Ticket Sales</h4>
                                        <p>Receive an email every time someone registers or buys a ticket.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <h4>Event Reminders</h4>
                                        <p>Get a summary 24 hours before your event begins.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <h4>Marketing Updates</h4>
                                        <p>Receive platform updates, tips, and promotional content.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
