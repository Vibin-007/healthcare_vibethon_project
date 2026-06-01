// src/pages/dashboards/PatientDashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import { Activity, User, Stethoscope, HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientDashboard() {
  const { session } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user?.id) {
      supabase.from("patients").select("*").eq("user_id", session.user.id).single().then(({ data }) => {
        if (data) setPatient(data);
      });
    }
  }, [session]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-purple-600" size={28} />
            Patient Portal
          </h1>
          <button onClick={() => { supabase.auth.signOut(); navigate("/"); }} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm">Sign Out</button>
        </div>

        {patient ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 text-center space-y-4">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto text-purple-600 text-3xl font-bold">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-500 flex justify-center items-center gap-2 mt-1">
                <User size={14}/> {patient.gender} | {patient.age} Years Old
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 border-t border-gray-100 pt-6">
              <Link 
                to="/my-doctor" 
                className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Stethoscope size={18} /> View My Doctor
              </Link>
              <Link 
                to="/my-nurse" 
                className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <HeartPulse size={18} /> View My Nurse
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white shadow-sm border border-gray-200 rounded-xl">
            <p className="text-gray-500">No patient profile linked to this account.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}