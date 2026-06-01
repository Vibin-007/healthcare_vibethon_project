import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Users,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

export default function AdminDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState({ doctors: 0, nurses: 0, patients: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [doctorsRes, nursesRes, patientsRes, recentPatientsRes] = await Promise.all([
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase.from("nurses").select("*", { count: "exact", head: true }),
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("patients").select("*").order("created_at", { ascending: false }).limit(5)
      ]);

      setStats({
        doctors: doctorsRes.count || 0,
        nurses: nursesRes.count || 0,
        patients: patientsRes.count || 0,
      });

      if (recentPatientsRes.data) {
        setPatients(recentPatientsRes.data);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Here's an overview of your medical practice today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Total Patients</h3>
            <Users size={16} className="text-gray-400" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900">{stats.patients}</p>
            <p className="text-xs text-gray-400 mt-1">Registered in system</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Total Doctors</h3>
            <Stethoscope size={16} className="text-gray-400" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900">{stats.doctors}</p>
            <p className="text-xs text-gray-400 mt-1">Active staff</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Total Nurses</h3>
            <HeartPulse size={16} className="text-gray-400" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900">{stats.nurses}</p>
            <p className="text-xs text-gray-400 mt-1">Active staff</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Recent Patients</h2>
        <p className="text-sm text-gray-500 mb-6">Latest patients records updated recently.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-transparent border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Patient Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Age</th>
                <th scope="col" className="px-4 py-3 font-medium">Condition</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.patient_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-900">
                    <Link to={`/patient/${p.patient_id}`} className="hover:text-purple-600 transition-colors">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{p.age || "-"} y/o</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {p.disease_condition || "Routine"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-500">
                    {new Date(p.created_at).toISOString().split('T')[0]}
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No recent patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </Layout>
  );
}