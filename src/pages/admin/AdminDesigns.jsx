import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchDesigns } from "../../api/designs.js";
import { deleteDesign, updateDesign } from "../../api/admin.js";

const AdminDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchDesigns()
      .then((data) => setDesigns(data.designs))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggleAvailability = async (design) => {
    const formData = new FormData();
    formData.append("available", (!design.available).toString());
    try {
      await updateDesign(design._id, formData);
      toast.success(`Marked as ${!design.available ? "available" : "unavailable"}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update design");
    }
  };

  const handleToggleFeatured = async (design) => {
    const formData = new FormData();
    formData.append("featured", (!design.featured).toString());
    try {
      await updateDesign(design._id, formData);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update design");
    }
  };

  const handleDelete = async (design) => {
    if (!window.confirm(`Delete "${design.name}"? This cannot be undone.`)) return;
    try {
      await deleteDesign(design._id);
      toast.success("Design deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete design");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-cream">Designs</h1>
        <Link
          to="/admin/designs/new"
          className="bg-gold text-black px-5 py-2 text-sm tracking-wide uppercase hover:bg-gold-dark transition-colors"
        >
          + Add New Design
        </Link>
      </div>

      {loading ? (
        <p className="text-cream/50">Loading designs...</p>
      ) : (
        <div className="overflow-x-auto border border-gold/15">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-charcoal text-cream/50 text-xs uppercase tracking-wide">
                <th className="text-left p-3">Image</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Available</th>
                <th className="text-left p-3">Featured</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((d) => (
                <tr key={d._id} className="border-t border-gold/10 text-cream/80">
                  <td className="p-3">
                    <img src={d.mainImage?.url} alt={d.name} className="w-12 h-14 object-cover" />
                  </td>
                  <td className="p-3">{d.name}</td>
                  <td className="p-3">{d.category?.name}</td>
                  <td className="p-3">₦{Number(d.price).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleAvailability(d)}
                      className={`text-xs px-3 py-1 border ${
                        d.available ? "border-gold text-gold" : "border-cream/20 text-cream/40"
                      }`}
                    >
                      {d.available ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleFeatured(d)}
                      className={`text-xs px-3 py-1 border ${
                        d.featured ? "border-gold text-gold" : "border-cream/20 text-cream/40"
                      }`}
                    >
                      {d.featured ? "Featured" : "Not Featured"}
                    </button>
                  </td>
                  <td className="p-3 space-x-3 whitespace-nowrap">
                    <Link to={`/admin/designs/${d._id}/edit`} className="text-gold hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(d)} className="text-red-400 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {designs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-cream/40">
                    No designs yet — add your first design.
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

export default AdminDesigns;
