// src/pages/Dashboard.tsx
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import AdminDashboard from "./Dashboards/Admin";
import DoctorDashboard from "./Dashboards/Doctor";
import NurseDashboard from "./Dashboards/Nurse";
import PatientDashboard from "./Dashboards/Patient";

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  switch (profile?.role) {
    case "admin":
      return <AdminDashboard />;
    case "doctor":
      return <DoctorDashboard />;
    case "nurse":
      return <NurseDashboard />;
    case "patient":
      return <PatientDashboard />;
    default:
      return (
        <Layout>
          <div className="flex items-center justify-center h-[80vh] text-gray-500">
            No valid role assigned to this account.
          </div>
        </Layout>
      );
  }
}