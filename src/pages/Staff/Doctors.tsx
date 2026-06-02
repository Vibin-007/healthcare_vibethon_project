import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Layout from "../../components/Layout";
import ConfirmModal from "../../components/ConfirmModal";
import { Stethoscope, Search, Trash2, Plus, Mail, Phone } from "lucide-react";

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadData() {
      const { data: docs } = await supabase
        .from("users")
        .select(`
          *,
          doctors ( doctor_id, specialization, phone, address )
        `)
        .eq("role", "doctor")
        .order("created_at", { ascending: false });
        
      if (docs) {
        setDoctors(docs);
      }
      
      const { data: pats } = await supabase.from("patients").select("assigned_doctor_id, name");
      if (pats) {
        const patsMap: Record<string, string[]> = {};
        pats.forEach(p => {
          if (p.assigned_doctor_id) {
            if (!patsMap[p.assigned_doctor_id]) patsMap[p.assigned_doctor_id] = [];
            patsMap[p.assigned_doctor_id].push(p.name);
          }
        });
        setAssignedPatients(patsMap);
      }
    }
    loadData();
  }, []);

  const requestRemove = (userId: string) => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const confirmRemove = async () => {
    if (!userToDelete) return;
    
    // First find the doctor_id
    const { data: docData } = await supabase.from("doctors").select("doctor_id").eq("user_id", userToDelete).single();
    
    if (docData?.doctor_id) {
      // Nullify references in patients table
      await supabase.from("patients").update({ assigned_doctor_id: null }).eq("assigned_doctor_id", docData.doctor_id);
      
      // Nullify references in health logs
      await supabase.from("health_logs").update({ doctor_id: null }).eq("doctor_id", docData.doctor_id);
    }
    
    // Now safe to delete the doctor profile and user record
    await supabase.from("doctors").delete().eq("user_id", userToDelete);
    await supabase.from("users").delete().eq("user_id", userToDelete);
    
    setDoctors(doctors.filter(d => d.user_id !== userToDelete));
    setUserToDelete(null);
  };

  const filteredDoctors = doctors.filter(
    (d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.name.toLowerCase().includes("test")
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-2xl shrink-0 shadow-sm">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctors Directory</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and view all registered doctors.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-sm placeholder:text-gray-400 text-gray-900 transition-all shadow-sm"
              />
            </div>

            <Link 
              to="/add-doctor" 
              className="shrink-0 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus size={16} /> Add Doctor
            </Link>
          </div>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((d) => {
              const docInfo = d.doctors?.[0];
              const patientsList = assignedPatients[docInfo?.doctor_id] || [];
              return (
                <div key={d.user_id} className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 group-hover:text-black transition-colors">Dr. {d.name}</h3>
                          <span className="inline-block text-[10px] font-bold bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-600 uppercase tracking-wider mt-1">
                            {docInfo?.specialization || "General"}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => requestRemove(d.user_id)}
                        className="text-neutral-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0"
                        title="Remove Doctor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-500 border-t border-neutral-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-neutral-400" />
                        <span className="truncate">{d.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-neutral-400" />
                        <span>{docInfo?.phone || "No phone provided"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Assigned Patients ({patientsList.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {patientsList.length > 0 ? (
                          patientsList.map((pName, idx) => (
                            <span key={idx} className="bg-neutral-50 text-neutral-700 text-[10px] font-semibold px-2 py-1 rounded-lg border border-neutral-200/60">
                              {pName}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-400 text-xs italic">No patients assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/staff/${d.user_id}`}
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
            <Stethoscope size={36} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500 font-medium text-sm">No doctors found matching search criteria.</p>
          </div>
        )}
      </div>
      
      <ConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmRemove}
        title="Remove Doctor"
        message="Are you sure you want to permanently remove this doctor from the system? This action cannot be undone."
      />
    </Layout>
  );
}
