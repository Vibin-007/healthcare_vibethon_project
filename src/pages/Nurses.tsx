import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import { HeartPulse, Search, Trash2, Plus } from "lucide-react";

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
    
    await supabase.from("nurses").delete().eq("user_id", userToDelete);
    await supabase.from("users").delete().eq("user_id", userToDelete);
    
    setNurses(nurses.filter(n => n.user_id !== userToDelete));
    setUserToDelete(null);
  };

  const filteredNurses = nurses.filter(
    (n) => n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <HeartPulse className="text-purple-600" size={28} />
              Nurses Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view all registered nurses.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search nurses by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm placeholder:text-gray-400 text-gray-900 transition-all shadow-sm"
              />
            </div>

            <Link 
              to="/add-nurse" 
              className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus size={16} /> Add Nurse
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Nurse Name</th>
                  <th scope="col" className="px-6 py-4 font-medium">Email</th>
                  <th scope="col" className="px-6 py-4 font-medium">Phone Number</th>
                  <th scope="col" className="px-6 py-4 font-medium">Assigned Patients</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNurses.map((n) => (
                  <tr key={n.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {n.name}
                    </td>
                    <td className="px-6 py-4">
                      {n.email}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {n.nurses?.[0]?.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(assignedPatients[n.nurses?.[0]?.nurse_id] || []).length > 0 ? (
                          assignedPatients[n.nurses?.[0]?.nurse_id].map((pName, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-100">
                              {pName}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Link
                        to={`/staff/${n.user_id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => requestRemove(n.user_id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                        title="Remove Nurse"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredNurses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 bg-white">
                      <HeartPulse size={32} className="mx-auto text-gray-300 mb-3" />
                      <p>No nurses found matching your search.</p>
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
        title="Remove Nurse"
        message="Are you sure you want to permanently remove this nurse from the system? This action cannot be undone."
      />
    </Layout>
  );
}
