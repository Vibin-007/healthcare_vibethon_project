import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import { Users, Search, Trash2, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Patients() {
  const { profile, session } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const [doctorMap, setDoctorMap] = useState<Record<string, string>>({});
  const [nurseMap, setNurseMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      let patientsQuery = supabase.from("patients").select("*").order("created_at", { ascending: false });

      if (profile?.role === "doctor" && session?.user?.id) {
        const { data: docData } = await supabase.from("doctors").select("doctor_id").eq("user_id", session.user.id).single();
        if (docData) patientsQuery = patientsQuery.eq("assigned_doctor_id", docData.doctor_id);
      } else if (profile?.role === "nurse" && session?.user?.id) {
        const { data: nurseData } = await supabase.from("nurses").select("nurse_id").eq("user_id", session.user.id).single();
        if (nurseData) patientsQuery = patientsQuery.eq("assigned_nurse_id", nurseData.nurse_id);
      }

      const [patientsRes, usersRes, doctorsRes, nursesRes] = await Promise.all([
        patientsQuery,
        supabase.from("users").select("user_id, name"),
        supabase.from("doctors").select("doctor_id, user_id"),
        supabase.from("nurses").select("nurse_id, user_id")
      ]);

      if (patientsRes.data) setPatients(patientsRes.data);

      const uMap = (usersRes.data || []).reduce((acc: any, u: any) => ({ ...acc, [u.user_id]: u.name }), {});
      
      const dMap = (doctorsRes.data || []).reduce((acc: any, d: any) => ({ ...acc, [d.doctor_id]: `Dr. ${uMap[d.user_id] || "Unknown"}` }), {});
      setDoctorMap(dMap);
      
      const nMap = (nursesRes.data || []).reduce((acc: any, n: any) => ({ ...acc, [n.nurse_id]: uMap[n.user_id] || "Unknown" }), {});
      setNurseMap(nMap);
    }
    loadData();
  }, [profile, session]);

  const requestRemove = (userId: string) => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const confirmRemove = async () => {
    if (!userToDelete) return;
    
    await supabase.from("patients").delete().eq("user_id", userToDelete);
    await supabase.from("users").delete().eq("user_id", userToDelete);
    
    setPatients(patients.filter(p => p.user_id !== userToDelete));
    setUserToDelete(null);
  };

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-purple-600" size={28} />
              Patients Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view all registered patients.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm placeholder:text-gray-400 text-gray-900 transition-all shadow-sm"
              />
            </div>
            
            {profile?.role === "admin" && (
              <Link 
                to="/add-patient" 
                className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Plus size={16} /> Add Patient
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Patient Name</th>
                  <th scope="col" className="px-6 py-4 font-medium">Age & Gender</th>
                  <th scope="col" className="px-6 py-4 font-medium">Phone Number</th>
                  <th scope="col" className="px-6 py-4 font-medium">Condition</th>
                  <th scope="col" className="px-6 py-4 font-medium">Assigned Staff</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link to={`/patient/${p.patient_id}`} className="hover:text-purple-600 transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {p.age || "-"} y/o, {p.gender || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {p.disease_condition || "Routine"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {p.assigned_doctor_id && <div className="text-purple-600 font-medium">{doctorMap[p.assigned_doctor_id]}</div>}
                      {p.assigned_nurse_id && <div className="text-emerald-600 font-medium">{nurseMap[p.assigned_nurse_id]}</div>}
                      {!p.assigned_doctor_id && !p.assigned_nurse_id && <span>Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Link
                          to={`/patient/${p.patient_id}`}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          View Profile
                        </Link>
                        {profile?.role === "admin" && (
                          <button
                            onClick={() => requestRemove(p.user_id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                            title="Remove Patient"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-white">
                      <Users size={32} className="mx-auto text-gray-300 mb-3" />
                      <p>No patients found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmRemove}
        title="Remove Patient"
        message="Are you sure you want to permanently remove this patient from the system? This action cannot be undone."
      />
    </Layout>
  );
}
