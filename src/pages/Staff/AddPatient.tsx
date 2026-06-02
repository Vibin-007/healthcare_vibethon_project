import { useEffect, useState } from "react";
import { supabase, supabaseAdminClient } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Stethoscope,
  Mail,
  Lock,
  MapPin
} from "lucide-react";

export default function AddPatient() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [nursesList, setNursesList] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    disease_condition: "",
    phone: "",
    address: "",
    assigned_doctor_id: "",
    assigned_nurse_id: "",
  });

  useEffect(() => {
    async function fetchStaff() {
      // Fetch users to get names mapping
      const { data: users } = await supabase.from("users").select("user_id, name");
      const userMap = (users || []).reduce((acc: any, u: any) => ({ ...acc, [u.user_id]: u.name }), {});

      const { data: docs } = await supabase.from("doctors").select("doctor_id, user_id");
      if (docs) {
        setDoctorsList(docs.map(d => ({ doctor_id: d.doctor_id, name: userMap[d.user_id] || "Unknown" })));
      }

      const { data: nurs } = await supabase.from("nurses").select("nurse_id, user_id");
      if (nurs) {
        setNursesList(nurs.map(n => ({ nurse_id: n.nurse_id, name: userMap[n.user_id] || "Unknown" })));
      }
    }
    fetchStaff();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // 1. Create user in auth
    const { data: authData, error: authError } = await supabaseAdminClient.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError("Failed to create patient account.");
      setSubmitting(false);
      return;
    }

    // 2. Insert into users table
    const { error: userError } = await supabase.from("users").insert([
      {
        user_id: userId,
        name: form.name,
        role: "patient",
        email: form.email,
      },
    ]);

    if (userError) {
      setError(userError.message);
      setSubmitting(false);
      return;
    }

    // 3. Insert into patients table
    const { error: insertError } = await supabase.from("patients").insert([
      {
        user_id: userId,
        name: form.name,
        gender: form.gender || null,
        age: Number(form.age) || null,
        disease_condition: form.disease_condition || null,
        phone: form.phone || null,
        address: form.address || null,
        assigned_doctor_id: form.assigned_doctor_id || null,
        assigned_nurse_id: form.assigned_nurse_id || null,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setCreatedCredentials({ email: form.email, password: form.password, name: form.name });
      setSuccess(true);
      setForm({ name: "", email: "", password: "", gender: "", age: "", disease_condition: "", phone: "", address: "", assigned_doctor_id: "", assigned_nurse_id: "" });
    }
    setSubmitting(false);
  };

  const handleEmailCredentials = () => {
    const subject = encodeURIComponent("Welcome to Medicare - Your Account Credentials");
    const body = encodeURIComponent(
      `Hello ${createdCredentials.name},\n\nYour account has been successfully created.\n\nLogin URL: ${window.location.origin}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\n\nPlease change your password after your first login.\n\nBest regards,\nMedicare Admin`
    );
    window.location.href = `mailto:${createdCredentials.email}?subject=${subject}&body=${body}`;
  };

  const fields = [
    { key: "name", label: "Full Name", icon: User, placeholder: "John Doe", type: "text", required: true },
    { key: "email", label: "Email Address", icon: Mail, placeholder: "patient@example.com", type: "email", required: true },
    { key: "password", label: "Password", icon: Lock, placeholder: "Create a password", type: "password", required: true },
    { key: "gender", label: "Gender", icon: HeartPulse, type: "select", options: ["", "Male", "Female", "Other"], required: false },
    { key: "age", label: "Age", icon: Calendar, placeholder: "45", type: "number", required: false },
    { key: "disease_condition", label: "Condition / Diagnosis", icon: HeartPulse, placeholder: "e.g., Hypertension", type: "text", required: false },
    { key: "phone", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 123-4567", type: "tel", required: false },
    { key: "address", label: "Address", icon: MapPin, placeholder: "123 Main St", type: "text", required: false },
    { key: "assigned_doctor_id", label: "Assign Doctor", icon: Stethoscope, type: "doctor_select", required: false },
    { key: "assigned_nurse_id", label: "Assign Nurse", icon: HeartPulse, type: "nurse_select", required: false },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-black/10 rounded-lg">
              <Stethoscope size={20} className="text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admit New Patient</h1>
              <p className="text-sm text-gray-500">
                Register a new patient into the healthcare system
              </p>
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-black/10 border border-black/20 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={24} className="text-black" />
              <h3 className="text-black text-lg font-semibold">Patient Admitted Successfully!</h3>
            </div>
            <p className="text-gray-700 text-sm">
              The patient account has been created. You can now securely email them their login credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleEmailCredentials}
                className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Mail size={16} /> Email Credentials
              </button>
              <button
                onClick={() => navigate("/patients")}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-black hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Return to Directory
              </button>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
                <field.icon size={14} className="text-gray-500" />
                {field.label}
                {field.required && <span className="text-gray-600">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black/50 transition-all"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt} className="bg-white shadow-sm">
                      {opt || "Select gender"}
                    </option>
                  ))}
                </select>
              ) : field.type === "doctor_select" ? (
                <select
                  value={form.assigned_doctor_id}
                  onChange={(e) => handleChange("assigned_doctor_id", e.target.value)}
                  className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black/50 transition-all"
                >
                  <option value="">No Doctor Assigned</option>
                  {doctorsList.map((doc) => (
                    <option key={doc.doctor_id} value={doc.doctor_id} className="bg-white shadow-sm">
                      Dr. {doc.name}
                    </option>
                  ))}
                </select>
              ) : field.type === "nurse_select" ? (
                <select
                  value={form.assigned_nurse_id}
                  onChange={(e) => handleChange("assigned_nurse_id", e.target.value)}
                  className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black/50 transition-all"
                >
                  <option value="">No Nurse Assigned</option>
                  {nursesList.map((nurse) => (
                    <option key={nurse.nurse_id} value={nurse.nurse_id} className="bg-white shadow-sm">
                      {nurse.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(form as any)[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black/50 transition-all placeholder:text-gray-600"
                  required={field.required}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-gray-800/10 border border-gray-800/20 rounded-lg">
              <AlertCircle size={16} className="text-gray-600" />
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-black/25 hover:shadow-black/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Admitting Patient..." : "Admit Patient"}
          </button>
        </form>
        )}
      </div>
    </Layout>
  );
}
