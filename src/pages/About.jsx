import React from "react";

const About = () => (
  <div className="max-w-4xl mx-auto px-5 md:px-8 py-20">
    <div className="text-center mb-14">
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Our Story</p>
      <h1 className="font-display text-5xl text-cream">About TCS Tumzy Couture and Styles</h1>
    </div>

    <p className="text-cream/70 leading-relaxed text-lg text-center mb-16">
      TCS Tumzy Couture and Styles is dedicated to creating elegant, beautifully crafted fashion
      pieces that celebrate individuality, confidence, and timeless style.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
      <div>
        <h3 className="font-display text-2xl text-gold mb-3">Brand Story</h3>
        <p className="text-cream/60 text-sm leading-relaxed">
          Rooted in a passion for premium African couture, every piece we create tells a story
          of heritage, elegance, and modern sophistication.
        </p>
      </div>
      <div>
        <h3 className="font-display text-2xl text-gold mb-3">Craftsmanship</h3>
        <p className="text-cream/60 text-sm leading-relaxed">
          Each design is crafted with meticulous attention to detail, quality fabric, and expert
          tailoring.
        </p>
      </div>
      <div>
        <h3 className="font-display text-2xl text-gold mb-3">Custom Designs</h3>
        <p className="text-cream/60 text-sm leading-relaxed">
          From ready-to-wear pieces to fully custom measurements, we tailor every request to fit
          you perfectly.
        </p>
      </div>
    </div>
  </div>
);

export default About;
