import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: apiError } = await supabase.auth.signInWithPassword({ email, password });

    if (apiError) {
      setError(apiError.message);
    } else if (data.user) {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 bg-dot-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-black/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl border border-neutral-200/80 bg-white shadow-2xl shadow-neutral-100 relative z-10 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 p-2 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-xl transition-all duration-300"
          title="Back to Landing Page"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Logo Section */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="p-3.5 bg-black text-white rounded-2xl shadow-md mb-3">
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Medicare Portal</h1>
          <p className="text-neutral-400 text-xs mt-1">Clinical Decision Support & Vitals Tracking</p>
        </div>

        {/* Title */}
        <div className="space-y-1 border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-bold text-neutral-900">Welcome back</h2>
          <p className="text-neutral-400 text-xs">Enter credentials to authenticate secure session.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                placeholder="doctor@medicare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-neutral-900 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm placeholder:text-neutral-400 shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-neutral-900 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm placeholder:text-neutral-400 shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl">
              <p className="text-red-700 text-xs font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Authenticating Session..." : "Secure Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}