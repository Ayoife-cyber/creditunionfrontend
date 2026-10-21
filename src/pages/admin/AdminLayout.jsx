import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineSparkles,
  HiOutlineCollection,
  HiOutlineClipboardList,
  HiOutlineLogout,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const links = [
  { to: "/admin", label: "Dashboard", icon: <HiOutlineViewGrid />, end: true },
  { to: "/admin/designs", label: "Designs", icon: <HiOutlineSparkles /> },
  { to: "/admin/categories", label: "Categories", icon: <HiOutlineCollection /> },
  { to: "/admin/requests", label: "Customer Requests", icon: <HiOutlineClipboardList /> },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
      isActive ? "bg-gold text-black" : "text-cream/70 hover:bg-charcoal hover:text-gold"
    }`;

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      <aside className="md:w-64 bg-charcoal border-b md:border-b-0 md:border-r border-gold/15 flex md:flex-col">
        <div className="p-5 border-b border-gold/10 hidden md:block">
          <p className="font-display text-xl text-cream">TCS <span className="text-gold">Admin</span></p>
          {admin && <p className="text-xs text-cream/40 mt-1">{admin.email}</p>}
        </div>
        <nav className="flex md:flex-col flex-1 overflow-x-auto">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              <span className="text-lg">{link.icon}</span>
              <span className="whitespace-nowrap">{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-cream/70 hover:text-gold border-t border-gold/10"
        >
          <HiOutlineLogout className="text-lg" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </aside>

      <main className="flex-1 p-5 md:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
