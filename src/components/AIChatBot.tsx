import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Medicare AI Clinical Assistant. Ask me anything about medical conditions, treatments, or patient care." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile, session } = useAuth();
  const [patientLogs, setPatientLogs] = useState<any[]>([]);
  const [patientMeds, setPatientMeds] = useState<any[]>([]);

  useEffect(() => {
    async function loadLogsAndMeds() {
      if (profile?.role === "patient" && session?.user?.id) {
        const { data: patientData } = await supabase
          .from("patients")
          .select("patient_id")
          .eq("user_id", session.user.id)
          .single();

        if (patientData) {
          const { data: logs } = await supabase
            .from("health_logs")
            .select("sleep_hours, pain_level, heart_rate, blood_pressure, symptoms, created_at")
            .eq("patient_id", patientData.patient_id)
            .order("created_at", { ascending: false })
            .limit(5);
          setPatientLogs(logs || []);

          const { data: meds } = await supabase
            .from("medications")
            .select("medicine_name, dosage, frequency, created_at")
            .eq("patient_id", patientData.patient_id)
            .order("created_at", { ascending: false });
          setPatientMeds(meds || []);
        }
      }
    }
    loadLogsAndMeds();
  }, [profile, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_COMET_API_KEY;

      if (!apiKey) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Please add your VITE_COMET_API_KEY to the .env.local file. Get a free key at https://cometapi.com" }
          ]);
          setIsLoading(false);
        }, 500);
        return;
      }

      const formattedLogs = patientLogs.length > 0 
        ? patientLogs.map(l => `- Date: ${new Date(l.created_at).toLocaleDateString()}, Sleep: ${l.sleep_hours} hrs, Pain: ${l.pain_level}/10, Heart Rate: ${l.heart_rate} bpm, Blood Pressure: ${l.blood_pressure}, Symptoms: ${l.symptoms || "None"}`).join("\n")
        : "No logs recorded yet.";

      const formattedMeds = patientMeds.length > 0
        ? patientMeds.map(m => `- ${m.medicine_name} (Dosage: ${m.dosage}, Frequency: ${m.frequency})`).join("\n")
        : "No prescribed medications.";

      const systemMessage = {
        role: "system",
        content: `You are a health monitoring and smart medication reminder AI Assistant for a healthcare app called Medicare. The user is a ${profile?.role || "user"}.
${profile?.role === "patient" ? `Here are the patient's actual tracked daily logs for the last 5 days (newest to oldest):
${formattedLogs}

Here are the patient's prescribed medications:
${formattedMeds}

Instructions:
1. Analyze the user's daily logs including sleep hours, pain levels, and other symptoms.
2. When you detect a concerning pattern — such as declining sleep combined with increasing pain scores over 2–3 days — proactively alert the user with a clear, empathetic message explaining what pattern you noticed and why it may indicate an impending health dip. Suggest simple, actionable steps they can take before it worsens.
3. You are also a smart medication reminder assistant. Using the user's logged sleep and wake times, dynamically adjust when medication reminders should be sent so they always align with the user's actual routine — not a fixed schedule. 
   - If the user wakes up later than usual (e.g. sleeps more hours or logs wake time/sleep shifts), explain that you are delaying morning medication alerts accordingly.
   - If sleep patterns shift over several days, suggest updating the baseline reminder times.
   - Notify the user of any schedule adjustments in a brief, friendly message explaining why the reminder time changed.
4. Always base your alerts, adjustments, and analysis on the actual logged data provided above. Do not make assumptions or invent logs. Use this context to answer patient questions about their schedule, logs, or health status.` : "Be concise, professional, and helpful. Keep responses short (2-3 paragraphs max). Focus on medical and healthcare topics."}
`
      };

      const apiMessages = [
        systemMessage,
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: "user", content: userMessage }
      ];

      const response = await fetch("https://api.cometapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: apiMessages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error (${response.status})`);
      }

      const data = await response.json();

      let botResponse = "I'm sorry, I couldn't generate a response.";
      if (data.choices && data.choices[0]?.message?.content) {
        botResponse = data.choices[0].message.content.trim();
      }

      setMessages((prev) => [...prev, { role: "assistant", content: botResponse }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: error.message || "I'm sorry, I'm having trouble connecting to the AI server right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-black text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-8 pointer-events-none'
        }`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Sparkles size={18} className="text-black" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-black">Medicare AI Assistant</h3>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-black" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-black text-white" : "bg-gray-100 text-black"
                }`}
              >
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`max-w-[75%] p-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-black text-white rounded-2xl rounded-tr-sm"
                    : "bg-gray-100 text-black rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 flex-row">
              <div className="w-8 h-8 shrink-0 rounded-full bg-gray-100 text-black flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-black placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-black hover:bg-gray-800 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
