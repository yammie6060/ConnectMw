"use client";

import React, { useState } from "react";
import { MapPin, Mail, Phone, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react";

const contactInfo = [
  { icon: MapPin, text: "Lilongwe, Malawi", color: "#f5ab20" },
  { icon: Mail, text: "support@connectmw.mw", color: "#ec4899", href: "mailto:connectmw265@gmail.com" },
  { icon: Phone, text: "+265 (0) 983933510", color: "#10b981", href: "tel:+265983933510" },
  { icon: MessageCircle, text: "WhatsApp Business available", color: "#25D366", href: "https://wa.me/265983933510" },
];

const topics = [
  "Listing a Property (HomeConnect)",
  "Listing my Beauty Business",
  "Listing Auto Spares",
  "Partnership Enquiry",
  "General Support",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Send data to your API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      // Success
      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        topic: "",
        message: "",
      });
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <section
      id="contact"
      className="px-[10%] py-[100px] relative"
      style={{ background: "#132333" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-pink-500/5 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Contact Info */}
          <div>
            <div className="sticky top-20">
              <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-2">
                Get In Touch
              </p>
              <h2
                className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold tracking-[-1px] leading-[1.15] mb-3 text-white"
                style={{ fontFamily: "sans-serif" }}
              >
                Let&apos;s Talk Business
              </h2>
              <p className="text-[#cde0f0] font-light leading-[1.7] text-sm max-w-[440px] mb-8">
                Want to list your property, partner with us, or have questions about
                Connect<span style={{ color: "#f5ab20" }}>MW</span>? We&apos;d love to hear from you.
              </p>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((item, idx) => {
                  const Icon = item.icon;
                  const content = (
                    <div
                      className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:translate-x-1"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                          border: `1px solid ${item.color}40`,
                        }}
                      >
                        <Icon size={20} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#cde0f0] text-sm font-medium break-words">
                          {item.text}
                        </p>
                        {idx === 2 && (
                          <p className="text-xs text-[#8ca5bc] mt-0.5">
                            Mon-Fri, 9AM - 5PM
                          </p>
                        )}
                        {idx === 3 && (
                          <p className="text-xs text-[#8ca5bc] mt-0.5">
                            Response within 24 hours
                          </p>
                        )}
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a
                      key={idx}
                      href={item.href}
                      target={item.href.startsWith('http') ? "_blank" : undefined}
                      rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                      className="block cursor-pointer no-underline"
                      aria-label={`Contact us via ${item.text}`}
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={idx}>{content}</div>
                  );
                })}
              </div>

              {/* Company Info */}
              <div className="mt-10 p-6 rounded-xl" style={{
                background: "linear-gradient(135deg, rgba(245,166,35,0.05), transparent)",
                border: "1px solid rgba(245,166,35,0.1)",
              }}>
                <p className="text-[0.82rem] text-[#8ca5bc] mb-1">
                  A product of DigiRise Limited
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-[#f5ab20] border border-[#f5ab20]/20">
                    Est. 2025
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-[#f5ab20] border border-[#f5ab20]/20">
                    Malawian Owned
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-8 lg:p-10 transition-all duration-300 hover:shadow-2xl"
            style={{
              background: "#1a2e42",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            noValidate
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-8 rounded-full bg-[#f5ab20]" />
              <h3
                className="text-[1.3rem] font-bold text-white"
                style={{ fontFamily: "sans-serif" }}
              >
                Send Us a Message
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 flex-col sm:flex-row">
              <FormGroup label="First Name" htmlFor="firstName">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Tawonga"
                  className="form-input"
                  required
                  disabled={isLoading}
                  aria-required="true"
                />
              </FormGroup>
              <FormGroup label="Last Name" htmlFor="lastName">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Mbewe"
                  className="form-input"
                  required
                  disabled={isLoading}
                  aria-required="true"
                />
              </FormGroup>
            </div>

            <FormGroup label="Email Address" htmlFor="email">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
                required
                disabled={isLoading}
                aria-required="true"
              />
            </FormGroup>

            <FormGroup label="I'm interested in" htmlFor="topic">
              <select 
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading}
                aria-required="true"
              >
                <option value="">Select a topic...</option>
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Message" htmlFor="message">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us how we can help..."
                rows={5}
                className="form-input resize-y"
                required
                disabled={isLoading}
                aria-required="true"
              />
            </FormGroup>

            <button
              type="submit"
              disabled={isLoading || submitted}
              className="group w-full py-3.5 rounded-full text-base font-bold text-[#0d1f2d] bg-[#f5ab20] border-none transition-all duration-300 hover:bg-[#e8941a] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,166,35,0.35)] cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : submitted ? (
                <>
                  <CheckCircle size={18} />
                  Message Sent! ✓
                </>
              ) : (
                <>
                  Send Message
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-[#8ca5bc] text-center mt-4">
              We'll get back to you within 24-48 hours
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          padding: 0.75rem 1rem;
          font-family: "DM Sans", sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: #f5ab20;
          background: rgba(245, 166, 35, 0.05);
          box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
        }
        .form-input::placeholder {
          color: #6b8a9f;
        }
        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        select.form-input {
          cursor: pointer;
          appearance: auto;
        }
        select.form-input option {
          background: #1a2e42;
          color: white;
        }
        textarea.form-input {
          font-family: "DM Sans", sans-serif;
        }
        .form-input.error {
          border-color: #ef4444;
        }
      `}</style>
    </section>
  );
}

function FormGroup({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-4 flex-1">
      <label 
        htmlFor={htmlFor}
        className="text-[0.8rem] font-medium text-[#8ca5bc]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}