import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/user/UserDashboard';
import EventView from './pages/user/EventView';
import MyTickets from './pages/user/MyTickets';
import PrivateRoute from './components/PrivateRoute';
import UserLayout from './components/layout/UserLayout';
import OrganizerLayout from './components/layout/OrganizerLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardHome from './pages/organizer/DashboardHome';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import TrackEvent from './pages/organizer/TrackEvent';
import EventsList from './pages/organizer/EventsList';
import Settings from './pages/organizer/Settings';
import OrganizerArtists from './pages/organizer/OrganizerArtists';
import AdminDashboard from './pages/admin/AdminDashboard';
import UpcomingEvents from './pages/admin/UpcomingEvents';
import ApprovedEvents from './pages/admin/ApprovedEvents';
import RejectedEvents from './pages/admin/RejectedEvents';
import AdminProfile from './pages/admin/AdminProfile';
import AdminEventReview from './pages/admin/AdminEventReview';
import SponsorDashboard from './pages/sponsor/SponsorDashboard';
import FoodDashboard from './pages/food/FoodDashboard';
import FoodStallMapUpload from './pages/admin/FoodStallMapUpload';
import FoodStallBookings from './pages/admin/FoodStallBookings';
import AddArtists from './pages/artists/AddArtists';
import Artists from './pages/artists/Artists';
import UserView from './pages/user/UserView';
import RatingAnalyze from './pages/artists/RatingAnalyze';
import UserArtists from './pages/user/UserArtists';
import UserRating from './pages/user/UserRating';
import AdminArtistsView from './pages/admin/AdminArtistsView';

import OrganizerProfile from './pages/organizer/OrganizerProfile';
import Home from './pages/Home';
import GlobalNavbar from './components/layout/GlobalNavbar';
import GlobalFooter from './components/layout/GlobalFooter';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showNavAndFooter = !isAuthPage && user;

  return (
    <div className="app">
      {showNavAndFooter && <GlobalNavbar />}
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />


            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <UserLayout>
                    <UserDashboard />
                  </UserLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/event/:id"
              element={
                <PrivateRoute>
                  <UserLayout>
                    <EventView />
                  </UserLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/user/tickets"
              element={
                <PrivateRoute>
                  <UserLayout>
                    <MyTickets />
                  </UserLayout>
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

            <Route
              path="/organizer/artists"
              element={
                <PrivateRoute allowedRoles={['organizer']}>
                  <OrganizerLayout>
                    <OrganizerArtists />
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
              path="/admin/events/review/:id"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <AdminEventReview />
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

            <Route
              path="/admin/food/upload-map"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <FoodStallMapUpload />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/food/bookings"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <FoodStallBookings />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/artists"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <AddArtists />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/artists/view"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminArtistsView />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/artists/analyze"
              element={
                <PrivateRoute allowedRoles={['admin', 'organizer']}>
                  {user?.role === 'admin' ? (
                    <AdminLayout>
                      <RatingAnalyze />
                    </AdminLayout>
                  ) : (
                    <OrganizerLayout>
                      <RatingAnalyze />
                    </OrganizerLayout>
                  )}
                </PrivateRoute>
              }
            />

            {/* Public Domains */}
            <Route path="/artists" element={<Artists />} />
            <Route
              path="/user/artists"
              element={
                <PrivateRoute>
                  <UserView />
                </PrivateRoute>
              }
            />

            <Route
              path="/user/rating"
              element={
                <PrivateRoute>
                  <UserRating />
                </PrivateRoute>
              }
            />

            {/* New Domains */}
            <Route
              path="/sponsor/dashboard"
              element={
                <PrivateRoute>
                    <SponsorDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/food/dashboard"
              element={
                <PrivateRoute>
                    <FoodDashboard />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Home />} />
        </Routes>
      </main>
      {showNavAndFooter && <GlobalFooter />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
