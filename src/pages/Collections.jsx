import React, { useEffect, useMemo, useState } from "react";
import { fetchDesigns, fetchCategories } from "../api/designs.js";
import DesignCard from "../components/DesignCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

const Collections = () => {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== "all") params.category = activeCategory;
    if (search.trim()) params.search = search.trim();

    const timeout = setTimeout(() => {
      fetchDesigns(params)
        .then((data) => setDesigns(data.designs))
        .catch(() => setDesigns([]))
        .finally(() => setLoading(false));
    }, 300); // light debounce for search typing

    return () => clearTimeout(timeout);
  }, [activeCategory, search]);

  const tabs = useMemo(
    () => [{ slug: "all", name: "All" }, ...categories],
    [categories]
  );

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
      <div className="text-center mb-12">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Browse</p>
        <h1 className="font-display text-5xl text-cream mb-4">Collections</h1>
        <p className="text-cream/60 max-w-xl mx-auto">
          Explore every design created by TCS Tumzy Couture and Styles.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveCategory(tab.slug)}
              className={`px-4 py-2 text-xs tracking-wide uppercase border transition-colors ${
                activeCategory === tab.slug
                  ? "bg-gold text-black border-gold"
                  : "border-cream/20 text-cream/70 hover:border-gold hover:text-gold"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category..."
          className="w-full md:w-72 bg-charcoal border border-cream/20 text-cream text-sm px-4 py-2 focus:outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : designs.map((design) => <DesignCard key={design._id} design={design} />)}
      </div>

      {!loading && designs.length === 0 && (
        <EmptyState
          title="No designs found"
          subtitle="Try a different category or search term."
        />
      )}
    </div>
  );
};

export default Collections;
