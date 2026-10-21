import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchDesignByIdOrSlug, fetchCategories } from "../../api/designs.js";
import { createDesign, updateDesign } from "../../api/admin.js";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Custom Measurement"];
const inputClass =
  "w-full bg-charcoal border border-cream/20 text-cream text-sm px-4 py-3 focus:outline-none focus:border-gold";
const labelClass = "block text-xs uppercase tracking-wide text-cream/60 mb-2";

const AdminDesignForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    colors: "",
    sizes: [],
    fabric: "",
    available: true,
    featured: false,
  });

  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [existingMainUrl, setExistingMainUrl] = useState("");

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchDesignByIdOrSlug(id).then((data) => {
      const d = data.design;
      setForm({
        name: d.name,
        description: d.description,
        category: d.category?._id || "",
        price: d.price,
        colors: (d.colors || []).join(", "),
        sizes: d.sizes || [],
        fabric: d.fabric || "",
        available: d.available,
        featured: d.featured,
      });
      setExistingMainUrl(d.mainImage?.url || "");
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.category || !form.price) {
      toast.error("Please fill in name, description, category and price");
      return;
    }
    if (!isEdit && !mainImage) {
      toast.error("A main image is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append(
        "colors",
        JSON.stringify(form.colors.split(",").map((c) => c.trim()).filter(Boolean))
      );
      formData.append("sizes", JSON.stringify(form.sizes));
      formData.append("fabric", form.fabric);
      formData.append("available", form.available.toString());
      formData.append("featured", form.featured.toString());
      if (mainImage) formData.append("mainImage", mainImage);
      additionalImages.forEach((file) => formData.append("additionalImages", file));

      if (isEdit) {
        await updateDesign(id, formData);
        toast.success("Design updated");
      } else {
        await createDesign(formData);
        toast.success("Design published");
      }
      navigate("/admin/designs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save design");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-cream/50">Loading design...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-cream mb-8">
        {isEdit ? "Edit Design" : "Add New Design"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass}>Design Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (₦) *</label>
            <input type="number" min="0" name="price" value={form.price} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Available Colors (comma-separated)</label>
          <input name="colors" value={form.colors} onChange={handleChange} placeholder="Wine, Gold, Emerald" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Available Sizes</label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 text-xs border ${
                  form.sizes.includes(size) ? "bg-gold text-black border-gold" : "border-cream/20 text-cream/60"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Fabric Information</label>
          <input name="fabric" value={form.fabric} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Main Image {isEdit ? "(leave blank to keep current)" : "*"}</label>
          {existingMainUrl && !mainImage && (
            <img src={existingMainUrl} alt="Current main" className="w-24 h-28 object-cover mb-3" />
          )}
          <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} className="text-sm text-cream/70" />
        </div>

        <div>
          <label className={labelClass}>Additional Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setAdditionalImages(Array.from(e.target.files).slice(0, 5))}
            className="text-sm text-cream/70"
          />
        </div>

        <div className="flex gap-8">
          <label className="flex items-center gap-2 text-sm text-cream/70">
            <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm text-cream/70">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Featured Design
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-gold text-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Publish Design"}
        </button>
      </form>
    </div>
  );
};

export default AdminDesignForm;
