'use client';
import { useState } from 'react';
import type { Category, Karat } from '@/types';
import { CATEGORY_LABELS } from '@/lib/api';
import { FiSearch, FiFilter } from 'react-icons/fi';
import clsx from 'clsx';

interface Props {
  search: string;
  karat: string;
  category: string;
  onSearch: (v: string) => void;
  onKarat: (v: string) => void;
  onCategory: (v: string) => void;
}

const KARATS: Karat[] = ['18K', '21K', '22K', '24K'];
const CATEGORIES = Object.entries(CATEGORY_LABELS);

export default function ProductFilters({ search, karat, category, onSearch, onKarat, onCategory }: Props) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-8">
      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="گەڕان لە زێڕەکان..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gold-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
            dir="rtl"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-medium text-sm',
            showFilters
              ? 'bg-gold-600 text-white border-gold-600'
              : 'bg-white text-gray-600 border-gold-200 hover:border-gold-400'
          )}
        >
          <FiFilter size={16} />
          فلتەر
          {(karat || category) && (
            <span className="bg-gold-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ltr-num">
              {[karat, category].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gold-100 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Karat filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">عەیاری زێڕ</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onKarat('')}
                  className={clsx('px-3 py-1.5 rounded-lg text-sm border transition-all', karat === '' ? 'bg-gold-600 text-white border-gold-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gold-400')}
                >
                  هەموو
                </button>
                {KARATS.map((k) => (
                  <button
                    key={k}
                    onClick={() => onKarat(karat === k ? '' : k)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-sm border font-medium transition-all ltr-num',
                      karat === k ? 'bg-gold-600 text-white border-gold-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gold-400'
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">جۆری زێڕ</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onCategory('')}
                  className={clsx('px-3 py-1.5 rounded-lg text-sm border transition-all', category === '' ? 'bg-gold-600 text-white border-gold-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gold-400')}
                >
                  هەموو
                </button>
                {CATEGORIES.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => onCategory(category === key ? '' : key)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-sm border transition-all',
                      category === key ? 'bg-gold-600 text-white border-gold-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gold-400'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(karat || category) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => { onKarat(''); onCategory(''); }}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                پاککردنەوەی هەموو فلتەرەکان
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
