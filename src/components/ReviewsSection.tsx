import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      initials: 'OA',
      name: 'Olanrewaju A.',
      location: 'Lekki Phase 1, Lagos',
      color: 'bg-brand-600',
      text: '"The Dining Room view rendering feature on Printscrafter let me preview the exact gold-framed canvas above our dining set before purchasing. The finish is stunning."'
    },
    {
      initials: 'SK',
      name: 'Sophia K.',
      location: 'London, UK',
      color: 'bg-slate-900',
      text: '"The Smart LED canvas reacts to our acoustic music setup effortlessly. Testing framing on the white room studio preview gave complete confidence for international delivery."'
    },
    {
      initials: 'MD',
      name: 'Marcus D.',
      location: 'New York, USA',
      color: 'bg-indigo-600',
      text: '"As an interior architect, I specify Printscrafter for luxury residential spaces. Their ChromaLuxe HD metal prints and custom photo upload fidelity are unmatched."'
    }
  ];

  return (
    <section id="reviews" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Trusted By Interior Designers &amp; Art Connoisseurs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 p-7 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex text-amber-400 gap-1 text-sm mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  {r.text}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs`}>
                  {r.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{r.name}</h4>
                  <span className="text-xs text-slate-400">{r.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
