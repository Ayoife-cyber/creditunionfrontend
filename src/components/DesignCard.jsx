import React from "react";
import { Link } from "react-router-dom";

const DesignCard = ({ design }) => {
  const { slug, name, category, price, available, mainImage } = design;

  return (
    <div className="group border border-gold/15 bg-charcoal/40 hover:border-gold/50 transition-colors">
      <Link to={`/design/${slug}`} className="block relative overflow-hidden aspect-[3/4]">
        <img
          src={mainImage?.url}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {!available && (
          <span className="absolute top-3 right-3 bg-black/80 text-cream/80 text-xs px-3 py-1 tracking-wide">
            Currently Unavailable
          </span>
        )}
      </Link>

      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-gold/80 mb-1">
          {category?.name}
        </p>
        <h3 className="font-display text-xl text-cream mb-1">{name}</h3>
        <p className="text-gold text-sm mb-4">₦{Number(price).toLocaleString()}</p>

        <div className="flex gap-3">
          <Link
            to={`/design/${slug}`}
            className="flex-1 text-center border border-cream/30 text-cream/80 text-xs py-2 tracking-wide hover:border-gold hover:text-gold transition-colors"
          >
            View Details
          </Link>
          <Link
            to={available ? `/request/${slug}` : "#"}
            aria-disabled={!available}
            className={`flex-1 text-center text-xs py-2 tracking-wide transition-colors ${
              available
                ? "bg-gold text-black hover:bg-gold-dark"
                : "bg-cream/10 text-cream/30 pointer-events-none"
            }`}
          >
            Request This Design
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DesignCard;
