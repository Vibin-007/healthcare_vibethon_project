import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Layout from "../../components/Layout";
import ConfirmModal from "../../components/ConfirmModal";
import { HeartPulse, Search, Trash2, Plus, Mail, Phone } from "lucide-react";

export default function Nurses() {
  const [nurses, setNurses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadData() {
      const { data: nursesData } = await supabase
        .from("users")
        .select(`
          *,
          nurses ( nurse_id, phone, address )
        `)
        .eq("role", "nurse")
        .order("created_at", { ascending: false });
        
      if (nursesData) {
        setNurses(nursesData);
      }
      
      const { data: pats } = await supabase.from("patients").select("assigned_nurse_id, name");
      if (pats) {
        const patsMap: Record<string, string[]> = {};
        pats.forEach(p => {
          if (p.assigned_nurse_id) {
            if (!patsMap[p.assigned_nurse_id]) patsMap[p.assigned_nurse_id] = [];
            patsMap[p.assigned_nurse_id].push(p.name);
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
    
    // First find the nurse_id
    const { data: nurseData } = await supabase.from("nurses").select("nurse_id").eq("user_id", userToDelete).single();
    
    if (nurseData?.nurse_id) {
      // Nullify references in patients table
      await supabase.from("patients").update({ assigned_nurse_id: null }).eq("assigned_nurse_id", nurseData.nurse_id);
      
      // Nullify references in health logs
      await supabase.from("health_logs").update({ nurse_id: null }).eq("nurse_id", nurseData.nurse_id);
    }
    
    await supabase.from("nurses").delete().eq("user_id", userToDelete);
    await supabase.from("users").delete().eq("user_id", userToDelete);
    
    setNurses(nurses.filter(n => n.user_id !== userToDelete));
    setUserToDelete(null);
  };

  const filteredNurses = nurses.filter(
    (n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()) && !n.name.toLowerCase().includes("test")
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-2xl shrink-0 shadow-sm">
              <HeartPulse size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nurses Directory</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and view all registered nurses.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search nurses by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-sm placeholder:text-gray-400 text-gray-900 transition-all shadow-sm"
              />
            </div>

            <Link 
              to="/add-nurse" 
              className="shrink-0 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus size={16} /> Add Nurse
            </Link>
          </div>
        </div>

        {filteredNurses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNurses.map((n) => {
              const nurseInfo = n.nurses?.[0];
              const patientsList = assignedPatients[nurseInfo?.nurse_id] || [];
              return (
                <div key={n.user_id} className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 group">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                          {n.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 group-hover:text-black transition-colors">{n.name}</h3>
                          <span className="inline-block text-[10px] font-bold bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-600 uppercase tracking-wider mt-1">
                            Nurse
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => requestRemove(n.user_id)}
                        className="text-neutral-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0"
                        title="Remove Nurse"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-500 border-t border-neutral-100 pt-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-neutral-400" />
                        <span className="truncate">{n.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-neutral-400" />
                        <span>{nurseInfo?.phone || "No phone provided"}</span>
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
                    to={`/staff/${n.user_id}`}
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
            <HeartPulse size={36} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500 font-medium text-sm">No nurses found matching search criteria.</p>
          </div>
        )}
      </div>
      
      <ConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmRemove}
        title="Remove Nurse"
        message="Are you sure you want to permanently remove this nurse from the system? This action cannot be undone."
      />
    </Layout>
  );
}
