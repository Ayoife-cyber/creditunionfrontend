import React from "react";
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

const Contact = () => (
  <div className="max-w-4xl mx-auto px-5 md:px-8 py-20">
    <div className="text-center mb-14">
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Get In Touch</p>
      <h1 className="font-display text-5xl text-cream">Contact TCS Tumzy Couture and Styles</h1>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
      {[
        { icon: <FaPhone />, label: "Phone", value: "+234 800 000 0000" },
        { icon: <FaWhatsapp />, label: "WhatsApp", value: "+234 800 000 0000" },
        { icon: <FaEnvelope />, label: "Email", value: "hello@tcstumzycouture.com" },
        { icon: <FaMapMarkerAlt />, label: "Location", value: "Lagos, Nigeria" },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-4 border border-gold/15 p-6">
          <span className="text-gold text-xl">{item.icon}</span>
          <div>
            <p className="text-xs uppercase tracking-wide text-cream/50">{item.label}</p>
            <p className="text-cream">{item.value}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="flex justify-center gap-6 text-2xl text-cream/70 mb-14">
      <a href="#" aria-label="Instagram" className="hover:text-gold"><FaInstagram /></a>
      <a href="#" aria-label="Facebook" className="hover:text-gold"><FaFacebookF /></a>
      <a href="#" aria-label="TikTok" className="hover:text-gold"><FaTiktok /></a>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="mailto:hello@tcstumzycouture.com"
        className="bg-gold text-black px-8 py-3 text-sm tracking-widest uppercase text-center hover:bg-gold-dark transition-colors"
      >
        Contact Us
      </a>
      <a
        href="https://wa.me/2348000000000"
        target="_blank"
        rel="noreferrer"
        className="border border-gold text-gold px-8 py-3 text-sm tracking-widest uppercase text-center hover:bg-gold hover:text-black transition-colors"
      >
        Chat on WhatsApp
      </a>
    </div>
  </div>
);

export default Contact;
