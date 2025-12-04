
import React from 'react';
import { Product, User } from '../types';
import { getCategoryLabel, getConditionLabel, getPriceDisplay } from '../utils/helpers';

interface ProductDetailViewProps {
  product: Product;
  user: User | null;
  t: any;
  onNavigate: (page: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, user, t, onNavigate }) => {
  
  const handleContact = () => {
      if (!user) {
          if (window.confirm("Debes registrarte o ingresar para ver los datos de contacto. ¿Ir al login?")) {
              onNavigate('login');
          }
          return;
      }
      
      // In a real app, this would fetch the seller's profile
      // For now, we simulate opening WhatsApp with a pre-filled message
      const message = `Hola, vi tu producto "${product.title}" en Mercado Tri y me interesa.`;
      const encodedMsg = encodeURIComponent(message);
      // Fallback number if mocking
      window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-gray-100 relative min-h-[300px] flex items-center justify-center bg-gray-50">
                <img src={product.imageUrls[0]} className="w-full h-full object-contain max-h-[500px]" alt={product.title} />
                <button onClick={() => onNavigate('marketplace')} className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-gray-800 transition">
                     <i className="fa-solid fa-arrow-left"></i>
                </button>
            </div>
            <div className="w-full md:w-1/2 p-8 flex flex-col">
                <div className="mb-4">
                    <span className="bg-orange-100 text-tri-orange text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{getCategoryLabel(product.category, t)}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.title}</h1>
                <p className="text-gray-500 mb-6 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-tag"></i> {product.brand} 
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span> 
                    {getConditionLabel(product.condition, t)}
                </p>
                
                <div className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
                    {getPriceDisplay(product.price, product.currency)}
                </div>
                
                <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                    <p>{product.description}</p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-gray-100">
                    {user && user.id === product.userId ? (
                        <button onClick={() => { onNavigate('edit-existing'); }} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                            {t.editAction}
                        </button>
                    ) : (
                        user ? (
                            <button onClick={handleContact} className="w-full bg-tri-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition flex items-center justify-center gap-2">
                                <i className="fa-brands fa-whatsapp text-xl"></i> {t.contactSeller}
                            </button>
                        ) : (
                            <button onClick={() => onNavigate('login')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2">
                                <i className="fa-solid fa-lock"></i> {t.loginToContact}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
