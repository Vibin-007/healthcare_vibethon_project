import { useState } from "react";
import { supabase, supabaseAdminClient } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";

interface AddUserProps {
  role: "doctor" | "nurse";
}

export default function AddUser({ role }: AddUserProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    specialization: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // 1. Create user in Supabase Auth using the secondary client
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
      setError("Failed to create user account.");
      setSubmitting(false);
      return;
    }

    // 2. Insert into users table
    const { error: insertError } = await supabase.from("users").insert([
      {
        user_id: userId,
        name: form.name,
        role: role,
        email: form.email,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // 3. Insert into doctors or nurses table
    if (role === "doctor") {
      const { error: docError } = await supabase.from("doctors").insert([
        {
          user_id: userId,
          specialization: form.specialization || null,
          phone: form.phone || null,
          address: form.address || null,
        },
      ]);
      if (docError) {
        setError(docError.message);
        setSubmitting(false);
        return;
      }
    } else if (role === "nurse") {
      const { error: nurseError } = await supabase.from("nurses").insert([
        {
          user_id: userId,
          phone: form.phone || null,
          address: form.address || null,
        },
      ]);
      if (nurseError) {
        setError(nurseError.message);
        setSubmitting(false);
        return;
      }
    }

    setSuccess(true);
    setForm({ name: "", email: "", password: "", phone: "", address: "", specialization: "" });
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
    setSubmitting(false);
  };

  const isDoctor = role === "doctor";
  const Icon = isDoctor ? Stethoscope : HeartPulse;
  const title = isDoctor ? "Add Doctor" : "Add Nurse";
  const subtitle = isDoctor
    ? "Register a new doctor into the healthcare system"
    : "Register a new nurse into the healthcare system";

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
              <Icon size={20} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <p className="text-emerald-400 text-sm font-medium">
              {role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
              <User size={14} className="text-gray-500" /> Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
              <Mail size={14} className="text-gray-500" /> Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="doctor@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
              <Lock size={14} className="text-gray-500" /> Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
              <Phone size={14} className="text-gray-500" /> Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
              <MapPin size={14} className="text-gray-500" /> Address
            </label>
            <input
              type="text"
              placeholder="123 Medical Center Dr."
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          {isDoctor && (
            <div>
              <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
                <Briefcase size={14} className="text-gray-500" /> Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Cardiology"
                value={form.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          )}

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
            {submitting ? "Creating Account..." : `Create ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
      </div>
    </Layout>
  );
}
