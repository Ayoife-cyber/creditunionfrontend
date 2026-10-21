import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchDesignByIdOrSlug } from "../api/designs.js";
import EmptyState from "../components/EmptyState.jsx";

const DesignDetails = () => {
  const { slug } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchDesignByIdOrSlug(slug)
      .then((data) => {
        setDesign(data.design);
        setActiveImage(0);
      })
      .catch(() => setDesign(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-5 py-24 text-center text-cream/50">Loading design...</div>;
  }

  if (!design) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-24">
        <EmptyState title="Design not found" subtitle="It may have been removed or renamed." />
      </div>
    );
  }

  const gallery = [design.mainImage, ...(design.additionalImages || [])];

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Gallery */}
      <div>
        <div className="aspect-[3/4] overflow-hidden border border-gold/15 mb-4">
          <img
            src={gallery[activeImage]?.url}
            alt={design.name}
            className="w-full h-full object-cover"
          />
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-3 overflow-x-auto">
            {gallery.map((img, i) => (
              <button
                key={img.publicId || i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-24 flex-shrink-0 border overflow-hidden ${
                  activeImage === i ? "border-gold" : "border-cream/20"
                }`}
              >
                <img src={img.url} alt={`${design.name} view ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <p className="text-gold text-xs uppercase tracking-widest mb-2">{design.category?.name}</p>
        <h1 className="font-display text-4xl text-cream mb-3">{design.name}</h1>
        <p className="text-gold text-2xl mb-6">₦{Number(design.price).toLocaleString()}</p>

        <p className="text-cream/70 leading-relaxed mb-8">{design.description}</p>

        <div className="space-y-4 mb-8 text-sm">
          {design.colors?.length > 0 && (
            <div>
              <span className="text-cream/50 uppercase tracking-wide text-xs">Available Colors: </span>
              <span className="text-cream">{design.colors.join(", ")}</span>
            </div>
          )}
          {design.sizes?.length > 0 && (
            <div>
              <span className="text-cream/50 uppercase tracking-wide text-xs">Available Sizes: </span>
              <span className="text-cream">{design.sizes.join(", ")}</span>
            </div>
          )}
          {design.fabric && (
            <div>
              <span className="text-cream/50 uppercase tracking-wide text-xs">Fabric: </span>
              <span className="text-cream">{design.fabric}</span>
            </div>
          )}
          <div>
            <span className="text-cream/50 uppercase tracking-wide text-xs">Availability: </span>
            <span className={design.available ? "text-gold" : "text-cream/40"}>
              {design.available ? "Available" : "Currently Unavailable"}
            </span>
          </div>
        </div>

        {design.available ? (
          <Link
            to={`/request/${design.slug}`}
            className="inline-block bg-gold text-black px-10 py-3 text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors"
          >
            Request This Design
          </Link>
        ) : (
          <span className="inline-block bg-cream/10 text-cream/30 px-10 py-3 text-sm tracking-widest uppercase cursor-not-allowed">
            Currently Unavailable
          </span>
        )}
      </div>
    </div>
  );
};

export default DesignDetails;
