
import React from 'react';
import { User, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { getCategoryLabel } from '../utils/helpers';

interface ShopDetailViewProps {
    shop: User;
    products: Product[];
    t: any;
    onBack: () => void;
    onProductClick: (p: Product) => void;
}

export const ShopDetailView: React.FC<ShopDetailViewProps> = ({ shop, products, t, onBack, onProductClick }) => {
    // Only show published products
    const shopProducts = products.filter(p => p.status === 'published');

    return (
        <div className="space-y-6">
            {/* Shop Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 relative">
                     <button 
                        onClick={onBack} 
                        className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-sm transition flex items-center gap-2"
                     >
                         <i className="fa-solid fa-arrow-left"></i> {t.backToMarket}
                     </button>
                </div>
                <div className="px-8 pb-8 flex flex-col items-center -mt-12 text-center relative z-10">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden mb-3">
                        {shop.shopImageUrl ? (
                            <img src={shop.shopImageUrl} className="w-full h-full object-cover" alt={shop.shopName} />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <i className="fa-solid fa-store text-4xl text-gray-300"></i>
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{shop.shopName}</h1>
                    <p className="text-gray-500 max-w-lg text-sm mb-4">{shop.shopDescription || 'Sin descripción disponible.'}</p>
                    
                    {/* Contact Badges */}
                    <div className="flex gap-3 justify-center">
                        {shop.instagram && (
                            <span className="flex items-center gap-1 bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100">
                                <i className="fa-brands fa-instagram"></i> {shop.instagram}
                            </span>
                        )}
                        {shop.whatsapp && (
                             <span className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                <i className="fa-brands fa-whatsapp"></i> WhatsApp
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Shop Products */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-tri-orange pl-3 uppercase">Productos en Venta</h2>
                {shopProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
                        Esta tienda no tiene productos publicados actualmente.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        {shopProducts.map(p => (
                            <ProductCard 
                                key={p.id} 
                                product={p} 
                                onClick={() => onProductClick(p)}
                                categoryLabel={getCategoryLabel(p.category, t)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
