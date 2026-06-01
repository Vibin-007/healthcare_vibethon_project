import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Activity, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    // Fetch patients and their latest health logs
    const { data, error } = await supabase
      .from('patients')
      .select('*');
      
    if (error) console.error('Error fetching patients:', error);
    else setPatients(data || []);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-[#0f0a1a]">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400 flex items-center gap-3">
            <Activity className="text-purple-500" />
            Medical Portal
          </h1>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.05)]">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Users size={20} className="text-gray-400" />
            Assigned Patients
          </h2>

          {loading ? (
            <p className="text-gray-400">Loading patients...</p>
          ) : patients.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No patients found. Add one in the Supabase dashboard to see it here.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <div key={patient.patient_id} className="bg-black/40 border border-white/5 p-5 rounded-xl hover:border-purple-500/50 transition-all cursor-pointer group">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {patient.name || 'Unknown Patient'}
                  </h3>
                  <div className="text-sm text-gray-400 mt-2 space-y-1">
                    <p>Age: {patient.age || 'N/A'}</p>
                    <p>Condition: {patient.disease_condition || 'N/A'}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-purple-400 text-sm font-medium">
                    View Records <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}