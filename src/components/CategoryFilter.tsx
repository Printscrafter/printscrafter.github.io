import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
}

const CATEGORIES: { label: string; value: Category; icon: string }[] = [
  { label: 'All Works', value: 'All', icon: '✨' },
  { label: 'Abstract Portraits', value: 'Abstract Portraits', icon: '👤' },
  { label: 'Contemporary Paintings', value: 'Contemporary Paintings', icon: '🎨' },
  { label: 'Minimalist Line Art', value: 'Minimalist Line Art', icon: '✏️' },
  { label: 'Shape & Abstract', value: 'Shape & Abstract', icon: '📐' },
  { label: 'Functional Wall Decor', value: 'Functional Wall Decor', icon: '🛋️' },
  { label: 'Smart LED Art', value: 'LED & Smart Art', icon: '⚡' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <section id="categories" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">
            Curated Printscrafter Catalogue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Contemporary SVG paintings, minimalist line art, bohemian shape abstracts &amp; functional acoustic/clock wall decor.
          </p>
        </div>

        {/* Horizontal scrollable category pill buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-thin">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onSelectCategory(cat.value)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
