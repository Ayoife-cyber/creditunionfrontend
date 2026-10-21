import React from "react";
import { Link } from "react-router-dom";

const steps = [
  { num: "01", title: "Explore", text: "Browse our latest designs and collections." },
  { num: "02", title: "Choose", text: "Select the outfit you love and view all its details." },
  { num: "03", title: "Send Your Request", text: "Provide your contact details and preferences." },
  { num: "04", title: "We'll Contact You", text: "Our team will contact you to discuss your request and next steps." },
];

const HowItWorks = () => (
  <div className="max-w-5xl mx-auto px-5 md:px-8 py-20">
    <div className="text-center mb-16">
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Simple Process</p>
      <h1 className="font-display text-5xl text-cream">How It Works</h1>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
      {steps.map((step) => (
        <div key={step.num} className="text-center">
          <p className="font-display text-6xl text-gold/40 mb-3">{step.num}</p>
          <h3 className="font-display text-xl text-cream mb-2">{step.title}</h3>
          <p className="text-cream/60 text-sm">{step.text}</p>
        </div>
      ))}
    </div>

    <div className="text-center">
      <Link
        to="/collections"
        className="bg-gold text-black px-10 py-3 text-sm tracking-widest uppercase hover:bg-gold-dark transition-colors"
      >
        Explore Our Designs
      </Link>
    </div>
  </div>
);

export default HowItWorks;
