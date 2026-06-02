// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { Stethoscope, Shield, Clock, HeartPulse } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <nav className="border-b border-gray-200 bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/20 rounded-lg text-black">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-bold tracking-wide">MediCare Hospital</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-black/20 text-sm"
        >
          Login
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Advanced Healthcare, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-800">
              Compassionate Care
            </span>
          </h1>
          <p className="text-gray-500 text-lg">
            Providing world-class medical services with state-of-the-art facilities, AI-driven insights, and a team of dedicated healthcare professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white shadow-sm border border-gray-200 p-8 rounded-2xl hover:border-gray-400 transition-colors">
            <Shield className="text-black mb-5" size={36} />
            <h3 className="text-xl font-bold mb-3">Excellence in Care</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Top-tier medical professionals and advanced diagnostic tools to ensure the best patient outcomes and personalized treatment plans.
            </p>
          </div>
          
          <div className="bg-white shadow-sm border border-gray-200 p-8 rounded-2xl hover:border-gray-400 transition-colors">
            <Clock className="text-black mb-5" size={36} />
            <h3 className="text-xl font-bold mb-3">24/7 Monitoring</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Continuous patient monitoring systems and round-the-clock emergency support for ultimate peace of mind.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 p-8 rounded-2xl hover:border-gray-400 transition-colors">
            <HeartPulse className="text-black mb-5" size={36} />
            <h3 className="text-xl font-bold mb-3">Patient Portal</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Seamless access to track daily vitals, view AI-generated health insights, and manage medical records securely.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}