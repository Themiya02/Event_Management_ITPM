import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Event Management System</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome to your Dashboard</h2>
          <p>You are logged in as <strong>{user?.email}</strong></p>
          <p>Role: <span className="badge">{user?.role}</span></p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>My Events</h3>
            <p>View and manage your events</p>
            <button className="btn btn-primary">View Events</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Create Event</h3>
            <p>Create a new event</p>
            <button className="btn btn-primary">Create New</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Browse Events</h3>
            <p>Discover upcoming events</p>
            <button className="btn btn-primary">Browse</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
