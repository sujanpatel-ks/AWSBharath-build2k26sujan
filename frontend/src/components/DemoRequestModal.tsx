import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Send, Phone, Mail, MapPin, User, Sprout, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [farmSize, setFarmSize] = useState('2-5 acres');
  const [crop, setCrop] = useState('Tomato & Potato');
  const [location, setLocation] = useState('Tumkur, Karnataka');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [demoId, setDemoId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedCrop = crop.trim();

    if (trimmedName.length < 2) {
      toast.error('Please provide a name with at least 2 characters.');
      return;
    }
    if (trimmedPhone && !/^\+?91?[6-9]\d{9}$/.test(trimmedPhone.replace(/[\s-]/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!trimmedPhone && !trimmedEmail) {
      toast.error('Please enter a phone number or email address for contact.');
      return;
    }
    if (!trimmedCrop) {
      toast.error('Please provide your primary crop.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone || undefined,
          email: trimmedEmail || undefined,
          farmSize,
          crop: trimmedCrop,
          location
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit demo request.');
      }

      setIsSuccess(true);
      setDemoId(data.demoId);
      toast.success('Demo request received! Our agronomy team will connect with you.');
    } catch (err: any) {
      toast.error(err.message || 'Error scheduling demo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setDemoId(null);
    setName('');
    setPhone('');
    setEmail('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles size={18} className="text-emerald-300" />
            </div>
            <div>
              <h3 id="demo-modal-title" className="font-semibold text-base leading-tight">
                Request an AgroCare AI Live Demo
              </h3>
              <p className="text-xs text-emerald-200/80">
                Experience AI-guided crop pathology & multi-agent decision support
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-stone-900">Demo Session Booked!</h4>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                  Thank you, <strong className="text-stone-800">{name}</strong>. Reference ID: <span className="font-mono text-emerald-700">{demoId}</span>. Our agronomy specialist will contact you via {phone || email} within 24 hours.
                </p>
              </div>
              <button
                onClick={handleResetAndClose}
                className="px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl text-sm font-medium hover:bg-[#1B4332] transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-[#2D6A4F]" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 focus:border-[#2D6A4F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="demo-phone" className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Phone size={13} className="text-[#2D6A4F]" /> Mobile Number
                  </label>
                  <input
                    id="demo-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label htmlFor="demo-email" className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Mail size={13} className="text-[#2D6A4F]" /> Email Address
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="demo-crop" className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Sprout size={13} className="text-[#2D6A4F]" /> Primary Crop
                  </label>
                  <input
                    id="demo-crop"
                    type="text"
                    required
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#2D6A4F]" /> Location / District
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Farm Size / Land Area
                </label>
                <select
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 focus:border-[#2D6A4F]"
                >
                  <option value="< 2 acres">Smallholder (&lt; 2 acres)</option>
                  <option value="2-5 acres">Medium (2 - 5 acres)</option>
                  <option value="5-15 acres">Commercial (5 - 15 acres)</option>
                  <option value="> 15 acres">Large Estate (&gt; 15 acres)</option>
                  <option value="FPO / Agri-Enterprise">FPO / Farmer Producer Org</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1B4332] transition-colors flex items-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Request Guided Demo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoRequestModal;
