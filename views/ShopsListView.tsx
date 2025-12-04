
import React, { useState } from 'react';
import { ShopSummary } from '../types';

interface ShopsListViewProps {
    shops: ShopSummary[];
    t: any;
    onSelectShop: (id: string) => void;
}

export const ShopsListView: React.FC<ShopsListViewProps> = ({ shops, t, onSelectShop }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredShops = shops.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h2 className="text-3xl font-sport font-bold text-gray-900 uppercase">{t.allShopsTitle}</h2>
                <input 
                    type="text" 
                    placeholder={t.searchShops} 
                    className="w-full md:w-80 px-4 py-2 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-tri-orange outline-none text-gray-900"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            
            {filteredShops.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-lg">{t.noShopsFound}</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {filteredShops.map(shop => (
                         <div 
                             key={shop.id} 
                             onClick={() => onSelectShop(shop.id)}
                             className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-tri-orange/30 transition cursor-pointer group"
                         >
                             <div className="w-24 h-24 rounded-full bg-white mb-4 overflow-hidden border-2 border-gray-100 group-hover:border-tri-orange transition shadow-sm">
                                 {shop.shopImageUrl ? (
                                     <img src={shop.shopImageUrl} className="w-full h-full object-cover"/>
                                 ) : (
                                     <i className="fa-solid fa-store text-4xl text-gray-300 mt-6 block"></i>
                                 )}
                             </div>
                             <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-tri-orange transition">{shop.name}</h3>
                             <p className="text-sm text-gray-500 mb-4 font-medium">{shop.productCount} {t.productsCount}</p>
                             <button className="mt-auto w-full bg-white text-gray-600 font-bold py-2 rounded-lg border border-gray-200 group-hover:bg-tri-orange group-hover:text-white group-hover:border-tri-orange transition text-sm">
                                 {t.viewShop}
                             </button>
                         </div>
                     ))}
                </div>
            )}
        </div>
    );
};
