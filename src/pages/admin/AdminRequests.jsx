import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminRequests } from "../../api/admin.js";

const STATUSES = ["New", "Contacted", "Confirmed", "In Progress", "Completed", "Cancelled"];
const statusColor = {
  New: "text-gold",
  Contacted: "text-blue-300",
  Confirmed: "text-emerald-300",
  "In Progress": "text-amber-300",
  Completed: "text-green-400",
  Cancelled: "text-red-400",
};

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (search.trim()) params.search = search.trim();

    const timeout = setTimeout(() => {
      fetchAdminRequests(params)
        .then((data) => setRequests(data.requests))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [status, search]);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-8">Customer Requests</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, request number, or design..."
          className="flex-1 bg-charcoal border border-cream/20 text-cream text-sm px-4 py-3 focus:outline-none focus:border-gold"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-charcoal border border-cream/20 text-cream text-sm px-4 py-3 focus:outline-none focus:border-gold"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-cream/50">Loading requests...</p>
      ) : (
        <div className="overflow-x-auto border border-gold/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-charcoal text-cream/50 text-xs uppercase tracking-wide">
                <th className="text-left p-3">Request #</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Design</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-t border-gold/10 text-cream/80">
                  <td className="p-3 whitespace-nowrap">{r.requestNumber}</td>
                  <td className="p-3">{r.customerName}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.phone}</td>
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
              {requests.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-cream/40">
                    No requests match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
