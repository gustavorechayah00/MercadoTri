
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/mockBackend';

interface ProfileViewProps {
    user: User;
    t: any;
    onUpdateUser: (u: User) => void;
    onNavigate: (page: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, t, onUpdateUser, onNavigate }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
    const [instagram, setInstagram] = useState(user.instagram || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await authService.updateProfile(user.id, { name, phone, whatsapp, instagram });
            onUpdateUser(updated);
            alert(t.profileSaved);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBecomeSeller = () => {
        onNavigate('shop-config');
    };

    const handleCloseShop = async () => {
        if (!window.confirm(t.closeShopConfirm)) return;
        
        setLoading(true);
        try {
            // Updating role to buyer automatically triggers product deletion in backend logic
            const updated = await authService.updateProfile(user.id, { role: 'buyer' });
            onUpdateUser(updated);
            alert("Tienda cerrada y productos eliminados.");
        } catch(e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t.profileTitle}</h2>

            {/* Personal Info Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 pb-2 border-b border-gray-100">{t.personalInfo}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                             {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <i className="fa-solid fa-user text-4xl text-gray-400 m-4"></i>}
                        </div>
                        <div>
                             <p className="font-bold text-gray-900">{user.email}</p>
                             <p className="text-xs text-tri-orange font-bold uppercase">{user.role}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.nameLabel}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-tri-orange" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label>
                            <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-tri-orange" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-tri-orange" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.instagramLabel}</label>
                        <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-tri-orange" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
                        {loading ? t.loading : t.saveProfile}
                    </button>
                </form>
            </div>

            {/* Seller/Buyer Zone Switch */}
            {user.role !== 'admin' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold uppercase text-tri-orange mb-4 pb-2 border-b border-gray-100">{t.sellerZone}</h3>
                    
                    {user.role === 'buyer' ? (
                        <div className="text-center py-4">
                            <i className="fa-solid fa-store text-4xl text-gray-300 mb-3"></i>
                            <h4 className="font-bold text-gray-900 mb-2">{t.becomeSeller}</h4>
                            <p className="text-sm text-gray-500 mb-6">{t.becomeSellerDesc}</p>
                            <button onClick={handleBecomeSeller} className="bg-tri-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">
                                {t.createShopBtn}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <h4 className="font-bold text-red-600 mb-2">{t.closeShop}</h4>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{t.closeShopDesc}</p>
                            <button onClick={handleCloseShop} disabled={loading} className="border border-red-200 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition">
                                {loading ? t.loading : 'Cerrar Tienda'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
