import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchDesignByIdOrSlug } from "../api/designs.js";
import { submitRequest } from "../api/requests.js";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Custom Measurement"];
const MEASUREMENT_FIELDS = [
  ["bust", "Bust"],
  ["waist", "Waist"],
  ["hip", "Hip"],
  ["shoulder", "Shoulder"],
  ["sleeveLength", "Sleeve Length"],
  ["dressLength", "Dress Length"],
  ["trouserLength", "Trouser Length"],
  ["topLength", "Top Length"],
  ["neck", "Neck"],
  ["thigh", "Thigh"],
  ["armhole", "Armhole"],
];

const inputClass =
  "w-full bg-charcoal border border-cream/20 text-cream text-sm px-4 py-3 focus:outline-none focus:border-gold";
const labelClass = "block text-xs uppercase tracking-wide text-cream/60 mb-2";

const RequestForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [loadingDesign, setLoadingDesign] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referenceFile, setReferenceFile] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    whatsapp: "",
    preferredSize: "",
    preferredColor: "",
    quantity: 1,
    preferredDate: "",
    notes: "",
  });

  const [measurements, setMeasurements] = useState({});

  useEffect(() => {
    fetchDesignByIdOrSlug(slug)
      .then((data) => setDesign(data.design))
      .catch(() => setDesign(null))
      .finally(() => setLoadingDesign(false));
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (key, value) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setReferenceFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerName || !form.email || !form.phone || !form.preferredSize) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("customerName", form.customerName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("whatsapp", form.whatsapp);
      formData.append("designId", design._id);
      formData.append("quantity", form.quantity || 1);
      formData.append("preferredSize", form.preferredSize);
      formData.append("preferredColor", form.preferredColor);
      if (form.preferredDate) formData.append("preferredDate", form.preferredDate);
      formData.append("notes", form.notes);

      if (form.preferredSize === "Custom Measurement") {
        formData.append("measurements", JSON.stringify(measurements));
      }
      if (referenceFile) {
        formData.append("referenceImage", referenceFile);
      }

      const data = await submitRequest(formData);
      navigate("/request-success", { state: { request: data.request } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDesign) {
    return <div className="max-w-3xl mx-auto px-5 py-24 text-center text-cream/50">Loading...</div>;
  }

  if (!design) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <p className="text-cream/60 mb-4">We couldn't find that design.</p>
        <Link to="/collections" className="text-gold underline">Back to Collections</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16">
      <div className="text-center mb-10">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">Custom Request</p>
        <h1 className="font-display text-4xl text-cream">Request This Design</h1>
      </div>

      {/* Selected design summary */}
      <div className="flex items-center gap-5 border border-gold/20 bg-charcoal/60 p-5 mb-10">
        <img
          src={design.mainImage?.url}
          alt={design.name}
          className="w-20 h-24 object-cover flex-shrink-0"
        />
        <div>
          <p className="text-xs text-cream/50 uppercase tracking-wide">You're Requesting</p>
          <h2 className="font-display text-2xl text-cream">{design.name}</h2>
          <p className="text-gold">₦{Number(design.price).toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Customer information */}
        <div>
          <h3 className="text-gold text-sm uppercase tracking-widest mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number (optional)</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Request details */}
        <div>
          <h3 className="text-gold text-sm uppercase tracking-widest mb-4">Request Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Preferred Size *</label>
              <select name="preferredSize" value={form.preferredSize} onChange={handleChange} required className={inputClass}>
                <option value="">Select size</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Preferred Color</label>
              <input
                name="preferredColor"
                value={form.preferredColor}
                onChange={handleChange}
                list="color-options"
                className={inputClass}
              />
              <datalist id="color-options">
                {design.colors?.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Preferred Date (optional)</label>
              <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="mt-5">
            <label className={labelClass}>Additional Instructions</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us anything else you would like us to know about your request..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Custom measurements */}
        {form.preferredSize === "Custom Measurement" && (
          <div>
            <h3 className="text-gold text-sm uppercase tracking-widest mb-4">Custom Measurements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {MEASUREMENT_FIELDS.map(([key, label]) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements[key] || ""}
                    onChange={(e) => handleMeasurementChange(key, e.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference image */}
        <div>
          <label className={labelClass}>Upload Reference Image (Optional)</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="block w-full text-sm text-cream/70 file:mr-4 file:py-2 file:px-4 file:border file:border-gold file:bg-transparent file:text-gold file:text-xs file:uppercase file:tracking-wide"
          />
          {referenceFile && <p className="text-cream/50 text-xs mt-2">{referenceFile.name}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gold text-black py-4 text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;
