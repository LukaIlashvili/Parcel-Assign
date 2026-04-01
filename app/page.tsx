"use client";
import { useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  name: string;
}

interface Parcel {
  id: number;
  tracking_number: string;
  user_id: number | null;
  user?: User;
}

export default function Dashboard() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'pending' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedParcelId, setSelectedParcelId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const endpoint = view === 'pending' ? "/api/parcels" : "/api/parcels/all";
      const [parcelRes, userRes] = await Promise.all([
        fetch(endpoint),
        fetch("/api/users")
      ]);

      const parcelsData = await parcelRes.json();
      const usersData = await userRes.json();
      
      setParcels(parcelsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async () => {
    if (!selectedParcelId || !selectedUserId) return;
    try {
      const response = await fetch("/api/parcels/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcel_id: selectedParcelId,
          user_id: Number(selectedUserId)
        })
      });

      if (response.ok) {
        setParcels(prev => prev.filter(p => p.id !== selectedParcelId));
        setSelectedParcelId(null);
        setSelectedUserId("");
      }
    } catch (error) {
      alert("Failed to assign parcel");
    }
  };

  const handleUnassign = async (parcelId: number) => {
    if (!confirm("Unassign this parcel?")) return;
    try {
      const response = await fetch("/api/parcels/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcel_id: parcelId, user_id: null })
      });
      if (response.ok) fetchData();
    } catch (error) {
      alert("Failed to unassign");
    }
  };

    // Filter logic for the search bar
  const filteredParcels = parcels.filter(p => {
    const matchesSearch = p.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (view === 'pending') {
      return matchesSearch && p.user_id === null;
    } else {
      return matchesSearch && p.user_id !== null;
    }
  });

  if (loading) return <div className="p-20 text-center font-bold text-indigo-600">Loading SwiftCode Assets...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-slate-900">
      <header className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-indigo-900 tracking-tight">SwiftCode</h1>
          <p className="text-gray-500">Parcel Management System</p>
        </div>

        {/* Search and Tabs Container */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search tracking #..." 
            className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="bg-gray-200 p-1 rounded-lg flex shadow-inner">
            <button 
              onClick={() => setView('pending')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${view === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}
            >
              History
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left min-w-[460px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Tracking #</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Resident / Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredParcels.map((parcel) => (
              <tr key={parcel.id} className="hover:bg-indigo-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-bold text-indigo-600">{parcel.tracking_number}</span>
                </td>
                <td className="px-6 py-4">
                  {parcel.user ? (
                    <div>
                      <p className="text-sm font-bold">{parcel.user.name}</p>
                      <p className="text-xs text-gray-400">Resident</p>
                    </div>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {view === 'history' && parcel.user ? (
                    <button 
                      onClick={() => handleUnassign(parcel.id)}
                      className="text-red-500 text-sm font-semibold hover:underline"
                    >
                      Unassign
                    </button>
                  ) : selectedParcelId === parcel.id ? (
                    <div className="flex items-center gap-2 justify-end">
                      <select 
                        className="border rounded-md p-1.5 text-sm bg-white shadow-sm"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                      >
                        <option value="">Choose User</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <button onClick={handleAssign} className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm">Confirm</button>
                      <button onClick={() => setSelectedParcelId(null)} className="text-gray-400 text-xs">Cancel</button>
                    </div>
                  ) : (
                    <button 
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition cursor-pointer"
                      onClick={() => setSelectedParcelId(parcel.id)}
                    >
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredParcels.length === 0 && (
          <div className="p-20 text-center text-gray-400">No parcels found.</div>
        )}
      </div>
    </div>
  );
}