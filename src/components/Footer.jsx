import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from "react-icons/fa";

const Footer = () => (
  <footer className="bg-charcoal border-t border-gold/20 mt-24">
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div>
        <h3 className="font-display text-2xl text-cream mb-2">TCS Tumzy Couture</h3>
        <p className="text-gold text-sm italic">Elegance Designed For You.</p>
      </div>

      <div>
        <h4 className="text-gold text-sm tracking-widest uppercase mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm text-cream/70">
          <li><Link to="/" className="hover:text-gold">Home</Link></li>
          <li><Link to="/collections" className="hover:text-gold">Collections</Link></li>
          <li><Link to="/about" className="hover:text-gold">About</Link></li>
          <li><Link to="/how-it-works" className="hover:text-gold">How It Works</Link></li>
          <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-gold text-sm tracking-widest uppercase mb-4">Contact</h4>
        <ul className="space-y-2 text-sm text-cream/70">
          <li>Phone: +234 800 000 0000</li>
          <li>WhatsApp: +234 800 000 0000</li>
          <li>Email: hello@tcstumzycouture.com</li>
        </ul>
      </div>

      <div>
        <h4 className="text-gold text-sm tracking-widest uppercase mb-4">Follow Us</h4>
        <div className="flex gap-4 text-cream/70 text-lg">
          <a href="#" aria-label="Instagram" className="hover:text-gold"><FaInstagram /></a>
          <a href="#" aria-label="Facebook" className="hover:text-gold"><FaFacebookF /></a>
          <a href="#" aria-label="TikTok" className="hover:text-gold"><FaTiktok /></a>
          <a href="#" aria-label="WhatsApp" className="hover:text-gold"><FaWhatsapp /></a>
        </div>
      </div>
    </div>

    <div className="gold-rule" />
    <p className="text-center text-xs text-cream/40 py-6">
      © {new Date().getFullYear()} TCS Tumzy Couture and Styles. All Rights Reserved.
    </p>
  </footer>
);

export default Footer;
