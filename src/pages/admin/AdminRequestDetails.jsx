import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchAdminRequestById, updateRequestStatus } from "../../api/admin.js";

const STATUSES = ["New", "Contacted", "Confirmed", "In Progress", "Completed", "Cancelled"];

const Field = ({ label, value }) =>
  value !== undefined && value !== null && value !== "" ? (
    <div>
      <p className="text-xs uppercase tracking-wide text-cream/50">{label}</p>
      <p className="text-cream">{value}</p>
    </div>
  ) : null;

const AdminRequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAdminRequestById(id)
      .then((data) => setRequest(data.request))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setUpdating(true);
    try {
      await updateRequestStatus(id, status);
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-cream/50">Loading request...</p>;
  if (!request) return <p className="text-cream/50">Request not found.</p>;

  const m = request.measurements || {};
  const hasMeasurements = Object.values(m).some((v) => v !== undefined && v !== null && v !== "");

  return (
    <div className="max-w-3xl">
      <Link to="/admin/requests" className="text-gold text-sm hover:underline">← Back to Requests</Link>

      <h1 className="font-display text-3xl text-cream mt-4 mb-8">
        Request #{request.requestNumber}
      </h1>

      <div className="mb-8">
        <label className="block text-xs uppercase tracking-wide text-cream/50 mb-2">Request Status</label>
        <select
          value={request.status}
          onChange={handleStatusChange}
          disabled={updating}
          className="bg-charcoal border border-gold/40 text-gold text-sm px-4 py-2 focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        <div className="border border-gold/15 p-6 space-y-4">
          <h2 className="text-gold text-sm uppercase tracking-widest mb-2">Customer Information</h2>
          <Field label="Name" value={request.customerName} />
          <Field label="Email" value={request.email} />
          <Field label="Phone" value={request.phone} />
          <Field label="WhatsApp" value={request.whatsapp} />
        </div>

        <div className="border border-gold/15 p-6 space-y-4">
          <h2 className="text-gold text-sm uppercase tracking-widest mb-2">Design</h2>
          {request.design?.mainImage?.url && (
            <img src={request.design.mainImage.url} alt={request.designName} className="w-20 h-24 object-cover mb-2" />
          )}
          <Field label="Design Name" value={request.designName} />
          <Field label="Category" value={request.design?.category?.name} />
          <Field label="Price" value={`₦${Number(request.designPrice).toLocaleString()}`} />
          <Field label="Quantity" value={request.quantity} />
          <Field label="Preferred Size" value={request.preferredSize} />
          <Field label="Preferred Color" value={request.preferredColor} />
          <Field label="Preferred Date" value={request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : null} />
        </div>
      </div>

      {hasMeasurements && (
        <div className="border border-gold/15 p-6 mb-10">
          <h2 className="text-gold text-sm uppercase tracking-widest mb-4">Measurements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Bust" value={m.bust} />
            <Field label="Waist" value={m.waist} />
            <Field label="Hip" value={m.hip} />
            <Field label="Shoulder" value={m.shoulder} />
            <Field label="Sleeve Length" value={m.sleeveLength} />
            <Field label="Dress Length" value={m.dressLength} />
            <Field label="Trouser Length" value={m.trouserLength} />
            <Field label="Top Length" value={m.topLength} />
            <Field label="Neck" value={m.neck} />
            <Field label="Thigh" value={m.thigh} />
            <Field label="Armhole" value={m.armhole} />
          </div>
        </div>
      )}

      {request.notes && (
        <div className="border border-gold/15 p-6 mb-10">
          <h2 className="text-gold text-sm uppercase tracking-widest mb-3">Customer Notes</h2>
          <p className="text-cream/80 italic">"{request.notes}"</p>
        </div>
      )}

      {request.referenceImage?.url && (
        <div className="border border-gold/15 p-6 mb-10">
          <h2 className="text-gold text-sm uppercase tracking-widest mb-3">Reference Image</h2>
          <a href={request.referenceImage.url} target="_blank" rel="noreferrer">
            <img src={request.referenceImage.url} alt="Customer reference" className="w-40 h-48 object-cover border border-gold/20" />
          </a>
        </div>
      )}

      <p className="text-xs text-cream/40">
        Submitted {new Date(request.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default AdminRequestDetails;
