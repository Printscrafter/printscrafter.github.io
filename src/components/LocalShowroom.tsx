import React from 'react';
import { MapPin, Phone, Clock, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

export const LocalShowroom: React.FC = () => {
  return (
    <section id="location" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Details */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Printscrafter Lagos Studio
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              Experience our fine wall art canvases, interactive smart LED prints, and luxury framing options in person. Book an appointment or consult directly with our wall art interior specialists.
            </p>

            <div className="space-y-3.5 pt-2 text-xs text-slate-700">
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-slate-900">Gallery Studio Address:</strong>
                  <span>Lekki Phase 1, Lagos State, Nigeria</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-slate-900">Direct Phone & WhatsApp:</strong>
                  <a 
                    href="https://wa.me/2348154224416" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:underline text-emerald-700 font-semibold inline-flex items-center gap-1 mt-0.5"
                  >
                    +234 815 422 4416
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold text-slate-900">Visiting Hours:</strong>
                  <span>Monday – Saturday: 9:00 AM – 6:00 PM (WAT)</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/2348154224416?text=Hello%20Printscrafter%2C%20I%20would%20like%20to%20schedule%20a%20studio%20visit%20in%20Lekki%20Phase%201."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl text-xs transition-all shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Book a Private Studio Consultation</span>
              </a>
            </div>
          </div>

          {/* Map Embed */}
          <div className="lg:col-span-7 bg-slate-100 rounded-3xl p-2.5 border border-slate-200 shadow-xl overflow-hidden">
            <div className="w-full h-84 sm:h-96 rounded-2xl overflow-hidden relative">
              <iframe
                title="Printscrafter Studio Location Lagos"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.725916056637!2d3.47227!3d6.45407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf4cc1534b41b%3A0x6b87d29486ad9a8b!2sLekki%20Phase%201%2C%20Lagos!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
                className="w-full h-full border-0 rounded-2xl"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
