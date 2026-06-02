import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { User, Phone, Mail, MapPin, Briefcase, Calendar, AlertTriangle } from "lucide-react";

export default function MyNurse() {
  const { session } = useAuth();
  const [nurseStaff, setNurseStaff] = useState<any>(null);
  const [nurseRoleData, setNurseRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNurse() {
      if (!session?.user?.id) return;
      
      try {
        // 1. Get patient's assigned_nurse_id
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("assigned_nurse_id")
          .eq("user_id", session.user.id)
          .single();

        if (patientError || !patientData?.assigned_nurse_id) {
          setError("You do not have a nurse assigned to you yet.");
          setLoading(false);
          return;
        }

        // 2. Get nurse role data
        const { data: roleData, error: roleError } = await supabase
          .from("nurses")
          .select("*")
          .eq("nurse_id", patientData.assigned_nurse_id)
          .single();
          
        if (roleError || !roleData) {
          setError("Failed to load nurse details.");
          setLoading(false);
          return;
        }

        // 3. Get nurse user data
        const { data: staffData, error: staffError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", roleData.user_id)
          .single();

        if (staffError || !staffData) {
          setError("Failed to load nurse profile.");
        } else {
          setNurseStaff(staffData);
          setNurseRoleData(roleData);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      }
      
      setLoading(false);
    }
    
    loadNurse();
  }, [session]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Nurse</h1>
          <p className="text-sm text-gray-500 mt-1">View the details of your assigned primary care nurse.</p>
        </div>

        {error || !nurseStaff ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-12 text-center">
            <AlertTriangle size={40} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{error || "No nurse assigned"}</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-black text-2xl font-bold">
                    {nurseStaff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {nurseStaff.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} className="text-gray-400" /> <span className="capitalize">{nurseStaff.role}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" /> {nurseStaff.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} className="text-gray-400" /> {nurseRoleData.phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-black/10 border border-gray-200 px-3 py-1.5 rounded-full text-black capitalize">
                    {nurseStaff.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Contact Info</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <span>{nurseStaff.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="text-gray-400" />
                  <span>{nurseRoleData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <span>{nurseRoleData.address || "Not provided"}</span>
                </div>
              </div>

              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Professional Info</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase size={18} className="text-gray-400" />
                  <span className="capitalize">Role: {nurseStaff.role}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} className="text-gray-400" />
                  <span>Joined: {new Date(nurseStaff.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
