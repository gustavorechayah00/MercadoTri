
import React from 'react';
import { Product, User } from '../types';
import { getPriceDisplay } from '../utils/helpers';

interface InventoryViewProps {
    products: Product[];
    user: User;
    t: any;
    onEditProduct: (p: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ products, user, t, onEditProduct }) => {
    return (
         <div className="bg-white rounded-xl shadow-sm p-6">
             <h2 className="text-2xl font-bold mb-4">{t.myInventory}</h2>
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead>
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.titleLabel}</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.priceLabel}</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.statusLabel}</th>
                             <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                         {products.filter(p => p.userId === user.id).map(p => (
                             <tr key={p.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex items-center">
                                         <div className="h-10 w-10 flex-shrink-0">
                                             <img className="h-10 w-10 rounded-full object-cover" src={p.imageUrls[0]} alt="" />
                                         </div>
                                         <div className="ml-4">
                                             <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{p.title}</div>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     {getPriceDisplay(p.price, p.currency)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                         {p.status}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                     <button onClick={() => onEditProduct(p)} className="text-indigo-600 hover:text-indigo-900 mr-4">{t.editAction}</button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         </div>
    );
};
