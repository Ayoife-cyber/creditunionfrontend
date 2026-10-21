import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboardStats } from "../../api/admin.js";

const StatCard = ({ label, value }) => (
  <div className="border border-gold/15 p-6 bg-charcoal/50">
    <p className="text-cream/50 text-xs uppercase tracking-wide mb-2">{label}</p>
    <p className="font-display text-4xl text-gold">{value}</p>
  </div>
);

const statusColor = {
  New: "text-gold",
  Contacted: "text-blue-300",
  Confirmed: "text-emerald-300",
  "In Progress": "text-amber-300",
  Completed: "text-green-400",
  Cancelled: "text-red-400",
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-cream/50">Loading dashboard...</p>;

  const { stats, recentRequests } = data;

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <StatCard label="Total Designs" value={stats.totalDesigns} />
        <StatCard label="Available Designs" value={stats.availableDesigns} />
        <StatCard label="Total Requests" value={stats.totalRequests} />
        <StatCard label="New Requests" value={stats.newRequests} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      <h2 className="text-gold text-sm uppercase tracking-widest mb-4">Recent Requests</h2>
      <div className="overflow-x-auto border border-gold/15">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-charcoal text-cream/50 text-xs uppercase tracking-wide">
              <th className="text-left p-3">Request</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Design</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((r) => (
              <tr key={r._id} className="border-t border-gold/10 text-cream/80">
                <td className="p-3 whitespace-nowrap">{r.requestNumber}</td>
                <td className="p-3">{r.customerName}</td>
                <td className="p-3">{r.designName}</td>
                <td className="p-3">₦{Number(r.designPrice).toLocaleString()}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className={`p-3 ${statusColor[r.status] || ""}`}>{r.status}</td>
                <td className="p-3">
                  <Link to={`/admin/requests/${r._id}`} className="text-gold hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {recentRequests.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-cream/40">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
