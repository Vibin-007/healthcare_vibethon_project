// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PatientDetail from "./pages/PatientDetail";
import LogVitals from "./pages/LogVitals";
import AddPatient from "./pages/AddPatient";
import Dashboard from "./pages/Dashboard";
import AddUser from "./pages/AddUser";
import Patients from "./pages/Patients";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return !session ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/log-vitals/:id" element={<ProtectedRoute><LogVitals /></ProtectedRoute>} />
      <Route path="/add-patient" element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
      <Route path="/add-doctor" element={<ProtectedRoute><AddUser role="doctor" /></ProtectedRoute>} />
      <Route path="/add-nurse" element={<ProtectedRoute><AddUser role="nurse" /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}