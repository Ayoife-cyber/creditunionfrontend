import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchCategories } from "../../api/designs.js";
import { createCategory, updateCategory, deleteCategory } from "../../api/admin.js";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const load = () => {
    setLoading(true);
    fetchCategories()
      .then((data) => setCategories(data.categories))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ name: name.trim() });
      setName("");
      toast.success("Category added");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const saveEdit = async (id) => {
    try {
      await updateCategory(id, { name: editingName });
      setEditingId(null);
      toast.success("Category updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat._id);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-cream mb-8">Categories</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 bg-charcoal border border-cream/20 text-cream text-sm px-4 py-3 focus:outline-none focus:border-gold"
        />
        <button type="submit" className="bg-gold text-black px-6 py-3 text-sm uppercase tracking-wide hover:bg-gold-dark transition-colors">
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-cream/50">Loading categories...</p>
      ) : (
        <div className="border border-gold/15 divide-y divide-gold/10">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between p-4">
              {editingId === cat._id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 bg-charcoal border border-gold/40 text-cream text-sm px-3 py-2 mr-3 focus:outline-none"
                />
              ) : (
                <span className="text-cream">{cat.name}</span>
              )}

              <div className="flex gap-3 text-sm whitespace-nowrap">
                {editingId === cat._id ? (
                  <>
                    <button onClick={() => saveEdit(cat._id)} className="text-gold hover:underline">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-cream/50 hover:underline">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} className="text-gold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(cat)} className="text-red-400 hover:underline">Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="p-6 text-center text-cream/40">No categories yet — add your first one above.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
