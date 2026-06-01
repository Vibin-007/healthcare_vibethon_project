import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import { Stethoscope, Search, Trash2, Plus } from "lucide-react";

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
    
    await supabase.from("doctors").delete().eq("user_id", userToDelete);
    await supabase.from("users").delete().eq("user_id", userToDelete);
    
    setDoctors(doctors.filter(d => d.user_id !== userToDelete));
    setUserToDelete(null);
  };

  const filteredDoctors = doctors.filter(
    (d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="text-purple-600" size={28} />
              Doctors Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view all registered doctors.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm placeholder:text-gray-400 text-gray-900 transition-all shadow-sm"
              />
            </div>

            <Link 
              to="/add-doctor" 
              className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus size={16} /> Add Doctor
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Doctor Name</th>
                  <th scope="col" className="px-6 py-4 font-medium">Email</th>
                  <th scope="col" className="px-6 py-4 font-medium">Specialization</th>
                  <th scope="col" className="px-6 py-4 font-medium">Phone Number</th>
                  <th scope="col" className="px-6 py-4 font-medium">Assigned Patients</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDoctors.map((d) => (
                  <tr key={d.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Dr. {d.name}
                    </td>
                    <td className="px-6 py-4">
                      {d.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {d.doctors?.[0]?.specialization || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {d.doctors?.[0]?.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(assignedPatients[d.doctors?.[0]?.doctor_id] || []).length > 0 ? (
                          assignedPatients[d.doctors?.[0]?.doctor_id].map((pName, idx) => (
                            <span key={idx} className="bg-purple-50 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-100">
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
                        to={`/staff/${d.user_id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => requestRemove(d.user_id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                        title="Remove Doctor"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDoctors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-white">
                      <Stethoscope size={32} className="mx-auto text-gray-300 mb-3" />
                      <p>No doctors found matching your search.</p>
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
        title="Remove Doctor"
        message="Are you sure you want to permanently remove this doctor from the system? This action cannot be undone."
      />
    </Layout>
  );
}
