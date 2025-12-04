import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { productService } from '../services/mockBackend';
import { ProductCard } from '../components/ProductCard';
import { getCategoryLabel, getPriceDisplay } from '../utils/helpers';

interface MyShopViewProps {
    user: User;
    t: any;
    onViewProduct: (p: Product) => void;
    onEditShop: () => void;
}

export const MyShopView: React.FC<MyShopViewProps> = ({ user, t, onViewProduct, onEditShop }) => {
    const [stats, setStats] = useState({ total: 0, active: 0, sold: 0, revenue: 0 });
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Inventory State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const loadShopData = async () => {
            setLoading(true);
            try {
                const s = await productService.getShopStats(user.id);
                setStats(s);
                const allProds = await productService.getAll();
                // Show ALL products for the owner (published, draft, sold)
                setProducts(allProds.filter(p => p.userId === user.id));
            } catch(e) { console.error(e); } 
            finally { setLoading(false); }
        };
        loadShopData();
    }, [user.id, refreshTrigger]);

    // Handlers
    const handleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === products.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(products.map(p => p.id)));
    };

    const handleBulkAction = async (action: 'delete' | 'publish' | 'draft') => {
        const ids = Array.from(selectedIds) as string[];
        if (ids.length === 0) return;

        if (action === 'delete') {
            if (!window.confirm(t.confirmBulkDelete)) return;
            await productService.deleteMany(ids);
        } else if (action === 'publish') {
            await productService.updateStatusMany(ids, 'published');
        } else if (action === 'draft') {
            await productService.updateStatusMany(ids, 'draft');
        }
        
        setSelectedIds(new Set());
        setRefreshTrigger(prev => prev + 1); // Reload data
    };

    const filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const StatCard = ({ icon, label, value, color }: any) => (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${color}`}>
                <i className={`fa-solid ${icon} text-lg`}></i>
            </div>
            <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4 overflow-hidden border border-gray-100 flex-shrink-0 shadow-inner">
                            {user.shopImageUrl ? (
                                <img src={user.shopImageUrl} alt={user.shopName} className="w-full h-full object-cover" />
                            ) : (
                                <i className="fa-solid fa-store text-3xl text-gray-300"></i>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                 <h2 className="text-2xl font-bold text-gray-900">{user.shopName}</h2>
                                 <button onClick={onEditShop} className="text-gray-400 hover:text-tri-orange transition" title={t.editShop}><i className="fa-solid fa-pen-to-square"></i></button>
                            </div>
                            <p className="text-xs text-tri-orange font-bold uppercase tracking-wider">{t.sellerZone}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard icon="fa-box" label="Total" value={stats.total} color="bg-blue-50 text-blue-500" />
                    <StatCard icon="fa-eye" label="Activos" value={stats.active} color="bg-green-50 text-green-500" />
                    <StatCard icon="fa-handshake" label="Vendidos" value={stats.sold} color="bg-purple-50 text-purple-500" />
                    <StatCard icon="fa-sack-dollar" label="Ingresos" value={`$${stats.revenue}`} color="bg-orange-50 text-orange-500" />
                </div>
            </div>

            {/* Inventory Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24 z-30">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input 
                            type="text" 
                            placeholder={t.searchInvPlaceholder} 
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-tri-orange text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 mr-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 hidden sm:inline">{selectedIds.size} {t.itemsSelected}</span>
                                <button onClick={() => handleBulkAction('publish')} title={t.activateSelected} className="w-8 h-8 rounded hover:bg-green-100 text-green-600 transition"><i className="fa-solid fa-eye"></i></button>
                                <button onClick={() => handleBulkAction('draft')} title={t.deactivateSelected} className="w-8 h-8 rounded hover:bg-yellow-100 text-yellow-600 transition"><i className="fa-solid fa-eye-slash"></i></button>
                                <button onClick={() => handleBulkAction('delete')} title={t.deleteSelected} className="w-8 h-8 rounded hover:bg-red-100 text-red-600 transition"><i className="fa-solid fa-trash"></i></button>
                            </div>
                        )}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded flex items-center justify-center transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-tri-orange' : 'text-gray-400'}`}><i className="fa-solid fa-border-all"></i></button>
                            <button onClick={() => setViewMode('list')} className={`w-8 h-8 rounded flex items-center justify-center transition ${viewMode === 'list' ? 'bg-white shadow-sm text-tri-orange' : 'text-gray-400'}`}><i className="fa-solid fa-list"></i></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory List/Grid */}
            {loading ? (
                <div className="text-center py-10 text-gray-400">{t.loading}...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-gray-400 mb-4">{t.emptyInventory}</p>
                    {/* Note: The 'Sell' button in navbar is main entry point, but we can add one here too */}
                </div>
            ) : (
                <>
                   {viewMode === 'grid' ? (
                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                           {filteredProducts.map(p => (
                               <div key={p.id} className={`relative group ${selectedIds.has(p.id) ? 'ring-2 ring-tri-orange rounded-lg' : ''}`}>
                                   <div className="absolute top-2 left-2 z-20">
                                       <input 
                                           type="checkbox" 
                                           checked={selectedIds.has(p.id)} 
                                           onChange={() => handleSelect(p.id)}
                                           className="w-5 h-5 accent-tri-orange cursor-pointer shadow-sm"
                                       />
                                   </div>
                                   <ProductCard product={p} onClick={() => onViewProduct(p)} categoryLabel={getCategoryLabel(p.category, t)} showStatus />
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                           <table className="min-w-full divide-y divide-gray-100">
                               <thead className="bg-gray-50">
                                   <tr>
                                       <th className="px-4 py-3 text-left"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === products.length && products.length > 0} className="accent-tri-orange" /></th>
                                       <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.titleLabel}</th>
                                       <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.priceLabel}</th>
                                       <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t.statusLabel}</th>
                                       <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">{t.actions}</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-100">
                                   {filteredProducts.map(p => (
                                       <tr key={p.id} className={`hover:bg-gray-50 ${selectedIds.has(p.id) ? 'bg-orange-50' : ''}`}>
                                           <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => handleSelect(p.id)} className="accent-tri-orange" /></td>
                                           <td className="px-4 py-3 flex items-center gap-3">
                                               <img src={p.imageUrls[0]} className="w-10 h-10 rounded object-cover border border-gray-200" />
                                               <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{p.title}</span>
                                           </td>
                                           <td className="px-4 py-3 text-sm font-bold text-gray-700">{getPriceDisplay(p.price, p.currency)}</td>
                                           <td className="px-4 py-3">
                                               <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                   {p.status === 'published' ? t.available : t.draft}
                                               </span>
                                           </td>
                                           <td className="px-4 py-3 text-right">
                                               <button onClick={() => onViewProduct(p)} className="text-gray-400 hover:text-tri-orange"><i className="fa-solid fa-chevron-right"></i></button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   )}
                </>
            )}
        </div>
    );
};