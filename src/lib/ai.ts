export interface VitalsData {
  heart_rate: number;
  blood_pressure: string;
  sleep_hours: number;
  pain_level: number;
  symptoms?: string;
}

/**
 * AI Triage Engine
 * Analyzes patient vitals and specific disease conditions to generate clinical insights and alerts.
 * This function currently uses a local advanced rules engine, but is architected to be 
 * easily swapped with a real LLM endpoint (like Google Gemini or HuggingFace) in the future.
 */
export async function generateVitalsInsight(vitals: VitalsData, condition: string): Promise<string | null> {
  // Simulate AI network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const insights: string[] = [];
  const hr = vitals.heart_rate;
  const pain = vitals.pain_level;
  
  // Parse BP (e.g. "120/80")
  let sys = 120, dia = 80;
  if (vitals.blood_pressure && vitals.blood_pressure.includes('/')) {
    const parts = vitals.blood_pressure.split('/');
    sys = parseInt(parts[0]);
    dia = parseInt(parts[1]);
  }

  const cond = (condition || "").toLowerCase();

  // AI Logic: Heart Rate
  if (hr > 100) {
    if (cond.includes('cardio') || cond.includes('heart')) {
      insights.push(`CRITICAL: Tachycardia detected (HR ${hr} bpm) in a patient with a cardiac history. Immediate evaluation recommended.`);
    } else {
      insights.push(`Elevated heart rate (${hr} bpm) detected. Monitor for potential stress or infection.`);
    }
  } else if (hr < 50) {
    insights.push(`Bradycardia detected (HR ${hr} bpm). Ensure patient is not symptomatic.`);
  }

  // AI Logic: Blood Pressure
  if (sys > 160 || dia > 100) {
    if (cond.includes('hypertension')) {
      insights.push(`Severe hypertensive spike (${sys}/${dia}). Current hypertension management plan may be failing.`);
    } else {
      insights.push(`Warning: Stage 2 Hypertension levels reached (${sys}/${dia}). Require immediate re-check.`);
    }
  } else if (sys < 90 || dia < 60) {
    insights.push(`Hypotension detected (${sys}/${dia}). High risk of dizziness or falls.`);
  }

  // AI Logic: Pain & Symptoms
  if (pain >= 8) {
    insights.push(`Severe pain reported (${pain}/10). Analgesic intervention strongly recommended.`);
  }

  if (vitals.symptoms && vitals.symptoms.toLowerCase().includes("chest")) {
    insights.push(`EMERGENCY: Patient reported chest symptoms. Immediate physician review required.`);
  }

  // Return the highest priority insight, or null if everything is perfectly normal
  if (insights.length > 0) {
    // Return the first (most critical) insight generated
    return insights.join(' ');
  }
  
  // If no critical alerts, generate a positive reinforcement summary if sleep is good
  if (vitals.sleep_hours >= 7 && sys < 130 && hr > 60 && hr < 90) {
    return `Patient is stable. Vitals are within optimal ranges and sleep quality is adequate.`;
  }

  return null;
}

export interface HistoricalLog {
  sleep_hours: number;
  pain_level: number;
  heart_rate: number;
  blood_pressure: string;
  created_at: string;
}

export function detectImpendingHealthDip(logs: HistoricalLog[]): string | null {
  if (logs.length < 2) return null;
  
  // Sort logs by date descending (newest first)
  const sorted = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const current = sorted[0];
  const previous = sorted[1];
  
  const sleepDrop = previous.sleep_hours - current.sleep_hours;
  const painUptick = current.pain_level - previous.pain_level;
  
  if (sleepDrop >= 1 && painUptick >= 2) {
    return `⚠️ Impending Health Dip Flagged: A drop of ${sleepDrop.toFixed(1)} sleep hours combined with an uptick of ${painUptick} in pain level suggests a potential health decline. We recommend scheduling an early check-in or adjusting therapy.`;
  }
  
  return null;
}

export interface SmartReminder {
  medicine_name: string;
  original_time: string;
  adjusted_time: string;
  reason: string;
  priority: "high" | "normal";
}

export function getSmartMedicationReminders(medications: any[], latestLog: any): SmartReminder[] {
  if (!latestLog) return [];
  
  const sleep = latestLog.sleep_hours;
  const pain = latestLog.pain_level;
  
  return medications.map(med => {
    let originalTime = "08:00 AM";
    let adjustedTime = "08:00 AM";
    let reason = "Scheduled on standard wake pattern.";
    let priority: "high" | "normal" = "normal";
    
    const nameLower = med.medicine_name.toLowerCase();
    
    // Set standard times based on frequency
    if (med.frequency.toLowerCase().includes("night") || med.frequency.toLowerCase().includes("evening") || med.frequency.toLowerCase().includes("pm")) {
      originalTime = "09:00 PM";
      adjustedTime = "09:00 PM";
    }
    
    // Adjust based on sleep pattern (Feature 4)
    if (sleep < 6) {
      if (originalTime.includes("AM")) {
        adjustedTime = "09:30 AM";
        reason = `Delayed by 1.5 hours due to poor sleep (${sleep} hrs) to reduce stomach irritation and coordinate with delayed breakfast.`;
        priority = "high";
      } else {
        adjustedTime = "08:30 PM";
        reason = `Advanced by 30 mins to allow earlier rest after poor sleep.`;
      }
    } else if (sleep > 9) {
      if (originalTime.includes("AM")) {
        adjustedTime = "10:00 AM";
        reason = `Shifted later by 2 hours due to prolonged sleep (${sleep} hrs) to align with actual waking time.`;
      }
    }
    
    // Prioritize high-risk meds if pain is high
    if (pain > 6 && (nameLower.includes("pain") || nameLower.includes("para") || nameLower.includes("ibu") || nameLower.includes("aspirin"))) {
      priority = "high";
      reason = `Priority elevated: Current pain level is high (${pain}/10). Take promptly with food.`;
    }
    
    return {
      medicine_name: med.medicine_name,
      original_time: originalTime,
      adjusted_time: adjustedTime,
      reason,
      priority
    };
  });
}
