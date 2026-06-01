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
