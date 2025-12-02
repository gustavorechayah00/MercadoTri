
import React, { useState } from 'react';
import { Product, Condition } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  showStatus?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, showStatus }) => {
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
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col h-full group"
    >
      <div className="relative aspect-square w-full bg-gray-200 overflow-hidden">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-8 h-8 rounded-full shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
               {images.slice(0, 5).map((_, idx) => (
                 <div 
                   key={idx} 
                   className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} 
                 />
               ))}
               {images.length > 5 && <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>}
            </div>
          </>
        )}

        <div className="absolute top-2 right-2 z-10">
           <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100">
             {product.category}
           </span>
        </div>

        {showStatus && (
           <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm z-10 ${product.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}>
             {product.status === 'published' ? 'Active' : 'Draft'}
           </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{product.title}</h3>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
           <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{product.condition}</span>
           <span>•</span>
           <span>{product.brand}</span>
        </div>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-lg font-bold text-tri-dark">
            ${product.price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">
             {new Date(product.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
