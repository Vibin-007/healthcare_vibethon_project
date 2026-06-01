import { useState } from "react";
import { supabase, supabaseAdminClient } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
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
  MapPin,
} from "lucide-react";

export default function AddPatient() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    disease_condition: "",
    phone: "",
    address: "",
  });

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
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setForm({ name: "", email: "", password: "", gender: "", age: "", disease_condition: "", phone: "", address: "" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
    setSubmitting(false);
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
            <div className="p-2 bg-purple-600/10 rounded-lg">
              <Stethoscope size={20} className="text-purple-600" />
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
          <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <p className="text-emerald-400 text-sm font-medium">Patient admitted successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
                <field.icon size={14} className="text-gray-500" />
                {field.label}
                {field.required && <span className="text-red-400">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt} className="bg-white shadow-sm">
                      {opt || "Select gender"}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(form as any)[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                  required={field.required}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Admitting Patient..." : "Admit Patient"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
