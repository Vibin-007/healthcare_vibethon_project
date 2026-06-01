import { supabase } from './src/lib/supabase';
async function test() {
  const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(1);
  console.log("Latest Patient:", data);
  console.log("Error:", error);
}
test();
