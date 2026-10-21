import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const RequestSuccess = () => {
  const location = useLocation();
  const request = location.state?.request;

  if (!request) {
    // Prevents directly visiting this route without a real submission
    return <Navigate to="/collections" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <FaCheckCircle className="text-gold text-6xl mx-auto mb-6" />
      <h1 className="font-display text-4xl text-cream mb-3">Request Submitted Successfully</h1>
      <p className="text-cream/70 mb-10">
        Thank you for choosing TCS Tumzy Couture and Styles. Your request has been received and
        our team will contact you shortly.
      </p>

      <div className="border border-gold/20 bg-charcoal/60 p-8 text-left space-y-3">
        <p className="text-gold text-sm uppercase tracking-wide">
          Request Number: <span className="text-cream">{request.requestNumber}</span>
        </p>
        <div className="gold-rule my-4" />
        <p className="text-sm text-cream/70">
          <span className="text-cream/50">Selected Design:</span> {request.designName}
        </p>
        <p className="text-sm text-cream/70">
          <span className="text-cream/50">Customer Name:</span> {request.customerName}
        </p>
        <p className="text-sm text-cream/70">
          <span className="text-cream/50">Phone:</span> {request.phone}
        </p>
        <p className="text-sm text-cream/70">
          <span className="text-cream/50">Email:</span> {request.email}
        </p>
        <p className="text-sm text-cream/70">
          <span className="text-cream/50">Request Date:</span>{" "}
          {new Date(request.createdAt).toLocaleString()}
        </p>
      </div>

      <Link
        to="/collections"
        className="inline-block mt-10 border border-gold text-gold px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold hover:text-black transition-colors"
      >
        Continue Browsing
      </Link>
    </div>
  );
};

export default RequestSuccess;
