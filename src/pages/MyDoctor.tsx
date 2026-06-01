import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { User, Phone, Mail, MapPin, Briefcase, Calendar, AlertTriangle } from "lucide-react";

export default function MyDoctor() {
  const { session } = useAuth();
  const [doctorStaff, setDoctorStaff] = useState<any>(null);
  const [doctorRoleData, setDoctorRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDoctor() {
      if (!session?.user?.id) return;
      
      try {
        // 1. Get patient's assigned_doctor_id
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("assigned_doctor_id")
          .eq("user_id", session.user.id)
          .single();

        if (patientError || !patientData?.assigned_doctor_id) {
          setError("You do not have a doctor assigned to you yet.");
          setLoading(false);
          return;
        }

        // 2. Get doctor role data
        const { data: roleData, error: roleError } = await supabase
          .from("doctors")
          .select("*")
          .eq("doctor_id", patientData.assigned_doctor_id)
          .single();
          
        if (roleError || !roleData) {
          setError("Failed to load doctor details.");
          setLoading(false);
          return;
        }

        // 3. Get doctor user data
        const { data: staffData, error: staffError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", roleData.user_id)
          .single();

        if (staffError || !staffData) {
          setError("Failed to load doctor profile.");
        } else {
          setDoctorStaff(staffData);
          setDoctorRoleData(roleData);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      }
      
      setLoading(false);
    }
    
    loadDoctor();
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Doctor</h1>
          <p className="text-sm text-gray-500 mt-1">View the details of your assigned primary care doctor.</p>
        </div>

        {error || !doctorStaff ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-12 text-center">
            <AlertTriangle size={40} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{error || "No doctor assigned"}</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-600 text-2xl font-bold">
                    {doctorStaff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Dr. {doctorStaff.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} className="text-gray-400" /> <span className="capitalize">{doctorStaff.role}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" /> {doctorStaff.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} className="text-gray-400" /> {doctorRoleData.phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-purple-600/10 border border-purple-200 px-3 py-1.5 rounded-full text-purple-600 capitalize">
                    {doctorStaff.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Contact Info</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <span>{doctorStaff.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="text-gray-400" />
                  <span>{doctorRoleData.phone || "Not provided"}</span>
                </div>
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <span>{doctorRoleData.address || "Not provided"}</span>
                </div>
              </div>

              <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Professional Info</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase size={18} className="text-gray-400" />
                  <span className="capitalize">Role: {doctorStaff.role}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <User size={18} className="text-gray-400" />
                  <span>Specialization: {doctorRoleData.specialization || "General"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} className="text-gray-400" />
                  <span>Joined: {new Date(doctorStaff.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
