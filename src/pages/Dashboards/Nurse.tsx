// src/pages/dashboards/NurseDashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { HeartPulse, FileText, Activity, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { generateVitalsInsight } from "../../lib/ai";

interface PatientAlert {
  patient_id: string;
  name: string;
  insight: string;
}

export default function NurseDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      
      const { data: nurseData } = await supabase.from("nurses").select("nurse_id").eq("user_id", session.user.id).single();
      
      if (nurseData?.nurse_id) {
        const { data: patientsData } = await supabase.from("patients").select("*").eq("assigned_nurse_id", nurseData.nurse_id).order("created_at", { ascending: false });
        
        if (patientsData) {
          setPatients(patientsData);
          
          // Generate dynamic AI alerts for all assigned patients based on their latest vitals
          const patientAlerts: PatientAlert[] = [];
          
          for (const p of patientsData) {
            const { data: latestVitals } = await supabase
              .from("health_logs")
              .select("*")
              .eq("patient_id", p.patient_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
              
            if (latestVitals) {
              const insight = await generateVitalsInsight({
                heart_rate: latestVitals.heart_rate,
                blood_pressure: latestVitals.blood_pressure,
                sleep_hours: latestVitals.sleep_hours,
                pain_level: latestVitals.pain_level,
                symptoms: latestVitals.symptoms
              }, p.disease_condition);
              
              if (insight && !insight.includes("stable")) {
                patientAlerts.push({ patient_id: p.patient_id, name: p.name, insight });
              }
            }
          }
          setAlerts(patientAlerts);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [session]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white shadow-sm border border-gray-200 rounded-xl p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <HeartPulse className="text-gray-700" size={28} />
              Welcome, Nurse
            </h1>
            <p className="text-gray-500 mt-1">Here is the status of your assigned patients today.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Alerts Column */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-black" />
                AI Triage Alerts
              </h2>
              
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert, i) => (
                    <div key={i} className="bg-black rounded-xl p-4 text-white shadow-md shadow-black/10">
                      <div className="flex items-center gap-2 mb-2 font-semibold">
                        <AlertTriangle size={16} className="text-black" />
                        {alert.name}
                      </div>
                      <p className="text-sm text-gray-100 leading-relaxed mb-3">
                        {alert.insight}
                      </p>
                      <Link to={`/patient/${alert.patient_id}`} className="inline-block bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        Review Patient
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="text-black" size={24} />
                  </div>
                  <p className="text-gray-900 font-medium">All Stable</p>
                  <p className="text-sm text-gray-500 mt-1">No critical AI alerts for your patients at this time.</p>
                </div>
              )}
            </div>

            {/* Patients Column */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-gray-700" />
                My Assigned Patients ({patients.length})
              </h2>
              
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                {patients.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {patients.map((p) => (
                      <div key={p.patient_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <h3 className="text-gray-900 font-semibold">{p.name}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{p.disease_condition || "Pending Diagnosis"}</p>
                        </div>
                        <Link to={`/patient/${p.patient_id}`} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-black rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                          <FileText size={16}/> View Profile
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    You currently have no patients assigned to you.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}