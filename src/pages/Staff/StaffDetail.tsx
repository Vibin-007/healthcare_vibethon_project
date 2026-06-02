import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Layout from "../../components/Layout";
import { User, Phone, Mail, MapPin, Briefcase, ArrowLeft, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function StaffDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<any>(null);
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      const { data } = await supabase
        .from("users")
        .select(`
          *,
          doctors (*),
          nurses (*)
        `)
        .eq("user_id", id)
        .single();
        
      if (data) {
        setStaff(data);
        
        // Fetch assigned patients
        if (data.role === "doctor" && data.doctors?.[0]) {
          const { data: pData } = await supabase.from("patients").select("*").eq("assigned_doctor_id", data.doctors[0].doctor_id);
          if (pData) setAssignedPatients(pData);
        } else if (data.role === "nurse" && data.nurses?.[0]) {
          const { data: pData } = await supabase.from("patients").select("*").eq("assigned_nurse_id", data.nurses[0].nurse_id);
          if (pData) setAssignedPatients(pData);
        }
      }
      setLoading(false);
    };
    
    fetchStaff();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!staff) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-black hover:underline">
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  const roleData = staff.role === "doctor" ? staff.doctors?.[0] : staff.nurses?.[0];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        {/* Header Card similar to PatientDetail */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-black text-2xl font-bold">
                {staff.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {staff.role === "doctor" ? "Dr. " : ""}{staff.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={14} className="text-gray-400" /> <span className="capitalize">{staff.role}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail size={14} className="text-gray-400" /> {staff.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={14} className="text-gray-400" /> {roleData?.phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-black/10 border border-gray-200 px-3 py-1.5 rounded-full text-black capitalize">
                {staff.role}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Contact Info</h3>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={18} className="text-gray-400" />
              <span>{staff.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} className="text-gray-400" />
              <span>{roleData?.phone || "Not provided"}</span>
            </div>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin size={18} className="text-gray-400 mt-0.5" />
              <span>{roleData?.address || "Not provided"}</span>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Professional Info</h3>
            <div className="flex items-center gap-3 text-gray-600">
              <Briefcase size={18} className="text-gray-400" />
              <span className="capitalize">Role: {staff.role}</span>
            </div>
            {staff.role === "doctor" && (
              <div className="flex items-center gap-3 text-gray-600">
                <User size={18} className="text-gray-400" />
                <span>Specialization: {roleData?.specialization || "General"}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} className="text-gray-400" />
              <span>Joined: {new Date(staff.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Assigned Patients Section */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mt-6">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-black" />
              Assigned Patients
            </h2>
            <span className="bg-gray-100 text-black px-3 py-1 rounded-full text-xs font-bold">
              {assignedPatients.length} Total
            </span>
          </div>
          
          <div className="p-0">
            {assignedPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-transparent border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Patient Name</th>
                      <th className="px-6 py-3 font-medium">Age / Gender</th>
                      <th className="px-6 py-3 font-medium">Condition</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedPatients.map((p) => (
                      <tr key={p.patient_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                        <td className="px-6 py-4 text-gray-500">{p.age} y/o | {p.gender}</td>
                        <td className="px-6 py-4 text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {p.disease_condition || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/patient/${p.patient_id}`}
                            className="text-black hover:text-black font-medium text-sm"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No patients assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
