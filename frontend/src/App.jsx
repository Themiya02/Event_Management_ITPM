import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import OrganizerLayout from './components/layout/OrganizerLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardHome from './pages/organizer/DashboardHome';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import TrackEvent from './pages/organizer/TrackEvent';
import EventsList from './pages/organizer/EventsList';
import Settings from './pages/organizer/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import UpcomingEvents from './pages/admin/UpcomingEvents';
import ApprovedEvents from './pages/admin/ApprovedEvents';
import RejectedEvents from './pages/admin/RejectedEvents';
import AdminProfile from './pages/admin/AdminProfile';

import OrganizerProfile from './pages/organizer/OrganizerProfile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />


            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* New Organizer Routes */}
            <Route
              path="/organizer/dashboard"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <DashboardHome />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/profile"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <OrganizerProfile />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/create-event"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <CreateEvent />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/edit-event/:eventId"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <EditEvent />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/track"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <TrackEvent />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/track/:eventId"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <TrackEvent />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/events"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <EventsList />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/organizer/settings"
              element={
                <PrivateRoute>
                  <OrganizerLayout>
                    <Settings />
                  </OrganizerLayout>
                </PrivateRoute>
              }
            />


            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/events/upcoming"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <UpcomingEvents />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/events/approved"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <ApprovedEvents />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/events/rejected"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <RejectedEvents />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/profile"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <AdminProfile />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
