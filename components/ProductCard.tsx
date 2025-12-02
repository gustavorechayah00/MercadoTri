
import React, { useState } from 'react';
import { Product, Condition } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  showStatus?: boolean;
  categoryLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, showStatus, categoryLabel }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : ['https://via.placeholder.com/400x400?text=No+Image'];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col h-full group"
    >
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        <img 
          src={images[currentImageIndex]} 
          alt={product.title} 
          className="w-full h-full object-cover object-center transition-opacity duration-300"
        />
        
        {/* Navigation Arrows (Only if > 1 image) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev} 
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-6 h-6 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <i className="fa-solid fa-chevron-left text-[10px]"></i>
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-6 h-6 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
               {images.slice(0, 5).map((_, idx) => (
                 <div 
                   key={idx} 
                   className={`w-1 h-1 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/60'}`} 
                 />
               ))}
            </div>
          </>
        )}

        {/* Compact Category Badge */}
        <div className="absolute top-2 right-2 z-10">
           <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-gray-100 uppercase tracking-tight">
             {categoryLabel}
           </span>
        </div>

        {showStatus && (
           <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm z-10 ${product.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}>
             {product.status === 'published' ? 'Active' : 'Draft'}
           </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <div className="mb-1">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight h-9">{product.title}</h3>
        </div>
        
        <div className="flex items-center text-[10px] text-gray-500 mb-2 space-x-1">
           <span className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 font-medium border border-gray-100 truncate max-w-[80px]">{product.brand}</span>
           <span>•</span>
           <span className="truncate">{product.condition}</span>
        </div>

        <div className="mt-auto flex justify-between items-end border-t border-gray-50 pt-2">
          <span className="text-base font-bold text-gray-900 tracking-tight">
            ${product.price.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400">
             {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
