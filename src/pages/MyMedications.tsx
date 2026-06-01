import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { Pill, Activity, AlertTriangle } from "lucide-react";

interface Medication {
  medication_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  created_at: string;
}

export default function MyMedications() {
  const { session } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMedications() {
      if (!session?.user?.id) return;
      
      try {
        // First get the patient_id from the users table or patients table
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("patient_id")
          .eq("user_id", session.user.id)
          .single();

        if (patientError || !patientData) {
          setError("Could not find your patient profile.");
          setLoading(false);
          return;
        }

        // Then get medications for this patient
        const { data: medsData, error: medsError } = await supabase
          .from("medications")
          .select("*")
          .eq("patient_id", patientData.patient_id)
          .order("created_at", { ascending: false });

        if (medsError) {
          setError("Failed to load medications.");
        } else {
          setMedications(medsData || []);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      }
      
      setLoading(false);
    }
    
    loadMedications();
  }, [session]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
          <p className="text-sm text-gray-500 mt-1">View your currently prescribed medications and schedule.</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pill size={20} className="text-purple-600" />
                Current Prescriptions
              </h2>
            </div>
            
            <div className="p-0">
              {medications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-400 uppercase bg-transparent border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-medium">Medication Name</th>
                        <th className="px-6 py-4 font-medium">Dosage</th>
                        <th className="px-6 py-4 font-medium">Frequency</th>
                        <th className="px-6 py-4 font-medium">Prescribed On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medications.map((med) => (
                        <tr key={med.medication_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                              <Pill size={14} className="text-purple-600" />
                            </div>
                            {med.medicine_name}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium text-xs">
                              {med.dosage}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{med.frequency}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(med.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Activity size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No medications prescribed yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Your medications will appear here once prescribed by your doctor.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
