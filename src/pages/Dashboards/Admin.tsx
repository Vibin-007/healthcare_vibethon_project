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
  const [recentDoctors, setRecentDoctors] = useState<any[]>([]);
  const [recentNurses, setRecentNurses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"patients" | "doctors" | "nurses">("patients");
  const [stats, setStats] = useState({ doctors: 0, nurses: 0, patients: 0 });
  const [doctorMap, setDoctorMap] = useState<Record<string, string>>({});
  const [nurseMap, setNurseMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStats = async () => {
      const [doctorsRes, nursesRes, patientsRes, recentPatientsRes, recentDoctorsRes, recentNursesRes, allUsersRes, allDocsRes, allNursRes] = await Promise.all([
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase.from("nurses").select("*", { count: "exact", head: true }),
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("patients").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("users").select(`*, doctors (specialization, phone)`).eq("role", "doctor").order("created_at", { ascending: false }).limit(5),
        supabase.from("users").select(`*, nurses (phone)`).eq("role", "nurse").order("created_at", { ascending: false }).limit(5),
        supabase.from("users").select("user_id, name"),
        supabase.from("doctors").select("doctor_id, user_id"),
        supabase.from("nurses").select("nurse_id, user_id")
      ]);

      setStats({
        doctors: doctorsRes.count || 0,
        nurses: nursesRes.count || 0,
        patients: patientsRes.count || 0,
      });

      if (recentPatientsRes.data) {
        setPatients(recentPatientsRes.data);
      }
      if (recentDoctorsRes.data) {
        setRecentDoctors(recentDoctorsRes.data);
      }
      if (recentNursesRes.data) {
        setRecentNurses(recentNursesRes.data);
      }
      
      const uMap = (allUsersRes.data || []).reduce((acc: any, u: any) => ({ ...acc, [u.user_id]: u.name }), {});
      const dMap = (allDocsRes.data || []).reduce((acc: any, d: any) => ({ ...acc, [d.doctor_id]: `Dr. ${uMap[d.user_id] || "Unknown"}` }), {});
      setDoctorMap(dMap);
      const nMap = (allNursRes.data || []).reduce((acc: any, n: any) => ({ ...acc, [n.nurse_id]: uMap[n.user_id] || "Unknown" }), {});
      setNurseMap(nMap);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Recent Users</h2>
            <p className="text-sm text-gray-500">Latest user records updated recently.</p>
          </div>
          <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200 self-start sm:self-auto">
            <button 
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'patients' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Patients
            </button>
            <button 
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'doctors' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Doctors
            </button>
            <button 
              onClick={() => setActiveTab('nurses')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'nurses' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Nurses
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'patients' && (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-transparent border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Patient Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Age</th>
                  <th scope="col" className="px-4 py-3 font-medium">Condition</th>
                  <th scope="col" className="px-4 py-3 font-medium">Assigned Staff</th>
                  <th scope="col" className="px-4 py-3 font-medium">Last Visit</th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">Action</th>
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
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {p.assigned_doctor_id && <div className="text-purple-600 font-medium">{doctorMap[p.assigned_doctor_id]}</div>}
                      {p.assigned_nurse_id && <div className="text-emerald-600 font-medium">{nurseMap[p.assigned_nurse_id]}</div>}
                      {!p.assigned_doctor_id && !p.assigned_nurse_id && <span>Unassigned</span>}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(p.created_at).toISOString().split('T')[0]}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/patient/${p.patient_id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No recent patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'doctors' && (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-transparent border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Doctor Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Specialization</th>
                  <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDoctors.map((d) => (
                  <tr key={d.user_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <Link to={`/staff/${d.user_id}`} className="hover:text-purple-600 transition-colors">
                        Dr. {d.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{d.email}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {d.doctors?.[0]?.specialization || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(d.created_at).toISOString().split('T')[0]}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/staff/${d.user_id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentDoctors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No recent doctors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'nurses' && (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-transparent border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Nurse Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Phone</th>
                  <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentNurses.map((n) => (
                  <tr key={n.user_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <Link to={`/staff/${n.user_id}`} className="hover:text-purple-600 transition-colors">
                        {n.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{n.email}</td>
                    <td className="px-4 py-4 text-gray-500">
                      {n.nurses?.[0]?.phone || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {new Date(n.created_at).toISOString().split('T')[0]}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/staff/${n.user_id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentNurses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No recent nurses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
}