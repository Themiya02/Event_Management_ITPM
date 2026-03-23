import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/public/approved`);
        const allEvents = response.data;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = [];
        const past = [];

        allEvents.forEach(event => {
          const eventDate = new Date(event.date);
          if (eventDate >= today) {
            upcoming.push(event);
          } else {
            past.push(event);
          }
        });

        // Sort upcoming ascending (closest first)
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        // Sort past descending (most recent first)
        past.sort((a, b) => new Date(b.date) - new Date(a.date));

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const EventCard = ({ event }) => (
    <div className="event-card glass-panel">
      {event.imageUrl ? (
        <img src={event.imageUrl} alt={event.name} className="event-image" />
      ) : (
        <div className="event-image-placeholder">No Image</div>
      )}
      <div className="event-details">
        <h3 className="event-title">{event.name}</h3>
        <p className="event-date">📅 {new Date(event.date).toLocaleDateString()} at {event.time}</p>
        <p className="event-location">📍 {event.location || event.campusType}</p>
        <p className="event-desc">{event.description?.substring(0, 80)}...</p>
        <div className="event-footer">
          <span className="event-price">{event.isPaid ? `LKR ${event.price}` : 'Free'}</span>
          {/* Link to view details if needed, can just go to login if not logged in, or we can add a public view later */}
          <Link to={`/dashboard/event/${event._id}`} className="view-btn">View Details</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 className="hero-title text-gradient">Discover Amazing Events</h1>
        <p className="hero-subtitle">Join the best campus events and build unforgettable memories.</p>
        {!user && (
          <Link to="/login" className="view-btn" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 30px', fontSize: '1.1rem' }}>
            Login to Register for Events
          </Link>
        )}
      </header>

      {loading ? (
        <div className="loading-spinner">Loading events...</div>
      ) : (
        <div className="events-content">
          <section className="event-section">
            <h2 className="section-title">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="events-grid">
                {upcomingEvents.map(event => <EventCard key={event._id} event={event} />)}
              </div>
            ) : (
              <p className="no-events">No upcoming events currently scheduled.</p>
            )}
          </section>

          <section className="event-section">
            <h2 className="section-title">Past Events</h2>
            {pastEvents.length > 0 ? (
              <div className="events-grid">
                {pastEvents.map(event => <EventCard key={event._id} event={event} />)}
              </div>
            ) : (
              <p className="no-events">No past events found.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
