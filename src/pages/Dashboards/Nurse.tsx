// src/pages/dashboards/NurseDashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { HeartPulse, Brain, Thermometer } from "lucide-react";

export default function NurseDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("patients").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setPatients(data);
    });
  }, []);

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
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Thermometer size={18}/> Vitals Collection Queue</h2>
          <div className="space-y-3">
            {patients.map((p) => (
              <div key={p.patient_id} className="flex justify-between items-center bg-[#f8fafc] p-4 rounded-lg border border-white/5">
                <div>
                  <h3 className="text-gray-900 font-medium">{p.name}</h3>
                  <p className="text-xs text-gray-500">Room assignment pending</p>
                </div>
                <Link to={`/log-vitals/${p.patient_id}`} className="px-5 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Brain size={16}/> Log Vitals
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}