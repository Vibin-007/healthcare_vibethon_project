// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import PatientDetail from "./pages/Patient/PatientDetail";
import LogVitals from "./pages/Patient/LogVitals";
import AddPatient from "./pages/Staff/AddPatient";
import Dashboard from "./pages/Dashboard";
import AddUser from "./pages/Staff/AddUser";
import Patients from "./pages/Patient/Patients";
import Doctors from "./pages/Staff/Doctors";
import Nurses from "./pages/Staff/Nurses";
import StaffDetail from "./pages/Staff/StaffDetail";
import MyMedications from "./pages/Patient/MyMedications";
import MyDoctor from "./pages/Patient/MyDoctor";
import MyNurse from "./pages/Patient/MyNurse";

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
      <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
      <Route path="/nurses" element={<ProtectedRoute><Nurses /></ProtectedRoute>} />
      <Route path="/my-medications" element={<ProtectedRoute><MyMedications /></ProtectedRoute>} />
      <Route path="/my-doctor" element={<ProtectedRoute><MyDoctor /></ProtectedRoute>} />
      <Route path="/my-nurse" element={<ProtectedRoute><MyNurse /></ProtectedRoute>} />
      <Route path="/staff/:id" element={<ProtectedRoute><StaffDetail /></ProtectedRoute>} />
      <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
      <Route path="/log-vitals/:id" element={<ProtectedRoute><LogVitals /></ProtectedRoute>} />
      <Route path="/add-patient" element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
      <Route path="/add-doctor" element={<ProtectedRoute><AddUser role="doctor" /></ProtectedRoute>} />
      <Route path="/add-nurse" element={<ProtectedRoute><AddUser role="nurse" /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}