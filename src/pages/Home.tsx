import { useNavigate } from "react-router-dom";
import { Stethoscope, Shield, Clock, HeartPulse, Sparkles, Activity, AlertCircle, ArrowRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black bg-dot-grid relative flex flex-col">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-black/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[400px] bg-black/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Announcement */}
      <div className="bg-black text-white py-2.5 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2 border-b border-gray-900">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Medicare AI-Driven Vitals Monitoring System is now live
      </div>

      {/* Header / Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-xl">
            <Stethoscope size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight font-sans">Medicare</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="bg-black hover:bg-neutral-800 text-white px-5 py-2 rounded-xl font-medium transition-all duration-300 text-sm shadow-sm flex items-center gap-2"
        >
          Access Portal <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 relative z-10 w-full">
        <div className="flex-1 space-y-8 text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800">
            <Sparkles size={12} className="text-black animate-spin-slow" />
            Empowering Care Teams with AI
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight">
            Advanced Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-black">
              Intelligent Alerts.
            </span>
          </h1>
          
          <p className="text-neutral-500 text-base md:text-lg leading-relaxed max-w-xl">
            A premium patient vitals dashboard pairing real-time clinical logging with predictive wellness warnings, adaptive medication scheduling, and automated triage.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={() => navigate("/login")}
              className="bg-black hover:bg-neutral-800 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-neutral-200 flex items-center justify-center gap-2 text-sm"
            >
              Sign In to Dashboard <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              className="px-6 py-3.5 rounded-xl border border-neutral-200 text-neutral-800 font-semibold hover:bg-neutral-50 transition-all duration-300 text-center text-sm"
            >
              Explore Capabilities
            </a>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-100">
            <div>
              <p className="text-2xl font-bold">99.8%</p>
              <p className="text-xs text-neutral-400 font-medium">Uptime Guarantee</p>
            </div>
            <div>
              <p className="text-2xl font-bold">2.4m+</p>
              <p className="text-xs text-neutral-400 font-medium">Logs Tracked</p>
            </div>
            <div>
              <p className="text-2xl font-bold">&lt; 3s</p>
              <p className="text-xs text-neutral-400 font-medium">AI Triage Speed</p>
            </div>
          </div>
        </div>

        {/* Live Interface Preview Widget */}
        <div className="flex-1 w-full lg:max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl shadow-neutral-100/70 relative">
          <div className="absolute -top-3 -right-3 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <Activity size={10} className="animate-pulse" /> Live Telemetry
          </div>

          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-sm">
                V
              </div>
              <div>
                <h4 className="font-bold text-sm text-neutral-900">Vibin (Patient)</h4>
                <p className="text-[10px] text-neutral-400">ID: PAT-90812</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wide rounded-md border border-red-100 flex items-center gap-1">
              <AlertCircle size={10} /> Urgent Care
            </span>
          </div>

          <div className="space-y-4">
            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Heart Rate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold">112</span>
                  <span className="text-[10px] text-neutral-400 font-medium">bpm</span>
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Blood Pressure</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold">142/95</span>
                  <span className="text-[10px] text-neutral-400 font-medium">mmHg</span>
                </div>
              </div>
            </div>

            {/* AI Warning Box */}
            <div className="p-4 bg-neutral-950 text-white rounded-2xl border border-neutral-900 shadow-inner relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-white/10 rounded-lg text-white mt-0.5">
                  <Sparkles size={14} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold tracking-wide">Impending Health Dip Warning</h5>
                  <p className="text-[10px] text-neutral-300 leading-relaxed">
                    Sleep hours dropped 4.2h and pain level increased from 2 to 7 over the last 3 days. Recommend active medication adjustment.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-neutral-100 bg-neutral-50">
                <span className="font-semibold text-neutral-800">Dynamic Med Alert Delay</span>
                <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  +45 mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Capabilities Section */}
      <section id="features" className="bg-neutral-50 border-t border-neutral-100 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Full Care Suite Capabilities</h2>
            <p className="text-neutral-500 text-sm">
              Medicare integrates key components required to execute clinical precision at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
              <div className="p-3 bg-neutral-100 rounded-2xl w-fit">
                <Shield className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-bold">Secure Telemetry</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Log and monitor heart rate, blood pressure, sleep cycles, and daily pain indexes on a clean, centralized timeline.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
              <div className="p-3 bg-neutral-100 rounded-2xl w-fit">
                <Clock className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-bold">Adaptive Alerting</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                AI algorithms proactively compute patient health status changes, alerting staff to critical health dips before they manifest.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
              <div className="p-3 bg-neutral-100 rounded-2xl w-fit">
                <HeartPulse className="text-black" size={24} />
              </div>
              <h3 className="text-xl font-bold">Integrated AI Chatbot</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Provides patients with instant medication timings adjustments, symptom evaluation, and empathetic health guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white py-8 px-6 text-center text-xs text-neutral-400 relative z-10">
        <p>&copy; {new Date().getFullYear()} Medicare Inc. All rights reserved. Premium Clinical Software.</p>
      </footer>
    </div>
  );
}