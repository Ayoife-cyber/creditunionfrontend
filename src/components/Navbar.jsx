import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm tracking-wide transition-colors hover:text-gold ${
      isActive ? "text-gold" : "text-cream/80"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-wide text-cream">
          TCS <span className="text-gold">Tumzy</span> Couture
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/collections"
            className="border border-gold text-gold px-5 py-2 text-sm tracking-wide hover:bg-gold hover:text-black transition-colors"
          >
            Request a Design
          </Link>
        </div>

        <button
          className="md:hidden text-cream text-2xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-charcoal border-t border-gold/20 px-5 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/collections"
            onClick={() => setOpen(false)}
            className="border border-gold text-gold px-5 py-2 text-sm text-center tracking-wide"
          >
            Request a Design
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
