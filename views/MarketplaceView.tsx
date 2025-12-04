
import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { getCategoryLabel } from '../utils/helpers';

interface MarketplaceViewProps {
  products: Product[];
  t: any;
  onProductClick: (p: Product) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ products, t, onProductClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProducts = products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const isPublished = p.status === 'published';
      return matchesSearch && matchesCategory && isPublished;
  });

  return (
    <div className="space-y-6">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full md:w-96">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                    type="text" 
                    placeholder={t.searchPlaceholder} 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-tri-orange"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <button 
                    onClick={() => setCategoryFilter('All')}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${categoryFilter === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {t.anyCategory}
                </button>
                {Object.values(Category).map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${categoryFilter === cat ? 'bg-tri-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {getCategoryLabel(cat, t)}
                    </button>
                ))}
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map(p => (
                <ProductCard 
                    key={p.id} 
                    product={p} 
                    onClick={() => onProductClick(p)}
                    categoryLabel={getCategoryLabel(p.category, t)}
                />
            ))}
            {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-400">
                    No se encontraron productos.
                </div>
            )}
        </div>
    </div>
  );
};
