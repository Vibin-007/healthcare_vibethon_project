// src/pages/dashboards/NurseDashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { HeartPulse, Brain, Thermometer } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function NurseDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    async function fetchAssignedPatients() {
      if (!session?.user?.id) return;
      
      const { data: nurseData } = await supabase.from("nurses").select("nurse_id").eq("user_id", session.user.id).single();
      
      if (nurseData?.nurse_id) {
        const { data } = await supabase.from("patients").select("*").eq("assigned_nurse_id", nurseData.nurse_id).order("created_at", { ascending: false });
        if (data) setPatients(data);
      }
    }
    fetchAssignedPatients();
  }, [session]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartPulse className="text-purple-600" size={28} />
            Nurse Station
          </h1>
          <button onClick={() => { supabase.auth.signOut(); navigate("/"); }} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm">Sign Out</button>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Thermometer size={18}/> My Assigned Patients Queue</h2>
          <div className="space-y-3">
            {patients.length > 0 ? (
              patients.map((p) => (
                <div key={p.patient_id} className="flex justify-between items-center bg-[#f8fafc] p-4 rounded-lg border border-gray-100">
                  <div>
                    <h3 className="text-gray-900 font-medium">{p.name}</h3>
                    <p className="text-xs text-gray-500">Assigned Patient</p>
                  </div>
                  <Link to={`/log-vitals/${p.patient_id}`} className="px-5 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <Brain size={16}/> Log Vitals
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                You currently have no patients assigned to you.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}