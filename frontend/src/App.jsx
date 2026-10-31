
import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.message);
      })
      .catch(() => {
        setStatus("Backend connection failed");
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-slate-900">
          JanSeva Connect
        </h1>

        <p className="text-slate-500 mt-2">
          Accessible Public Services & Grievance Resolution Platform
        </p>

        <div className="mt-8 rounded-xl bg-slate-100 p-4">
          <p className="font-semibold text-slate-800">
            Backend Status
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {status}
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;
