
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { authService } from '../services/mockBackend';
import { generateShopName, generateShopDescription } from '../services/geminiService';

interface ShopConfigViewProps {
    user: User;
    t: any;
    onShopCreated: (u: User) => void;
    isEditing?: boolean;
}

export const ShopConfigView: React.FC<ShopConfigViewProps> = ({ user, t, onShopCreated, isEditing }) => {
    const [shopName, setShopName] = useState(user.shopName || user.name || '');
    const [shopDesc, setShopDesc] = useState(user.shopDescription || '');
    const [shopImage, setShopImage] = useState<string | null>(user.shopImageUrl || null);
    
    // Contact Info
    const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [instagram, setInstagram] = useState(user.instagram || '');

    const [generatingName, setGeneratingName] = useState(false);
    const [generatingDesc, setGeneratingDesc] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateName = async () => {
        setGeneratingName(true);
        try {
            const suggested = await generateShopName(user.name, user.email);
            setShopName(suggested);
        } catch (e) {
            console.error(e);
            alert("Error generando nombre.");
        } finally {
            setGeneratingName(false);
        }
    };

    const handleGenerateDesc = async () => {
        if (!shopName) { alert("Primero ingresa el nombre de la tienda"); return; }
        setGeneratingDesc(true);
        try {
            const suggested = await generateShopDescription(shopName, user.name);
            setShopDesc(suggested);
        } catch (e) {
            console.error(e);
            alert("Error generando descripción.");
        } finally {
            setGeneratingDesc(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setShopImage(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!whatsapp && !phone && !instagram) {
            alert("Debes agregar al menos un método de contacto (WhatsApp, Teléfono o Instagram).");
            return;
        }

        setSaving(true);
        try {
            const updatedUser = await (authService as any).createShop(
                user.id, 
                shopName, 
                shopImage, 
                shopDesc,
                { whatsapp, phone, instagram }
            );
            onShopCreated(updatedUser);
        } catch (e) {
            console.error(e);
            alert("Error guardando datos de la tienda.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{isEditing ? t.shopEditTitle : t.shopConfigTitle}</h2>
            {!isEditing && <p className="text-gray-500 text-sm mb-6">{t.shopConfigDesc}</p>}

            <form onSubmit={handleCreate} className="space-y-6">
                
                {/* Shop Image Upload */}
                <div className="flex flex-col items-center">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.shopLogoLabel}</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-tri-orange overflow-hidden relative shadow-sm"
                    >
                        {shopImage ? (
                            <img src={shopImage} alt="Shop Logo" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-solid fa-store text-3xl text-gray-300"></i>
                        )}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
                           <i className="fa-solid fa-camera text-white opacity-0 hover:opacity-100 drop-shadow-md"></i>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>

                <div className="text-left">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.shopNameLabel}</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" 
                            value={shopName} 
                            onChange={(e) => setShopName(e.target.value)} 
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={handleGenerateName}
                            className="bg-tri-blue text-white px-4 rounded-xl hover:bg-cyan-600 transition flex items-center justify-center shadow-sm disabled:opacity-50"
                            disabled={generatingName}
                            title={t.generateAiBtn}
                        >
                            {generatingName ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        </button>
                    </div>
                </div>

                <div className="text-left">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.shopDescLabel}</label>
                    <div className="relative">
                        <textarea 
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none text-sm h-24" 
                            value={shopDesc} 
                            onChange={(e) => setShopDesc(e.target.value)} 
                        />
                        <button 
                            type="button" 
                            onClick={handleGenerateDesc}
                            className="absolute bottom-2 right-2 bg-purple-500 text-white w-8 h-8 rounded-full hover:bg-purple-600 transition flex items-center justify-center shadow-sm disabled:opacity-50 text-xs"
                            disabled={generatingDesc}
                            title={t.generateAiBtn}
                        >
                            {generatingDesc ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase border-b border-gray-200 pb-2">Información de Contacto (Pública)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label>
                            <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-tri-orange outline-none text-sm" placeholder="e.g. +54 9 11..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-tri-orange outline-none text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.instagramLabel}</label>
                            <div className="relative">
                                <i className="fa-brands fa-instagram absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-1 focus:ring-tri-orange outline-none text-sm" placeholder="@usuario" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-tri-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition shadow-lg"
                >
                    {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : (isEditing ? t.saveShopBtn : t.createShopBtn)}
                </button>
            </form>
        </div>
    );
};
