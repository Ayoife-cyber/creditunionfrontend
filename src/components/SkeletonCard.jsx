import React from "react";

const SkeletonCard = () => (
  <div className="border border-gold/10">
    <div className="skeleton aspect-[3/4]" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-3 w-1/4" />
    </div>
  </div>
);

export default SkeletonCard;
