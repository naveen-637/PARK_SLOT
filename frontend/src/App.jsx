import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import './styles/globals.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Search = lazy(() => import('./pages/Search.jsx'));
const ParkingDetail = lazy(() => import('./pages/ParkingDetail.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.jsx'));
const UserHistory = lazy(() => import('./pages/UserHistory.jsx'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard.jsx'));
const OwnerAddSlot = lazy(() => import('./pages/OwnerAddSlot.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const getDefaultRouteByRole = (role) => {
  if (role === 'owner') return '/owner/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/search';
};

function ProtectedRoute({ children, roles }) {
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);

  if (token) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
  }

  return children;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <main className="flex-grow">
            <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/search"
                  element={(
                    <ProtectedRoute roles={['customer']}>
                      <Search />
                    </ProtectedRoute>
                  )}
                />
                <Route path="/parking/:id" element={<ParkingDetail />} />
                <Route
                  path="/checkout"
                  element={(
                    <ProtectedRoute roles={['customer', 'owner', 'admin']}>
                      <Checkout />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/login"
                  element={(
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  )}
                />
                <Route
                  path="/register"
                  element={(
                    <PublicOnlyRoute>
                      <Register />
                    </PublicOnlyRoute>
                  )}
                />
                <Route
                  path="/dashboard"
                  element={(
                    <ProtectedRoute roles={['customer']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/history"
                  element={(
                    <ProtectedRoute roles={['customer']}>
                      <UserHistory />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/owner/dashboard"
                  element={(
                    <ProtectedRoute roles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/owner/add-slot"
                  element={(
                    <ProtectedRoute roles={['owner']}>
                      <OwnerAddSlot />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/admin/dashboard"
                  element={(
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  )}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          
          <Footer />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
