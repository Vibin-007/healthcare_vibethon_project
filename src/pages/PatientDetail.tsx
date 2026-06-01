import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import {
  ArrowLeft,
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Phone,
  Calendar,
  User,
  AlertTriangle,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Patient {
  patient_id: string;
  name: string;
  gender: string;
  age: number;
  disease_condition: string;
  phone: string;
  created_at: string;
  user_id: string;
}

interface VitalsRecord {
  id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate: number;
  temperature: number;
  oxygen_saturation: number;
  respiratory_rate: number;
  weight: number;
  notes: string;
  recorded_at: string;
}



export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");

  useEffect(() => {
    async function load() {
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("patient_id", id)
        .single();

      if (patientData) {
        setPatient(patientData);
        const { data: vitalsData } = await supabase
          .from("vitals")
          .select("*")
          .eq("patient_id", id)
          .order("recorded_at", { ascending: true });
        setVitals(vitalsData || []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

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
          <button
            onClick={() => navigate("/dashboard")}
            className="text-purple-600 hover:text-purple-600 text-sm mt-2 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const latestVitals = vitals[vitals.length - 1];

  const latestMetrics = [
    { label: "Heart Rate", value: latestVitals?.heart_rate, unit: "bpm", icon: HeartPulse, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Temperature", value: latestVitals?.temperature, unit: "°F", icon: Thermometer, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "SpO2", value: latestVitals?.oxygen_saturation, unit: "%", icon: Wind, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Respiratory", value: latestVitals?.respiratory_rate, unit: "brpm", icon: Droplets, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const chartData = vitals.map((v) => ({
    time: new Date(v.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    heartRate: v.heart_rate,
    systolic: v.blood_pressure_systolic,
    diastolic: v.blood_pressure_diastolic,
    temperature: v.temperature,
    oxygenSaturation: v.oxygen_saturation,
  }));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-600 text-2xl font-bold">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={14} className="text-gray-500" /> {patient.gender || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-500" /> {patient.age} years
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={14} className="text-gray-500" /> {patient.phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-600/10 border border-purple-200 px-3 py-1.5 rounded-full text-purple-600">
                {patient.disease_condition || "General"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {latestMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white shadow-sm border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{metric.label}</span>
                <div className={`p-1.5 rounded-lg ${metric.bg}`}>
                  <metric.icon size={16} className={metric.color} />
                </div>
              </div>
              {metric.value ? (
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                  <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
                </p>
              ) : (
                <p className="text-gray-600 text-sm">No data</p>
              )}
            </div>
          ))}
        </div>

        {vitals.length > 0 && (
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
              <button
                onClick={() => setActiveTab("chart")}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === "chart"
                    ? "text-purple-600 border-b-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === "table"
                    ? "text-purple-600 border-b-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                History Table
              </button>
            </div>

            <div className="p-5">
              {activeTab === "chart" ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Heart Rate Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                        <YAxis stroke="#475569" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "#1a1f35",
                            border: "1px solid #1e293b",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="heartRate"
                          stroke="#ef4444"
                          fill="url(#hrGradient)"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444", r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Blood Pressure Over Time</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                        <YAxis stroke="#475569" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "#1a1f35",
                            border: "1px solid #1e293b",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: "#8b5cf6", r: 3 }}
                          name="Systolic"
                        />
                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={{ fill: "#06b6d4", r: 3 }}
                          name="Diastolic"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Temperature</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={12} />
                        <YAxis stroke="#475569" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "#1a1f35",
                            border: "1px solid #1e293b",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="temperature"
                          stroke="#f59e0b"
                          fill="url(#tempGradient)"
                          strokeWidth={2}
                          dot={{ fill: "#f59e0b", r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium">Date</th>
                        <th className="text-left py-3 px-2 font-medium">Heart Rate</th>
                        <th className="text-left py-3 px-2 font-medium">BP Systolic</th>
                        <th className="text-left py-3 px-2 font-medium">BP Diastolic</th>
                        <th className="text-left py-3 px-2 font-medium">Temp</th>
                        <th className="text-left py-3 px-2 font-medium">SpO2</th>
                        <th className="text-left py-3 px-2 font-medium">Resp Rate</th>
                        <th className="text-left py-3 px-2 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitals.map((v) => (
                        <tr key={v.id} className="border-b border-gray-200/50 text-gray-600 hover:bg-white/[0.02]">
                          <td className="py-3 px-2 text-gray-500">
                            {new Date(v.recorded_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">{v.heart_rate}</td>
                          <td className="py-3 px-2">{v.blood_pressure_systolic}</td>
                          <td className="py-3 px-2">{v.blood_pressure_diastolic}</td>
                          <td className="py-3 px-2">{v.temperature}</td>
                          <td className="py-3 px-2">{v.oxygen_saturation}</td>
                          <td className="py-3 px-2">{v.respiratory_rate}</td>
                          <td className="py-3 px-2 text-gray-500 max-w-[200px] truncate">{v.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {vitals.length === 0 && (
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-12 text-center">
            <Activity size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No vitals recorded yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Log vitals to see patient health trends
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
