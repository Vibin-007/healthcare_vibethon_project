// src/pages/dashboards/PatientDashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import { Activity, User, Stethoscope, HeartPulse, Sparkles, AlertTriangle, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import { detectImpendingHealthDip, getSmartMedicationReminders } from "../../lib/ai";

export default function PatientDashboard() {
  const { session } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return;

      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (patientData) {
        setPatient(patientData);

        // Fetch logs
        const { data: logsData } = await supabase
          .from("health_logs")
          .select("*")
          .eq("patient_id", patientData.patient_id)
          .order("created_at", { ascending: false });
        
        setVitals(logsData || []);

        // Fetch medications
        const { data: medsData } = await supabase
          .from("medications")
          .select("*")
          .eq("patient_id", patientData.patient_id)
          .order("created_at", { ascending: false });
          
        setMedications(medsData || []);
      }
      setLoading(false);
    }
    loadData();
  }, [session]);

  const latestVitals = vitals[0];

  const healthDipWarning = detectImpendingHealthDip(vitals.map(v => ({
    sleep_hours: v.sleep_hours,
    pain_level: v.pain_level,
    heart_rate: v.heart_rate,
    blood_pressure: v.blood_pressure,
    created_at: v.created_at
  })));

  const smartReminders = getSmartMedicationReminders(medications, latestVitals);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white shadow-sm border border-gray-200 rounded-xl p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-black" size={28} />
              Patient Portal
            </h1>
            <p className="text-sm text-gray-500 mt-1">Access your health insights, medications, and contact care team.</p>
          </div>
          <button 
            onClick={() => { supabase.auth.signOut(); navigate("/"); }} 
            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : patient ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Main Column: Profile and Vitals */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-black/10 rounded-full flex items-center justify-center text-black text-3xl font-bold shrink-0">
                  {patient.name.charAt(0)}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                  <p className="text-gray-500 flex flex-wrap justify-center sm:justify-start items-center gap-2 text-sm">
                    <User size={14}/> {patient.gender} | {patient.age} Years Old
                  </p>
                  <p className="text-xs bg-black/10 text-black px-2.5 py-1 rounded-full w-fit mt-1 mx-auto sm:mx-0 font-medium">
                    Condition: {patient.disease_condition || "General Health"}
                  </p>
                </div>
              </div>

              {/* Health Dip Alert (Feature 2) */}
              {healthDipWarning && (
                <div className="bg-black rounded-xl p-5 flex gap-4 items-start shadow-sm text-white">
                  <div className="bg-white/20 p-2 rounded-lg shrink-0 mt-0.5 animate-pulse">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">AI Predictive Health Warning</h3>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      {healthDipWarning}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Please note: This is an automated trend alert based on sleep & pain metrics. Consult your doctor if symptoms worsen.
                    </p>
                  </div>
                </div>
              )}

              {/* Latest Vitals Summary */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">My Latest Vital Logs</h3>
                {latestVitals ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 mb-1">Heart Rate</p>
                      <p className="text-xl font-bold text-gray-900">{latestVitals.heart_rate} <span className="text-xs font-normal text-gray-500">bpm</span></p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 mb-1">Blood Pressure</p>
                      <p className="text-xl font-bold text-gray-900">{latestVitals.blood_pressure || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 mb-1">Sleep Hours</p>
                      <p className="text-xl font-bold text-gray-900">{latestVitals.sleep_hours} <span className="text-xs font-normal text-gray-500">hrs</span></p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 mb-1">Pain Level</p>
                      <p className="text-xl font-bold text-gray-900">{latestVitals.pain_level}/10</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-500">No logs found. Your doctor/nurse will log your vitals during your check-up.</p>
                  </div>
                )}
              </div>

              {/* Care Team Quick Links */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">My Healthcare Team</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link 
                    to="/my-doctor" 
                    className="flex-1 text-center flex items-center justify-center gap-2 bg-gray-50 text-black hover:bg-gray-100 px-5 py-3 rounded-lg text-sm font-semibold transition-colors border border-gray-200"
                  >
                    <Stethoscope size={18} /> Contact Assigned Doctor
                  </Link>
                  <Link 
                    to="/my-nurse" 
                    className="flex-1 text-center flex items-center justify-center gap-2 bg-gray-50 text-black hover:bg-gray-100 px-5 py-3 rounded-lg text-sm font-semibold transition-colors border border-gray-200"
                  >
                    <HeartPulse size={18} /> Contact Assigned Nurse
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Smart Reminders (Feature 4) */}
            <div className="space-y-6">
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Sparkles size={18} className="text-black shrink-0" />
                  <h3 className="font-bold text-gray-900">AI Adaptive Med Schedule</h3>
                </div>
                {smartReminders.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your medication timings automatically adapt to your logged sleep patterns to ensure optimal absorption and prevent fatigue.
                    </p>
                    <div className="space-y-3">
                      {smartReminders.map((rem, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5 hover:border-gray-400 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-sm text-gray-900 break-words">{rem.medicine_name}</span>
                            {rem.priority === "high" && (
                              <span className="text-[9px] font-bold bg-black text-white px-2 py-0.5 rounded shrink-0">HIGH PRIORITY</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400 line-through">{rem.original_time}</span>
                            <span className="text-black font-bold">➔ {rem.adjusted_time}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 italic leading-relaxed">{rem.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No active medications or vitals logged yet. Ask your care team to prescribe medications.</p>
                  </div>
                )}
              </div>
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