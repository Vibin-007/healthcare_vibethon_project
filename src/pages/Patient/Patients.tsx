import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import ConfirmModal from "../../components/ConfirmModal";
import { Users, Search, Trash2, Plus, Phone, Activity, HeartPulse, Stethoscope } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
    
    // Find the patient_id
    const { data: patData } = await supabase.from("patients").select("patient_id").eq("user_id", userToDelete).single();
    
    if (patData?.patient_id) {
      // Delete all dependent records to satisfy foreign key constraints
      await supabase.from("health_logs").delete().eq("patient_id", patData.patient_id);
      await supabase.from("medications").delete().eq("patient_id", patData.patient_id);
      await supabase.from("ai_insights").delete().eq("patient_id", patData.patient_id);
    }
    
    await supabase.from("patients").delete().eq("user_id", userToDelete);
    await supabase.from("users").delete().eq("user_id", userToDelete);
    
    setPatients(patients.filter(p => p.user_id !== userToDelete));
    setUserToDelete(null);
  };

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.name.toLowerCase().includes("test")
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-2xl shrink-0 shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patients Directory</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and view all registered patients.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-sm placeholder:text-gray-400 text-gray-900 transition-all shadow-sm"
              />
            </div>
            
            {profile?.role === "admin" && (
              <Link 
                to="/add-patient" 
                className="shrink-0 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Plus size={16} /> Add Patient
              </Link>
            )}
          </div>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((p) => {
              const hasDoctor = !!p.assigned_doctor_id;
              const hasNurse = !!p.assigned_nurse_id;
              return (
                <div key={p.patient_id} className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 group-hover:text-black transition-colors">{p.name}</h3>
                          <span className="inline-block text-[10px] font-bold bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-600 uppercase tracking-wider mt-1">
                            {p.age || "-"} y/o • {p.gender || "Unknown"}
                          </span>
                        </div>
                      </div>
                      
                      {profile?.role === "admin" && (
                        <button
                          onClick={() => requestRemove(p.user_id)}
                          className="text-neutral-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0"
                          title="Remove Patient"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-neutral-500 border-t border-neutral-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-neutral-400" />
                        <span>{p.phone || "No phone provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-neutral-400" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-50 text-neutral-700 border border-neutral-200/60 font-semibold text-[10px]">
                          {p.disease_condition || "Routine"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-neutral-50">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Assigned Care Team</p>
                      <div className="space-y-1 text-xs">
                        {hasDoctor ? (
                          <div className="flex items-center gap-1.5 text-neutral-700">
                            <Stethoscope size={13} className="text-neutral-400" />
                            <span className="font-medium">{doctorMap[p.assigned_doctor_id]}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-neutral-400 italic">
                            <Stethoscope size={13} />
                            <span>No Doctor assigned</span>
                          </div>
                        )}
                        {hasNurse ? (
                          <div className="flex items-center gap-1.5 text-neutral-700">
                            <HeartPulse size={13} className="text-neutral-400" />
                            <span className="font-medium">{nurseMap[p.assigned_nurse_id]}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-neutral-400 italic">
                            <HeartPulse size={13} />
                            <span>No Nurse assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/patient/${p.patient_id}`}
                    className="w-full text-center bg-neutral-50 hover:bg-black hover:text-white border border-neutral-200 text-neutral-800 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 block"
                  >
                    View Profile
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-12 text-center">
            <Users size={36} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500 font-medium text-sm">No patients found matching search criteria.</p>
          </div>
        )}
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
