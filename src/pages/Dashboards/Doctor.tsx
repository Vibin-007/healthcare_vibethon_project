// src/pages/dashboards/DoctorDashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Stethoscope, FileText, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    async function fetchAssignedPatients() {
      if (!session?.user?.id) return;
      
      const { data: docData } = await supabase.from("doctors").select("doctor_id").eq("user_id", session.user.id).single();
      
      if (docData?.doctor_id) {
        const { data } = await supabase.from("patients").select("*").eq("assigned_doctor_id", docData.doctor_id).order("created_at", { ascending: false });
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
            <Stethoscope className="text-purple-600" size={28} />
            Doctor Dashboard
          </h1>
          <button onClick={() => { supabase.auth.signOut(); navigate("/"); }} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm">Sign Out</button>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18}/> My Assigned Patients</h2>
          <div className="grid grid-cols-2 gap-4">
            {patients.length > 0 ? (
              patients.map((p) => (
                <div key={p.patient_id} className="border border-gray-200 p-4 rounded-xl hover:border-purple-300">
                  <h3 className="text-gray-900 font-medium text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{p.disease_condition || "Pending Diagnosis"}</p>
                  <Link to={`/patient/${p.patient_id}`} className="w-full justify-center px-3 py-2 bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg text-sm flex items-center gap-2 transition-all">
                    <FileText size={16}/> View Clinical Analytics
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                You currently have no patients assigned to you.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}