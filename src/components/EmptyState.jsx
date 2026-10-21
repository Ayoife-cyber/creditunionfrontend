import React from "react";

const EmptyState = ({ title, subtitle }) => (
  <div className="text-center py-20 border border-gold/10">
    <p className="font-display text-2xl text-cream mb-2">{title}</p>
    {subtitle && <p className="text-cream/50 text-sm">{subtitle}</p>}
  </div>
);

export default EmptyState;
