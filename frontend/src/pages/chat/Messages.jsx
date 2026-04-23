import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Messages.css';

const Messages = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const chatContainerRef = useRef(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/messages/contacts`, { headers });
                setContacts(response.data);
                
                // Set initial selected contact only once
                setSelectedContact(prev => {
                    if (!prev && response.data.length > 0) return response.data[0];
                    return prev;
                });
            } catch (error) {
                console.error('Error fetching contacts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchContacts();
            const interval = setInterval(fetchContacts, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedContact) return;
            try {
                const response = await axios.get(`${apiUrl}/api/messages/${selectedContact._id}`, { headers });
                setMessages(prev => {
                    // Only update if message count changed to prevent auto-scroll every 5s
                    if (prev.length !== response.data.length) {
                        return response.data;
                    }
                    return prev;
                });

                // Mark messages as read
                await axios.put(`${apiUrl}/api/messages/${selectedContact._id}/read`, {}, { headers });
                
                // Locally clear the unread count for the active contact so the badge disappears immediately
                setContacts(prev => prev.map(c => 
                    c._id === selectedContact._id ? { ...c, unreadCount: 0 } : c
                ));
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        
        // Simple polling for real-time feel (optional, but good for demo)
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [selectedContact]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const response = await axios.post(`${apiUrl}/api/messages`, {
                receiverId: selectedContact._id,
                content: newMessage
            }, { headers });
            
            setMessages([...messages, response.data]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) return <div className="messages-loading">Loading conversations...</div>;

    return (
        <div className="messages-container animation-fade-in">
            <div className="messages-sidebar glass-panel">
                <div className="messages-sidebar-header">
                    <h2>{user?.role === 'admin' ? 'Organizers' : 'Support Team'}</h2>
                </div>
                <div className="contacts-list">
                    {contacts.length === 0 ? (
                        <p className="no-contacts">No contacts found.</p>
                    ) : (
                        contacts.map(contact => (
                            <div 
                                key={contact._id} 
                                className={`contact-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
                                onClick={() => setSelectedContact(contact)}
                            >
                                <div className="contact-avatar">
                                    {contact.avatar ? (
                                        <img src={contact.avatar} alt={contact.name} />
                                    ) : (
                                        <span className="avatar-placeholder">{contact.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="contact-info">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4>{contact.name}</h4>
                                        {contact.unreadCount > 0 && selectedContact?._id !== contact._id && (
                                            <span style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold' }}>
                                                {contact.unreadCount} New
                                            </span>
                                        )}
                                    </div>
                                    <span className="contact-role">{contact.role}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="messages-main glass-panel">
                {selectedContact ? (
                    <>
                        <div className="chat-header">
                            <div className="contact-avatar">
                                {selectedContact.avatar ? (
                                    <img src={selectedContact.avatar} alt={selectedContact.name} />
                                ) : (
                                    <span className="avatar-placeholder">{selectedContact.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="chat-header-info">
                                <h3>{selectedContact.name}</h3>
                                <span>{selectedContact.role === 'admin' ? 'Platform Administrator' : 'Event Organizer'}</span>
                            </div>
                        </div>

                        <div className="chat-messages" ref={chatContainerRef}>
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>Start the conversation with {selectedContact.name}</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender._id === user._id || msg.sender === user._id;
                                    return (
                                        <div key={idx} className={`message-wrapper ${isMe ? 'message-mine' : 'message-theirs'}`}>
                                            <div className="message-bubble">
                                                <p>{msg.content}</p>
                                                <span className="message-time">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Type your message here..." 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="chat-icon-large">💬</div>
                        <h3>Your Messages</h3>
                        <p>Select a contact from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
