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
  const [search, setSearch] = useState('');

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

        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
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

  const formatEventDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const EventCard = ({ event }) => (
    <div className="event-card glass-panel">
      <div className="event-image-wrap">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} className="event-image" />
        ) : (
          <div className="event-image-placeholder">No Image</div>
        )}
        <div className="event-pill-row">
          <span className={`event-pill ${event.isPaid ? 'paid' : 'free'}`}>
            {event.isPaid ? `Paid • LKR ${event.price}` : 'Free'}
          </span>
          {event.campusType ? <span className="event-pill subtle">{event.campusType}</span> : null}
        </div>
      </div>

      <div className="event-details">
        <h3 className="event-title">{event.name}</h3>

        <div className="event-meta">
          <p className="event-date">📅 {formatEventDate(event.date)} {event.time ? <span className="event-time">• {event.time}</span> : null}</p>
          <p className="event-location">📍 {event.location || event.campusType || 'Location TBA'}</p>
        </div>

        <p className="event-desc">{event.description ? `${event.description.substring(0, 90)}${event.description.length > 90 ? '...' : ''}` : 'No description provided.'}</p>

        <div className="event-footer">
          <Link
            to={user ? `/dashboard/event/${event._id}` : '/login'}
            className="view-btn"
          >
            {user ? 'View Details' : 'Login to View'}
          </Link>
        </div>
      </div>
    </div>
  );

  const matchesSearch = (event) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const hay = `${event.name || ''} ${event.location || ''} ${event.campusType || ''} ${event.description || ''}`.toLowerCase();
    return hay.includes(q);
  };

  const filteredUpcoming = upcomingEvents.filter(matchesSearch);
  const filteredPast = pastEvents.filter(matchesSearch);

  return (
    <div className="home-container">
      <div className="home-toolbar glass-panel">
        <div className="home-toolbar-text">
          <h1 className="home-heading text-gradient">Events</h1>
          <p className="home-lead">Browse upcoming and past approved events. Use search to filter the list.</p>
        </div>
        <div className="home-search-field">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by name, place, or keyword…"
            className="home-search-input"
            aria-label="Search events"
          />
          {search ? (
            <button type="button" className="home-search-clear" onClick={() => setSearch('')}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading events...</div>
      ) : (
        <div className="events-content">
          <section className="event-section">
            <div className="section-head">
              <h2 className="section-title">Upcoming Events</h2>
              <span className="section-badge">{filteredUpcoming.length}</span>
            </div>
            {filteredUpcoming.length > 0 ? (
              <div className="events-grid">
                {filteredUpcoming.map(event => <EventCard key={event._id} event={event} />)}
              </div>
            ) : (
              <p className="no-events">{search ? 'No upcoming events match your search.' : 'No upcoming events currently scheduled.'}</p>
            )}
          </section>

          <section className="event-section">
            <div className="section-head">
              <h2 className="section-title">Past Events</h2>
              <span className="section-badge">{filteredPast.length}</span>
            </div>
            {filteredPast.length > 0 ? (
              <div className="events-grid">
                {filteredPast.map(event => <EventCard key={event._id} event={event} />)}
              </div>
            ) : (
              <p className="no-events">{search ? 'No past events match your search.' : 'No past events found.'}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
