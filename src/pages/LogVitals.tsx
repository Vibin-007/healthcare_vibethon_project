import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import {
  ArrowLeft,
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Weight,
  Activity,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Patient {
  name: string;
  patient_id: string;
}

export default function LogVitals() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [vitals, setVitals] = useState({
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    temperature: "",
    oxygen_saturation: "",
    respiratory_rate: "",
    weight: "",
    notes: "",
  });

  useEffect(() => {
    async function loadPatient() {
      const { data } = await supabase
        .from("patients")
        .select("name, patient_id")
        .eq("patient_id", id)
        .single();
      if (data) setPatient(data);
      setLoading(false);
    }
    loadPatient();
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setVitals((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();

    const { error: insertError } = await supabase.from("vitals").insert([
      {
        patient_id: id,
        recorded_by: session?.user?.id,
        blood_pressure_systolic: Number(vitals.blood_pressure_systolic),
        blood_pressure_diastolic: Number(vitals.blood_pressure_diastolic),
        heart_rate: Number(vitals.heart_rate),
        temperature: Number(vitals.temperature),
        oxygen_saturation: Number(vitals.oxygen_saturation),
        respiratory_rate: Number(vitals.respiratory_rate),
        weight: Number(vitals.weight) || null,
        notes: vitals.notes || null,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setVitals({
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        temperature: "",
        oxygen_saturation: "",
        respiratory_rate: "",
        weight: "",
        notes: "",
      });
      setTimeout(() => setSuccess(false), 3000);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-16">
          <AlertTriangle size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Patient not found</p>
          <button onClick={() => navigate("/dashboard")} className="text-purple-600 hover:text-purple-600 text-sm mt-2 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const fields = [
    { key: "heart_rate", label: "Heart Rate", unit: "bpm", icon: HeartPulse, placeholder: "72", color: "text-red-400" },
    { key: "blood_pressure_systolic", label: "Systolic BP", unit: "mmHg", icon: Activity, placeholder: "120", color: "text-purple-400" },
    { key: "blood_pressure_diastolic", label: "Diastolic BP", unit: "mmHg", icon: Activity, placeholder: "80", color: "text-purple-400" },
    { key: "temperature", label: "Temperature", unit: "°F", icon: Thermometer, placeholder: "98.6", color: "text-amber-400" },
    { key: "oxygen_saturation", label: "Oxygen Saturation", unit: "%", icon: Wind, placeholder: "98", color: "text-cyan-400" },
    { key: "respiratory_rate", label: "Respiratory Rate", unit: "brpm", icon: Droplets, placeholder: "16", color: "text-emerald-400" },
    { key: "weight", label: "Weight", unit: "kg", icon: Weight, placeholder: "70", color: "text-gray-500" },
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
              <h1 className="text-xl font-bold text-gray-900">Log Vitals</h1>
              <p className="text-sm text-gray-500">
                Recording vitals for <span className="text-gray-900 font-medium">{patient.name}</span>
              </p>
            </div>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <p className="text-emerald-400 text-sm font-medium">Vitals recorded successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
                  <field.icon size={14} className={field.color} />
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    placeholder={field.placeholder}
                    value={(vitals as any)[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                    required={field.key !== "weight"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                    {field.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Notes</label>
            <textarea
              placeholder="Additional observations..."
              value={vitals.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Record Vitals"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
