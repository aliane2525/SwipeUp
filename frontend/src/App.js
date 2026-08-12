import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ================= PAGES =================

import Login from "./pages/Login";
import Register from "./pages/Register";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Home from "./pages/Home";
import Matches from "./pages/Matches";
import ChatList from "./pages/ChatList";
import ChatPage from "./pages/ChatPage";
import VideoCall from "./pages/VideoCall";
import Notifications from "./pages/Notifications";
import ProfileSettings from "./pages/ProfileSettings";
import Moments from "./pages/Moments";
import Requests from "./pages/Requests";
import SwipePage from "./pages/SwipePage";

// ======================================================
// PROTECTED ROUTE
// ======================================================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ======================================================
// APP
// ======================================================

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* ================================================= */}
        {/* LOGIN */}
        {/* ================================================= */}

        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* ================================================= */}
        {/* REGISTER */}
        {/* ================================================= */}

        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* ================================================= */}
        {/* FORGOT PASSWORD */}
        {/* ================================================= */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ================================================= */}
        {/* RESET PASSWORD */}
        {/* ================================================= */}

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* ================================================= */}
        {/* HOME */}
        {/* ================================================= */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* MATCHES */}
        {/* ================================================= */}

        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* CHAT LIST */}
        {/* ================================================= */}

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* CHAT PAGE */}
        {/* ================================================= */}

        <Route
          path="/chat/:roomId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* REQUESTS */}
        {/* ================================================= */}

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* VIDEO CALL */}
        {/* ================================================= */}

        <Route
          path="/call/:roomId"
          element={
            <ProtectedRoute>
              <VideoCall />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* NOTIFICATIONS */}
        {/* ================================================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* MOMENTS */}
        {/* ================================================= */}

        <Route
          path="/moments"
          element={
            <ProtectedRoute>
              <Moments />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* SWIPE */}
        {/* ================================================= */}

        <Route
          path="/swipe"
          element={
            <ProtectedRoute>
              <SwipePage />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* PROFILE SETTINGS */}
        {/* ================================================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* ================================================= */}
        {/* FALLBACK */}
        {/* ================================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;