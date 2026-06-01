import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Users, Search } from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPatients(data);
      });
  }, []);

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-purple-600" size={28} />
              Patients Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view all registered patients.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm placeholder:text-gray-400 text-gray-900 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Patient Name</th>
                  <th scope="col" className="px-6 py-4 font-medium">Age & Gender</th>
                  <th scope="col" className="px-6 py-4 font-medium">Phone Number</th>
                  <th scope="col" className="px-6 py-4 font-medium">Condition</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link to={`/patient/${p.patient_id}`} className="hover:text-purple-600 transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {p.age || "-"} y/o, {p.gender || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {p.disease_condition || "Routine"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/patient/${p.patient_id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 bg-white">
                      <Users size={32} className="mx-auto text-gray-300 mb-3" />
                      <p>No patients found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
