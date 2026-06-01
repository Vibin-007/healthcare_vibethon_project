import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      const { data, error } = await supabase
        .from("patients")
        .select("*");

      console.log("Patients Data:", data);
      console.log("Patients Error:", error);

      if (error) {
        console.error(error);
      } else {
        setPatients(data || []);
      }

      setLoading(false);
    }

    loadPatients();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Patients</h1>

      {patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
        patients.map((patient) => (
          <div
            key={patient.patient_id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{patient.name}</h3>
            <p>Age: {patient.age}</p>
            <p>Gender: {patient.gender}</p>
            <p>Phone: {patient.phone}</p>
            <p>Address: {patient.address}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;