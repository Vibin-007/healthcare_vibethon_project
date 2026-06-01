import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generateVitalsInsight } from "../lib/ai";
import Layout from "../components/Layout";
import {
  ArrowLeft,
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Activity,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Patient {
  name: string;
  patient_id: string;
  disease_condition: string;
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
    heart_rate: "",
    blood_pressure: "",
    sleep_hours: "",
    pain_level: "",
    symptoms: "",
    notes: "",
  });

  useEffect(() => {
    async function loadPatient() {
      const { data } = await supabase
        .from("patients")
        .select("name, patient_id, disease_condition")
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
    const { data: profile } = await supabase.from("users").select("role").eq("user_id", session?.user?.id).single();
    
    let doctor_id = null;
    let nurse_id = null;
    
    if (profile?.role === "doctor") {
      const { data: dData } = await supabase.from("doctors").select("doctor_id").eq("user_id", session?.user?.id).single();
      doctor_id = dData?.doctor_id;
    } else if (profile?.role === "nurse") {
      const { data: nData } = await supabase.from("nurses").select("nurse_id").eq("user_id", session?.user?.id).single();
      nurse_id = nData?.nurse_id;
    }

    const { data: insertedLog, error: insertError } = await supabase.from("health_logs").insert([
      {
        patient_id: id,
        doctor_id: doctor_id,
        nurse_id: nurse_id,
        heart_rate: Number(vitals.heart_rate),
        blood_pressure: vitals.blood_pressure,
        sleep_hours: Number(vitals.sleep_hours),
        pain_level: Number(vitals.pain_level),
        symptoms: vitals.symptoms || null,
        notes: vitals.notes || null,
        log_date: new Date().toISOString().split("T")[0]
      },
    ]).select().single();

    if (insertError) {
      setError(insertError.message);
    } else {
      // AI Triage Analysis
      if (insertedLog && patient) {
        const insightMsg = await generateVitalsInsight({
          heart_rate: Number(vitals.heart_rate),
          blood_pressure: vitals.blood_pressure,
          sleep_hours: Number(vitals.sleep_hours),
          pain_level: Number(vitals.pain_level),
          symptoms: vitals.symptoms,
        }, patient.disease_condition);
        
        if (insightMsg) {
          await supabase.from("ai_insights").insert([
            {
              patient_id: id,
              log_id: insertedLog.log_id,
              insight_message: insightMsg,
            }
          ]);
        }
      }

      setSuccess(true);
      setVitals({
        heart_rate: "",
        blood_pressure: "",
        sleep_hours: "",
        pain_level: "",
        symptoms: "",
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
    { key: "heart_rate", label: "Heart Rate", unit: "bpm", icon: HeartPulse, placeholder: "72", color: "text-red-400", type: "number" },
    { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg", icon: Activity, placeholder: "120/80", color: "text-purple-400", type: "text" },
    { key: "sleep_hours", label: "Sleep Hours", unit: "hrs", icon: Wind, placeholder: "8", color: "text-amber-400", type: "number" },
    { key: "pain_level", label: "Pain Level", unit: "/10", icon: Droplets, placeholder: "3", color: "text-cyan-400", type: "number" },
    { key: "symptoms", label: "Symptoms", unit: "", icon: Thermometer, placeholder: "Headache, nausea...", color: "text-emerald-400", type: "text" },
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
                    type={field.type}
                    step="any"
                    placeholder={field.placeholder}
                    value={(vitals as any)[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-200 text-gray-900 px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                    required={field.key !== "symptoms"}
                  />
                  {field.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                      {field.unit}
                    </span>
                  )}
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
