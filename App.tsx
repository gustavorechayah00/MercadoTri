
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { ProductCard } from './components/ProductCard';
import { TriBot } from './components/TriBot'; 
import { authService, productService, adminService, configService } from './services/mockBackend';
import { analyzeProductImage } from './services/geminiService';
import { Product, User, Category, Condition, AIAnalysisResult, UserRole, SiteSettings, AIProvider } from './types';

// --- Translation Dictionary ---
const translations = {
  es: {
    navShop: 'Tienda',
    navSell: 'Vender',
    navInventory: 'Inventario',
    navUsers: 'Usuarios',
    login: 'Ingresar',
    logout: 'Salir',
    signInTitle: 'Ingresa a tu cuenta',
    signUpTitle: 'Crea tu cuenta',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    nameLabel: 'Nombre Completo',
    phoneLabel: 'Teléfono',
    whatsappLabel: 'WhatsApp',
    signInBtn: 'Iniciar Sesión',
    signUpBtn: 'Registrarse',
    loading: 'Cargando',
    adminHint: 'Usa credenciales de Supabase',
    noAccount: '¿No tienes cuenta? Regístrate',
    hasAccount: '¿Ya tienes cuenta? Ingresa',
    
    // Profile
    myProfile: 'Mi Perfil',
    profileTitle: 'Editar Perfil',
    saveProfile: 'Guardar Perfil',
    profileSaved: 'Perfil actualizado con éxito',
    changeAvatar: 'Cambiar Foto',
    
    // User Management
    usersTitle: 'Gestión de Usuarios',
    roleUpdated: 'Rol actualizado correctamente',
    updateError: 'Error al actualizar rol',
    editUser: 'Editar Usuario',
    
    // Upload
    analyzingTitle: 'Analizando Equipo...',
    analyzingDesc: 'Gemini AI está analizando tus fotos para identificar el producto.',
    uploadTitle: 'Vende tu Equipo',
    uploadDesc: 'Selecciona hasta 10 fotos. La IA analizará la primera para completar los detalles.',
    selectPhotosBtn: 'Seleccionar Fotos',
    cancel: 'Cancelar',
    maxPhotos: 'Por favor selecciona un máximo de 10 imágenes.',
    analysisError: 'Falló el análisis de IA. Intenta de nuevo.',

    // Edit
    reviewTitle: 'Revisar & Publicar',
    editTitle: 'Editar Publicación',
    reviewDesc: 'Revisa los detalles generados por la IA antes de publicar.',
    editDesc: 'Modifica los detalles de tu producto. Puedes agregar o quitar fotos.',
    imgSelected: 'imágenes',
    cover: 'Portada',
    titleLabel: 'Título',
    categoryLabel: 'Categoría',
    priceLabel: 'Precio',
    brandLabel: 'Marca',
    conditionLabel: 'Condición',
    descLabel: 'Descripción',
    tagsLabel: 'Etiquetas (separadas por coma)',
    publishBtn: 'Publicar Producto',
    saveChangesBtn: 'Guardar Cambios',
    publishing: 'Publicando...',
    saving: 'Guardando...',
    addPhoto: 'Agregar Foto',

    // Categories & Conditions (UI Display)
    catCycling: 'Ciclismo',
    catRunning: 'Running',
    catSwimming: 'Natación',
    catTriathlon: 'Triatlón',
    catOther: 'Otro',
    
    condNew: 'Nuevo',
    condLikeNew: 'Como Nuevo',
    condGood: 'Bueno',
    condFair: 'Aceptable',

    // Detail & Inventory
    backToMarket: 'Volver a la Tienda',
    available: 'Disponible',
    draft: 'Borrador',
    contactSeller: 'Contactar Vendedor',
    myInventory: 'Gestión de Inventario',
    addNew: 'Agregar Nuevo',
    emptyInventory: 'Aún no has publicado artículos.',
    startSelling: 'Comenzar a Vender',
    all: 'Todo',
    viewGrid: 'Cuadrícula',
    viewList: 'Lista',
    deleteSelected: 'Eliminar Seleccionados',
    itemsSelected: 'seleccionados',
    
    // Filters & Search
    searchPlaceholder: 'Buscar productos...',
    searchInvPlaceholder: 'Buscar en inventario...',
    minPrice: 'Min $',
    maxPrice: 'Max $',
    anyCondition: 'Condition',
    anyCategory: 'Todas',
    anyStatus: 'Cualquier Estado',
    sortBy: 'Ordenar por',
    sortNewest: 'Más Recientes',
    sortOldest: 'Más Antiguos',
    sortPriceLow: 'Precio: Menor a Mayor',
    sortPriceHigh: 'Precio: Mayor a Menor',
    filterTitle: 'Filtros',
    clearFilters: 'Limpiar',

    // Admin / Actions
    editAction: 'Editar',
    deleteAction: 'Eliminar',
    confirmDelete: '¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.',
    confirmBulkDelete: '¿Estás seguro que deseas eliminar los productos seleccionados?',
    deletedSuccess: 'Producto eliminado correctamente.'
  },
  en: {
    navShop: 'Shop',
    navSell: 'Sell',
    navInventory: 'Inventory',
    navUsers: 'Users',
    login: 'Login',
    logout: 'Logout',
    signInTitle: 'Sign in to your account',
    signUpTitle: 'Create Account',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    phoneLabel: 'Phone',
    whatsappLabel: 'WhatsApp',
    signInBtn: 'Sign In',
    signUpBtn: 'Sign Up',
    loading: 'Loading',
    adminHint: 'Use Supabase Credentials',
    noAccount: "Don't have an account? Sign Up",
    hasAccount: 'Already have an account? Sign In',
    
    // Profile
    myProfile: 'My Profile',
    profileTitle: 'Edit Profile',
    saveProfile: 'Save Profile',
    profileSaved: 'Profile updated successfully',
    changeAvatar: 'Change Photo',

    // User Management
    usersTitle: 'User Management',
    roleUpdated: 'Role updated successfully',
    updateError: 'Error updating role',
    editUser: 'Edit User',
    
    // Upload
    analyzingTitle: 'Analyzing Gear...',
    analyzingDesc: 'Gemini AI is analyzing your photos to identify the product.',
    uploadTitle: 'Sell your Gear',
    uploadDesc: 'Select up to 10 photos. AI will analyze the first one to auto-fill details.',
    selectPhotosBtn: 'Select Photos',
    cancel: 'Cancel',
    maxPhotos: 'Please select a maximum of 10 images.',
    analysisError: 'AI Analysis failed. Please try again.',

    // Edit
    reviewTitle: 'Review & Publish',
    editTitle: 'Edit Listing',
    reviewDesc: 'Review the details generated by AI before publishing.',
    editDesc: 'Modify your product details. You can add or remove photos.',
    imgSelected: 'images',
    cover: 'Cover',
    titleLabel: 'Title',
    categoryLabel: 'Category',
    priceLabel: 'Price',
    brandLabel: 'Brand',
    conditionLabel: 'Condition',
    descLabel: 'Description',
    tagsLabel: 'Tags (comma separated)',
    publishBtn: 'Publish Item',
    saveChangesBtn: 'Save Changes',
    publishing: 'Publishing...',
    saving: 'Saving...',
    addPhoto: 'Add Photo',

    // Categories & Conditions (UI Display)
    catCycling: 'Cycling',
    catRunning: 'Running',
    catSwimming: 'Swimming',
    catTriathlon: 'Triathlon',
    catOther: 'Other',
    
    condNew: 'New',
    condLikeNew: 'Used - Like New',
    condGood: 'Used - Good',
    condFair: 'Used - Fair',

    // Detail & Inventory
    backToMarket: 'Back to Marketplace',
    available: 'Available',
    draft: 'Draft',
    contactSeller: 'Contact Seller',
    myInventory: 'Inventory Management',
    addNew: 'Add New',
    emptyInventory: "You haven't listed any items yet.",
    startSelling: 'Start Selling',
    all: 'All',
    viewGrid: 'Grid',
    viewList: 'List',
    deleteSelected: 'Delete Selected',
    itemsSelected: 'selected',

    // Filters & Search
    searchPlaceholder: 'Search products...',
    searchInvPlaceholder: 'Search inventory...',
    minPrice: 'Min $',
    maxPrice: 'Max $',
    anyCondition: 'Condition',
    anyCategory: 'All',
    anyStatus: 'Any Status',
    sortBy: 'Sort By',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortPriceLow: 'Price: Low to High',
    sortPriceHigh: 'Price: High to Low',
    filterTitle: 'Filtros',
    clearFilters: 'Clear',

    // Admin / Actions
    editAction: 'Edit',
    deleteAction: 'Delete',
    confirmDelete: 'Are you sure you want to delete this product? This action cannot be undone.',
    confirmBulkDelete: 'Are you sure you want to delete the selected products?',
    deletedSuccess: 'Product deleted successfully.'
  }
};

const getCategoryLabel = (cat: string, t: any) => {
  const map: Record<string, string> = {
    [Category.CYCLING]: t.catCycling,
    [Category.RUNNING]: t.catRunning,
    [Category.SWIMMING]: t.catSwimming,
    [Category.TRIATHLON]: t.catTriathlon,
    [Category.OTHER]: t.catOther
  };
  return map[cat] || cat;
};

// Config for icons and colors
const CATEGORY_CONFIG: Record<string, { icon: string, color: string, bg: string, ring: string }> = {
  [Category.CYCLING]: { icon: 'fa-bicycle', color: 'text-tri-orange', bg: 'bg-orange-50', ring: 'ring-tri-orange' },
  [Category.RUNNING]: { icon: 'fa-person-running', color: 'text-tri-green', bg: 'bg-lime-50', ring: 'ring-tri-green' },
  [Category.SWIMMING]: { icon: 'fa-person-swimming', color: 'text-tri-blue', bg: 'bg-cyan-50', ring: 'ring-tri-blue' },
  [Category.TRIATHLON]: { icon: 'fa-layer-group', color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-500' },
  [Category.OTHER]: { icon: 'fa-tag', color: 'text-gray-500', bg: 'bg-gray-50', ring: 'ring-gray-400' },
};

const getConditionLabel = (cond: string, t: any) => {
  const map: Record<string, string> = {
    [Condition.NEW]: t.condNew,
    [Condition.USED_LIKE_NEW]: t.condLikeNew,
    [Condition.USED_GOOD]: t.condGood,
    [Condition.USED_FAIR]: t.condFair
  };
  return map[cond] || cond;
};

// --- Sub-Components ---

// 1. LOGIN VIEW
const LoginView = ({ onLoginSuccess, t, siteConfig }: { onLoginSuccess: (user: User) => void, t: any, siteConfig: SiteSettings }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let user;
      if (isSignUp) {
        user = await authService.signUp(email, password, { name, whatsapp, phone });
      } else {
        user = await authService.login(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const nameParts = siteConfig.siteName.split(' ');
  const firstPart = nameParts[0];
  const restPart = nameParts.slice(1).join(' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             {siteConfig.logoUrl ? (
                <img src={siteConfig.logoUrl} className="w-24 h-24 object-contain" alt="Logo" />
             ) : (
                <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15 C65 15 80 25 85 40 C88 48 85 55 80 60 L 50 25 L 50 15 Z" fill="#06B6D4" />
                  <path d="M45 20 C35 30 35 45 40 55 L 85 40 C 80 25 65 15 45 20 Z" fill="#06B6D4" fillOpacity="0.8"/>
                  <path d="M20 70 C20 50 35 35 50 35 L 40 85 C 30 80 20 75 20 70 Z" fill="#84CC16" />
                  <path d="M40 85 L 50 35 L 85 85 C 70 95 50 95 40 85 Z" fill="#F97316" />
                  <circle cx="50" cy="55" r="8" fill="white" />
                </svg>
             )}
          </div>
          <h2 className="text-4xl font-sport font-bold tracking-tight text-gray-900 uppercase leading-none">
             {firstPart}
             {restPart && <span className="bg-gradient-to-r from-tri-blue via-tri-green to-tri-orange text-transparent bg-clip-text ml-2">{restPart}</span>}
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-bold tracking-wider">{siteConfig.siteDescription.slice(0, 30)}...</p>
          <p className="text-gray-400 text-xs mt-1">{isSignUp ? t.signUpTitle : t.signInTitle}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.nameLabel}</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
                 </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">{t.emailLabel}</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-tri-orange focus:border-transparent outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">{t.passwordLabel}</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-tri-orange focus:border-transparent outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-tri-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition flex justify-center shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (isSignUp ? t.signUpBtn : t.signInBtn)}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-gray-400 hover:text-tri-orange text-sm font-medium transition"
          >
            {isSignUp ? t.hasAccount : t.noAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

// 7. CONFIG VIEW (ADMIN ONLY - Updated for AI)
const ConfigView = ({ siteConfig, onUpdateConfig, t }: { siteConfig: SiteSettings, onUpdateConfig: (s: SiteSettings) => void, t: any }) => {
  const [formData, setFormData] = useState<SiteSettings>(siteConfig);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setLogoFile(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await configService.updateSettings(formData, logoFile || undefined);
      onUpdateConfig(formData); 
      alert("Configuración guardada exitosamente.");
    } catch (e) {
      console.error(e);
      alert("Error al guardar configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h2 className="text-3xl font-bold text-gray-900">Configuración del Sitio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* General Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Información General</h3>
            <div className="space-y-6">
                <div className="flex flex-col items-center sm:items-start">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {(logoFile || formData.logoUrl) ? (
                            <img src={logoFile || formData.logoUrl} className="w-full h-full object-contain" />
                            ) : (
                            <span className="text-gray-400 text-xs">Sin Logo</span>
                            )}
                        </div>
                        <div>
                            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 bg-white">
                                Cambiar
                            </button>
                            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Sitio</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                    <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none h-20" value={formData.siteDescription} onChange={e => setFormData({...formData, siteDescription: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Idioma por Defecto</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900" value={formData.defaultLanguage} onChange={e => setFormData({...formData, defaultLanguage: e.target.value as 'es' | 'en'})}>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </div>

        {/* AI Configuration Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 border-l-4 border-l-tri-blue">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <i className="fa-solid fa-robot mr-2 text-tri-blue"></i> Configuración de Inteligencia Artificial
            </h3>
            
            <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proveedor de AI</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition bg-white ${formData.aiProvider === 'gemini' ? 'border-tri-blue ring-1 ring-tri-blue' : 'hover:bg-gray-50 border-gray-200'}`}>
                            <input type="radio" name="aiProvider" value="gemini" checked={formData.aiProvider === 'gemini'} onChange={() => setFormData({...formData, aiProvider: 'gemini'})} className="hidden" />
                            <div className="font-bold text-gray-900">Google Gemini</div>
                            <div className="text-xs text-gray-500">Recomendado (Rápido y Multimodal)</div>
                        </label>
                        <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition bg-white ${formData.aiProvider === 'openai' ? 'border-green-500 ring-1 ring-green-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                            <input type="radio" name="aiProvider" value="openai" checked={formData.aiProvider === 'openai'} onChange={() => setFormData({...formData, aiProvider: 'openai'})} className="hidden" />
                            <div className="font-bold text-gray-900">OpenAI</div>
                            <div className="text-xs text-gray-500">GPT-4o (Requiere API Key)</div>
                        </label>
                    </div>
                 </div>

                 {formData.aiProvider === 'gemini' && (
                     <div className="bg-gray-50 p-4 rounded-lg space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gemini API Key</label>
                            <input type="password" placeholder="AIzaSy..." className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-tri-blue outline-none" value={formData.geminiApiKey || ''} onChange={e => setFormData({...formData, geminiApiKey: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                            <input type="text" placeholder="gemini-2.5-flash" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-tri-blue outline-none" value={formData.geminiModel || 'gemini-2.5-flash'} onChange={e => setFormData({...formData, geminiModel: e.target.value})} />
                        </div>
                     </div>
                 )}

                 {formData.aiProvider === 'openai' && (
                     <div className="bg-gray-50 p-4 rounded-lg space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">OpenAI API Key</label>
                            <input type="password" placeholder="sk-..." className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 outline-none" value={formData.openaiApiKey || ''} onChange={e => setFormData({...formData, openaiApiKey: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                            <input type="text" placeholder="gpt-4o" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 outline-none" value={formData.openaiModel || 'gpt-4o'} onChange={e => setFormData({...formData, openaiModel: e.target.value})} />
                        </div>
                     </div>
                 )}
            </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-tri-dark text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg text-lg"
        >
          {saving ? 'Guardando Configuración...' : 'Guardar Todos los Cambios'}
        </button>
      </form>
    </div>
  );
};


// 2. PROFILE VIEW (Updated)
const ProfileView = ({ user, t, onUpdateUser }: { user: User, t: any, onUpdateUser: (u: User) => void }) => {
  const [formData, setFormData] = useState({ name: user.name, whatsapp: user.whatsapp || '', phone: user.phone || '' });
  const [avatar, setAvatar] = useState(user.avatarUrl || '');
  const [newAvatarFile, setNewAvatarFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewAvatarFile(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, formData, newAvatarFile || undefined);
      onUpdateUser(updatedUser);
      alert(t.profileSaved);
    } catch (e) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.profileTitle}</h2>
      
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 bg-white">
           {(newAvatarFile || avatar) ? (
             <img src={newAvatarFile || avatar} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300">
               <i className="fa-solid fa-user text-5xl"></i>
             </div>
           )}
        </div>
        <button onClick={() => fileRef.current?.click()} className="text-sm font-bold text-tri-orange hover:underline">
          {t.changeAvatar}
        </button>
        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        
        <div className="mt-2 text-xs font-bold uppercase px-3 py-1 bg-gray-100 rounded-full text-gray-600">
           Rol: {user.role}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.nameLabel}</label>
          <input type="text" className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:bg-white focus:ring-2 focus:ring-tri-orange outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label>
            <input type="tel" className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:bg-white focus:ring-2 focus:ring-tri-orange outline-none" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label>
            <input type="tel" className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:bg-white focus:ring-2 focus:ring-tri-orange outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-tri-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition shadow-lg">
            {loading ? t.saving : t.saveProfile}
          </button>
        </div>
      </form>
    </div>
  );
};

// 3. UPLOAD VIEW
const UploadView = ({ onAnalysisComplete, onCancel, t }: { onAnalysisComplete: (data: AIAnalysisResult, imgs: string[]) => void, onCancel: () => void, t: any }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      if (files.length > 10) {
        alert(t.maxPhotos);
        return;
      }
      setAnalyzing(true);
      try {
        const promises = files.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        const base64Images = await Promise.all(promises);
        const mainImage = base64Images[0];
        const analysis = await analyzeProductImage(mainImage);
        onAnalysisComplete(analysis, base64Images);
      } catch (error) {
        console.error(error);
        alert(t.analysisError);
        setAnalyzing(false);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center min-h-[400px] flex flex-col justify-center">
        {analyzing ? (
          <div className="py-12 animate-pulse">
            <div className="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <i className="fa-solid fa-brain text-tri-orange text-2xl animate-bounce"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t.analyzingTitle}</h3>
            <p className="text-gray-500">{t.analyzingDesc}</p>
          </div>
        ) : (
          <div className="py-4">
            <div className="mb-8">
              <span className="inline-block p-4 rounded-full bg-orange-50 text-tri-orange mb-4 shadow-sm">
                <i className="fa-solid fa-images text-3xl"></i>
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.uploadTitle}</h2>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                {t.uploadDesc}
              </p>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div className="space-y-4 max-w-xs mx-auto">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-tri-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:bg-orange-600 transition transform hover:-translate-y-1"
              >
                <i className="fa-solid fa-upload mr-2"></i> {t.selectPhotosBtn}
              </button>
              <button onClick={onCancel} className="text-gray-400 text-sm hover:text-gray-600 transition w-full py-2">{t.cancel}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. EDIT VIEW
const EditView = ({ initialData, images: initialImages, onSave, onCancel, t, isEditing, onDelete }: any) => {
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    category: initialData.category,
    brand: initialData.brand,
    condition: initialData.condition,
    price: initialData.suggestedPrice,
    tags: initialData.tags.join(', ')
  });
  const [localImages, setLocalImages] = useState<string[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const addImgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocalImages(initialImages); }, [initialImages]);

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 10 - localImages.length;
      if (remainingSlots <= 0) { alert(t.maxPhotos); return; }
      
      const filesToProcess = files.slice(0, remainingSlots);
      try {
        const promises = filesToProcess.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        const newBase64Images = await Promise.all(promises);
        setLocalImages([...localImages, ...newBase64Images]);
      } catch (error) { console.error("Error reading new images", error); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localImages.length === 0) { alert("Debes tener al menos una imagen."); return; }
    setSaving(true);
    try {
      await onSave({
        ...formData,
        imageUrls: localImages,
        tags: formData.tags.split(',').map((t: string) => t.trim()),
        currency: 'USD',
        status: 'published'
      });
    } catch (e) { console.error(e); alert("Error guardando producto."); } 
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? t.editTitle : t.reviewTitle}</h2>
        <p className="text-gray-500 text-sm">{isEditing ? t.editDesc : t.reviewDesc}</p>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Images Column */}
        <div className="w-full md:w-1/3 bg-gray-50 p-4 border-r border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {localImages.map((img: string, idx: number) => (
              <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden border group ${idx === 0 ? 'border-tri-orange border-2' : 'border-gray-200 bg-white'}`}>
                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover object-center" />
                {idx === 0 && <span className="absolute bottom-1 right-1 bg-tri-orange text-white text-[10px] px-1 rounded shadow-sm">{t.cover}</span>}
                <button type="button" onClick={() => setLocalImages(localImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-700">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
            {localImages.length < 10 && (
              <div onClick={() => addImgInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-tri-orange hover:bg-orange-50 transition text-gray-400 hover:text-tri-orange">
                <i className="fa-solid fa-plus text-xl mb-1"></i>
                <span className="text-[10px] font-bold">{t.addPhoto}</span>
              </div>
            )}
            <input type="file" accept="image/*" multiple className="hidden" ref={addImgInputRef} onChange={handleAddImages} />
          </div>
        </div>
        
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="w-full md:w-2/3 p-6 space-y-5 pb-24 md:pb-6 relative bg-white">
          <div>
            <label className="block text-xs font-bold text-tri-orange uppercase mb-1">{t.titleLabel}</label>
            <input className="w-full border-b border-gray-300 focus:border-tri-orange outline-none py-2 text-lg font-semibold bg-white text-gray-900 placeholder-gray-400 rounded-none px-0" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.categoryLabel}</label>
             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
               {Object.values(Category).map(cat => {
                 const config = CATEGORY_CONFIG[cat];
                 const isSelected = formData.category === cat;
                 return (
                   <button
                     key={cat}
                     type="button"
                     onClick={() => setFormData({...formData, category: cat as Category})}
                     className={`flex flex-col items-center justify-center p-3 rounded-lg border transition duration-200 ${isSelected ? `border-2 ${config.ring} ${config.bg}` : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                   >
                     <i className={`fa-solid ${config.icon} text-xl mb-1 ${isSelected ? config.color : 'text-gray-400'}`}></i>
                     <span className={`text-[10px] font-bold uppercase truncate w-full text-center ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{getCategoryLabel(cat, t)}</span>
                   </button>
                 )
               })}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.priceLabel} ($)</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-tri-orange focus:border-tri-orange" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.brandLabel}</label>
              <input className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-tri-orange focus:border-tri-orange" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.conditionLabel}</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(Condition).map(c => {
                 const isSelected = formData.condition === c;
                 return (
                   <button 
                     key={c}
                     type="button"
                     onClick={() => setFormData({...formData, condition: c as Condition})}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${isSelected ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                   >
                     {getConditionLabel(c, t)}
                   </button>
                 )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.descLabel}</label>
            <textarea className="w-full border border-gray-300 rounded-lg p-2.5 h-24 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-tri-orange focus:border-tri-orange" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.tagsLabel}</label>
            <input className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-1 focus:ring-tri-orange focus:border-tri-orange" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
          </div>
          <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={saving} className="flex-1 bg-tri-orange text-white font-bold py-4 rounded-xl shadow-md hover:bg-orange-600 transition text-lg order-1">
              {saving ? (isEditing ? t.saving : t.publishing) : (isEditing ? t.saveChangesBtn : t.publishBtn)}
            </button>
            {isEditing && onDelete && (
               <button type="button" onClick={onDelete} className="px-6 py-4 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition order-3 sm:order-2">
                <i className="fa-solid fa-trash sm:mr-2"></i> <span className="hidden sm:inline">{t.deleteAction}</span>
              </button>
            )}
            <button type="button" onClick={onCancel} className="px-6 py-4 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition order-2 sm:order-3">
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. PRODUCT DETAIL VIEW
const ProductDetailView = ({ product, onBack, t, user, onEdit, onDelete }: any) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const canEdit = user && (user.role === 'admin' || (user.role === 'seller' && user.id === product.userId));

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(prev => (prev === product.imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? product.imageUrls.length - 1 : prev - 1));
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-tri-orange transition flex items-center text-sm font-medium">
          <i className="fa-solid fa-arrow-left mr-2"></i> {t.backToMarket}
        </button>
        {canEdit && (
          <div className="flex space-x-2">
            <button onClick={() => onEdit(product)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-300 transition">
              <i className="fa-solid fa-pen mr-1"></i> {t.editAction}
            </button>
            <button onClick={() => onDelete(product.id)} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-200 transition">
              <i className="fa-solid fa-trash mr-1"></i> {t.deleteAction}
            </button>
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col">
          <div className="relative aspect-square w-full bg-white overflow-hidden group">
            <img src={product.imageUrls[activeImageIndex]} alt={product.title} className="w-full h-full object-cover object-center transition duration-500" />
            
            {/* Navigation Arrows for Main Image */}
            {product.imageUrls.length > 1 && (
              <>
                 <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                    <i className="fa-solid fa-chevron-left"></i>
                 </button>
                 <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                    <i className="fa-solid fa-chevron-right"></i>
                 </button>
              </>
            )}

            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${product.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}>
               {product.status === 'published' ? t.available : t.draft}
             </div>
          </div>
          {product.imageUrls.length > 1 && (
            <div className="flex overflow-x-auto p-4 space-x-2 border-t border-gray-100 no-scrollbar">
              {product.imageUrls.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition ${activeImageIndex === idx ? 'border-tri-orange opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-tri-orange font-bold text-sm tracking-wide uppercase">{getCategoryLabel(product.category, t)}</span>
            <span className="text-gray-400 text-sm">{new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <div className="text-4xl font-bold text-gray-900 mb-6">
            ${product.price.toLocaleString()} <span className="text-lg text-gray-400 font-normal">{product.currency}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div><p className="text-xs text-gray-500 uppercase font-bold">{t.brandLabel}</p><p className="font-medium text-gray-900">{product.brand}</p></div>
            <div><p className="text-xs text-gray-500 uppercase font-bold">{t.conditionLabel}</p><p className="font-medium text-gray-900">{getConditionLabel(product.condition, t)}</p></div>
          </div>
          <div className="mb-8"><h3 className="font-bold text-gray-900 mb-2">{t.descLabel}</h3><p className="text-gray-600 leading-relaxed">{product.description}</p></div>
          <div className="mb-8 flex flex-wrap gap-2">
              {product.tags.map((tag: string) => <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">#{tag}</span>)}
          </div>
          <div className="mt-auto">
            <button className="w-full bg-tri-dark text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center justify-center">
              <i className="fa-regular fa-envelope mr-2"></i> {t.contactSeller}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. USER MANAGEMENT VIEW (Updated with Edit Capability)
const UserManagementView = ({ t, currentUser }: { t: any, currentUser: User | null }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert(t.roleUpdated);
    } catch (e) { alert(t.updateError); }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const saveUserEdit = async (updatedData: { name: string, whatsapp: string, phone: string }) => {
      if (!editingUser) return;
      try {
          await adminService.updateUserProfile(editingUser.id, updatedData);
          setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updatedData } : u));
          setEditingUser(null);
          alert("Usuario actualizado correctamente");
      } catch (e) {
          alert("Error al actualizar usuario. Verifique permisos.");
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.usersTitle}</h2>
        <button onClick={loadUsers} className="text-tri-orange hover:bg-orange-50 px-3 py-1 rounded transition text-sm font-bold">
           <i className="fa-solid fa-rotate-right mr-1"></i> Recargar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[200px]">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2 text-tri-orange"></i>
            <span>{t.loading}...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <h3 className="text-lg font-bold text-gray-900 mb-2">No se encontraron usuarios</h3>
             {error && <p className="text-sm text-red-500 mt-2 max-w-md">Es probable que falten permisos en la base de datos. Asegúrate de haber ejecutado el script SQL para configurar los perfiles de Admin.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="bg-gray-50 px-6 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex justify-between">
               <span>Total: {users.length}</span>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                           {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-gray-400 p-2"></i>}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.whatsapp && <div><i className="fa-brands fa-whatsapp text-green-500 mr-1"></i> {u.whatsapp}</div>}
                      {u.phone && <div><i className="fa-solid fa-phone text-gray-400 mr-1"></i> {u.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          u.role === 'seller' ? 'bg-tri-orange/10 text-tri-orange' : 'bg-green-100 text-green-800'}`}>
                         {u.role.toUpperCase()}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="border border-gray-300 rounded text-xs p-1 focus:ring-2 focus:ring-tri-orange outline-none bg-white text-gray-900"
                          disabled={u.id === currentUser?.id} 
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => handleEditUser(u)} className="text-gray-400 hover:text-tri-orange transition">
                            <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Edit User Modal */}
      {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-900">{t.editUser}</h3>
                      <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600"><i className="fa-solid fa-times"></i></button>
                  </div>
                  <div className="p-6">
                      <UserEditForm user={editingUser} onSave={saveUserEdit} onCancel={() => setEditingUser(null)} t={t} />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const UserEditForm = ({ user, onSave, onCancel, t }: any) => {
    const [formData, setFormData] = useState({ name: user.name, whatsapp: user.whatsapp || '', phone: user.phone || '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.nameLabel}</label>
                <input className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-tri-orange outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label>
                <input className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-tri-orange outline-none" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label>
                <input className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-tri-orange outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-tri-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600">Guardar</button>
                <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-lg hover:bg-gray-200">Cancelar</button>
            </div>
        </form>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [siteConfig, setSiteConfig] = useState<SiteSettings>({
    siteName: 'Mercado Tri',
    siteDescription: 'La plataforma líder para productos de triatlón.',
    defaultLanguage: 'es',
    aiProvider: 'gemini'
  });
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [view, setView] = useState('marketplace'); 
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  
  // Marketplace Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  // Inventory Filters
  const [invSearchTerm, setInvSearchTerm] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('All');
  const [invSortOrder, setInvSortOrder] = useState('newest');
  const [invPriceMin, setInvPriceMin] = useState<string>('');
  const [invPriceMax, setInvPriceMax] = useState<string>('');

  const [analysisData, setAnalysisData] = useState<AIAnalysisResult | null>(null);
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventoryViewMode, setInventoryViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<Set<string>>(new Set());

  const t = translations[language];

  // Load Config on Mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const settings = await configService.getSettings();
        setSiteConfig(settings);
        setLanguage(settings.defaultLanguage);
      } catch (e) {
        console.error("Config fetch error", e);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const u = await (authService as any).getSessionUser();
        if (u) setUser(u);
      } catch (e) { console.log("No active session"); }
    };
    checkAuth();
    loadProducts();
  }, []);

  useEffect(() => {
    if (view === 'edit' && !analysisData) setView('upload');
    if (view === 'product-detail' && !selectedProduct) setView('marketplace');
    if (view === 'inventory') {
       if (!user) setView('login');
       else if (user.role === 'buyer') setView('marketplace');
    }
    if (view === 'upload') {
       if (!user) setView('login');
       else if (user.role === 'buyer') setView('marketplace');
    }
    if (view === 'users' && (!user || user.role !== 'admin')) setView('marketplace');
    if (view === 'config' && (!user || user.role !== 'admin')) setView('marketplace');
    if (view === 'profile' && !user) setView('login');
  }, [view, analysisData, selectedProduct, user]);

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (e: any) { 
        console.error("Failed to load products", e); 
        setProductsError("Error cargando productos. Verifica tu conexión o permisos.");
    } finally {
        setProductsLoading(false);
    }
  };

  const filteredMarketplaceProducts = products.filter(p => {
    // Show products even if status is missing in DB (defaulting to published in mapper)
    if (p.status === 'draft') return false; 
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      p.title.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesCondition = selectedCondition === 'All' || p.condition === selectedCondition;
    const min = priceMin ? parseFloat(priceMin) : 0;
    const max = priceMax ? parseFloat(priceMax) : Infinity;
    const matchesPrice = p.price >= min && p.price <= max;
    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setView('marketplace');
  };

  const handleAnalysisComplete = (data: AIAnalysisResult, imgs: string[]) => {
    setAnalysisData(data); setUploadImages(imgs); setEditingId(null); setView('edit');
  };

  const handleEditProduct = (product: Product) => {
    setAnalysisData({
      title: product.title, category: product.category, brand: product.brand, condition: product.condition,
      description: product.description, suggestedPrice: product.price, tags: product.tags, confidenceScore: 1
    });
    setUploadImages(product.imageUrls); setEditingId(product.id); setView('edit');
  };

  const handleDeleteProduct = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Explicit Window Confirmation Dialog
    const isConfirmed = window.confirm(t.confirmDelete);
    if (!isConfirmed) return;

    try {
      await productService.delete(id);
      
      // Optimistic update: Remove from UI immediately
      setProducts(prev => prev.filter(p => p.id !== id));
      
      // Redirect logic if we are in a detail/edit view
      if (view === 'product-detail' || view === 'edit') {
          if (user?.role === 'admin' || user?.role === 'seller') {
            setView('inventory');
          } else {
            setView('marketplace');
          }
      }
      // alert(t.deletedSuccess); // Optional feedback, keeping it clean for now as item disappears
    } catch (err: any) { 
        alert(`Error eliminando producto: ${err.message || 'Error desconocido'}\n\nNota: Si eres Admin, verifica que has ejecutado el script SQL de Políticas (RLS) en Supabase.`); 
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInventoryItems.size === 0) return;
    
    // Explicit Window Confirmation Dialog
    const isConfirmed = window.confirm(t.confirmBulkDelete);
    if (!isConfirmed) return;

    try {
      const ids = Array.from(selectedInventoryItems) as string[];
      await productService.deleteMany(ids);
      setSelectedInventoryItems(new Set());
      // Optimistic update
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    } catch (err: any) { 
        alert(`Error eliminando productos: ${err.message || 'Error desconocido'}\n\nNota: Si eres Admin, verifica que has ejecutado el script SQL de Políticas (RLS) en Supabase.`); 
    }
  };

  const toggleInventoryItemSelection = (id: string) => {
    const newSet = new Set(selectedInventoryItems);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedInventoryItems(newSet);
  };

  const selectAllInventoryItems = (items: Product[]) => {
    if (selectedInventoryItems.size === items.length) setSelectedInventoryItems(new Set());
    else setSelectedInventoryItems(new Set(items.map(p => p.id)));
  };

  const handleSaveProduct = async (productData: any) => {
    if (editingId) await productService.update(editingId, productData);
    else await productService.create(productData);
    await loadProducts();
    setAnalysisData(null); setUploadImages([]); setEditingId(null);
    if (user?.role === 'admin' || user?.role === 'seller') setView('inventory');
    else setView('marketplace');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product); setView('product-detail');
  };

  const getScreenContext = () => {
    const roleStr = user ? user.role : 'visitante';
    switch (view) {
      case 'product-detail':
        return selectedProduct ? `Usuario (${roleStr}) ve ${selectedProduct.title}, $${selectedProduct.price}.` : '';
      case 'marketplace':
        return `Usuario (${roleStr}) en tienda.`;
      default: return "Navegando.";
    }
  };

  const getProcessedInventory = (inventoryProducts: Product[]) => {
    return inventoryProducts
      .filter(p => {
        const searchLower = invSearchTerm.toLowerCase();
        const matchesSearch = !invSearchTerm || p.title.toLowerCase().includes(searchLower) || p.brand.toLowerCase().includes(searchLower);
        const matchesStatus = invStatusFilter === 'All' || p.status === invStatusFilter;
        const min = invPriceMin ? parseFloat(invPriceMin) : 0;
        const max = invPriceMax ? parseFloat(invPriceMax) : Infinity;
        const matchesPrice = p.price >= min && p.price <= max;
        return matchesSearch && matchesStatus && matchesPrice;
      })
      .sort((a, b) => {
        if (invSortOrder === 'newest') return b.createdAt - a.createdAt;
        if (invSortOrder === 'oldest') return a.createdAt - b.createdAt;
        if (invSortOrder === 'priceHigh') return b.price - a.price;
        if (invSortOrder === 'priceLow') return a.price - b.price;
        return 0;
      });
  };

  // Sort products by Category to ensure continuous flow
  const getSortedMarketplaceProducts = () => {
    const categoryOrder: Record<string, number> = {
        [Category.TRIATHLON]: 1,
        [Category.CYCLING]: 2,
        [Category.RUNNING]: 3,
        [Category.SWIMMING]: 4,
        [Category.OTHER]: 5
    };

    return [...filteredMarketplaceProducts].sort((a, b) => {
        const catOrderA = categoryOrder[a.category] || 99;
        const catOrderB = categoryOrder[b.category] || 99;
        if (catOrderA !== catOrderB) return catOrderA - catOrderB;
        // Secondary Sort: Newest First
        return b.createdAt - a.createdAt;
    });
  };

  const renderContent = () => {
    switch (view) {
      case 'login': return <LoginView onLoginSuccess={(u) => { setUser(u); setView('marketplace'); }} t={t} siteConfig={siteConfig} />;
      case 'upload': return <UploadView onAnalysisComplete={handleAnalysisComplete} onCancel={() => setView('marketplace')} t={t} />;
      case 'edit': return analysisData ? <EditView initialData={analysisData} images={uploadImages} onSave={handleSaveProduct} onCancel={() => setView('marketplace')} t={t} isEditing={!!editingId} onDelete={() => editingId && handleDeleteProduct(editingId)} /> : null;
      case 'product-detail': return selectedProduct ? <ProductDetailView product={selectedProduct} onBack={() => setView('marketplace')} t={t} user={user} onEdit={handleEditProduct} onDelete={handleDeleteProduct} /> : null;
      case 'users': return user?.role === 'admin' ? <UserManagementView t={t} currentUser={user} /> : null;
      case 'config': return user?.role === 'admin' ? <ConfigView siteConfig={siteConfig} onUpdateConfig={setSiteConfig} t={t} /> : null;
      case 'profile': return user ? <ProfileView user={user} t={t} onUpdateUser={setUser} /> : null;
      case 'marketplace':
        const sortedProducts = getSortedMarketplaceProducts();
        return (
          <div className="space-y-6">
            {/* Removed Hero Banner Section as requested */}

            {/* Marketplace Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
               <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-tri-orange transition-colors"></i>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-tri-blue via-tri-green to-tri-orange p-[2px] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                        <input type="text" placeholder={t.searchPlaceholder} className="relative w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-transparent bg-white text-gray-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex space-x-2 w-full md:w-auto">
                         <div className="relative flex-1 md:w-28"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input type="number" placeholder={t.minPrice} className="w-full pl-6 pr-2 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tri-orange" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} /></div>
                         <div className="relative flex-1 md:w-28"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input type="number" placeholder={t.maxPrice} className="w-full pl-6 pr-2 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tri-orange" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} /></div>
                    </div>
               </div>
               
               {/* Category Tabs */}
               <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
                  <button onClick={() => setSelectedCategory('All')} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition ${selectedCategory === 'All' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    {t.anyCategory}
                  </button>
                  {Object.values(Category).map(cat => {
                      const config = CATEGORY_CONFIG[cat];
                      const isSelected = selectedCategory === cat;
                      return (
                          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition flex items-center space-x-2 ${isSelected ? `bg-gray-900 text-white border-gray-900` : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                             <i className={`fa-solid ${config.icon} ${isSelected ? 'text-tri-orange' : 'text-gray-400'}`}></i>
                             <span>{getCategoryLabel(cat, t)}</span>
                          </button>
                      )
                  })}
               </div>
            </div>

            {productsLoading ? (
                 <div className="flex justify-center items-center py-20">
                    <div className="flex flex-col items-center">
                        <i className="fa-solid fa-bicycle fa-bounce text-4xl text-tri-orange mb-4"></i>
                        <span className="text-gray-500 font-bold">{t.loading}...</span>
                    </div>
                 </div>
            ) : productsError ? (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                    <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-2"></i>
                    <p className="text-red-700 font-bold">{productsError}</p>
                    <button onClick={loadProducts} className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 font-bold hover:bg-red-50 transition">Reintentar</button>
                </div>
            ) : sortedProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                         <i className="fa-solid fa-magnifying-glass text-gray-400 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No se encontraron productos</h3>
                    <p className="text-gray-500">Intenta cambiar los filtros de búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                    {sortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
                    ))}
                </div>
            )}
          </div>
        );
      case 'inventory':
        if (!user || user.role === 'buyer') return null;
        const baseInventory = user.role === 'admin' ? products : products.filter(p => p.userId === user.id);
        const processedInventory = getProcessedInventory(baseInventory);
        return (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div><h2 className="text-2xl font-bold text-gray-900">{t.myInventory}</h2><p className="text-sm text-gray-500">{processedInventory.length} items</p></div>
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {selectedInventoryItems.size > 0 && (
                   <button onClick={handleBulkDelete} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition"><i className="fa-solid fa-trash-can mr-2"></i>{t.deleteSelected} ({selectedInventoryItems.size})</button>
                )}
                <div className="bg-white border border-gray-200 rounded-lg flex overflow-hidden">
                  <button onClick={() => setInventoryViewMode('grid')} className={`px-3 py-2 ${inventoryViewMode === 'grid' ? 'bg-gray-100 text-tri-orange' : 'text-gray-500 hover:bg-gray-50'}`}><i className="fa-solid fa-border-all"></i></button>
                  <div className="w-px bg-gray-200"></div>
                  <button onClick={() => setInventoryViewMode('list')} className={`px-3 py-2 ${inventoryViewMode === 'list' ? 'bg-gray-100 text-tri-orange' : 'text-gray-500 hover:bg-gray-50'}`}><i className="fa-solid fa-list-ul"></i></button>
                </div>
                <button onClick={() => setView('upload')} className="bg-tri-dark text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition flex items-center"><i className="fa-solid fa-plus mr-1"></i> <span className="hidden sm:inline">{t.addNew}</span></button>
              </div>
            </div>
            {/* Inventory Filters UI */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center flex-wrap">
               <div className="relative flex-1 w-full md:w-auto min-w-[200px]">
                 <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                 <input type="text" placeholder={t.searchInvPlaceholder} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tri-orange text-sm bg-white" value={invSearchTerm} onChange={(e) => setInvSearchTerm(e.target.value)} />
               </div>
               <div className="flex space-x-2 w-full md:w-auto">
                  <div className="relative w-24"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input type="number" placeholder="Min" className="w-full pl-5 pr-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tri-orange" value={invPriceMin} onChange={(e) => setInvPriceMin(e.target.value)} /></div>
                  <div className="relative w-24"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input type="number" placeholder="Max" className="w-full pl-5 pr-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tri-orange" value={invPriceMax} onChange={(e) => setInvPriceMax(e.target.value)} /></div>
                </div>
               <select className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tri-orange bg-white" value={invStatusFilter} onChange={(e) => setInvStatusFilter(e.target.value)}>
                 <option value="All">{t.anyStatus}</option><option value="published">Published</option><option value="draft">Draft</option>
               </select>
               <select className="w-full md:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tri-orange bg-white" value={invSortOrder} onChange={(e) => setInvSortOrder(e.target.value)}>
                 <option value="newest">{t.sortNewest}</option><option value="oldest">{t.sortOldest}</option><option value="priceHigh">{t.sortPriceHigh}</option><option value="priceLow">{t.sortPriceLow}</option>
               </select>
            </div>
            {/* List/Grid View Rendering */}
            {baseInventory.length === 0 ? <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300"><p className="text-gray-500 mb-4">{t.emptyInventory}</p><button onClick={() => setView('upload')} className="text-tri-orange font-bold">{t.startSelling}</button></div> : 
             (inventoryViewMode === 'grid' ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{processedInventory.map(p => <ProductCard key={p.id} product={p} onClick={() => handleProductClick(p)} showStatus />)}</div> : 
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left"><input type="checkbox" className="rounded text-tri-orange cursor-pointer bg-white border-gray-300" checked={selectedInventoryItems.size === processedInventory.length && processedInventory.length > 0} onChange={() => selectAllInventoryItems(processedInventory)} /></th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t.titleLabel}</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t.categoryLabel}</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t.priceLabel}</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{processedInventory.map((p) => (<tr key={p.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4"><input type="checkbox" className="rounded text-tri-orange cursor-pointer bg-white border-gray-300" checked={selectedInventoryItems.has(p.id)} onChange={() => toggleInventoryItemSelection(p.id)} /></td><td className="px-6 py-4"><div className="flex items-center"><div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden mr-3 border border-gray-200"><img className="h-full w-full object-cover object-center" src={p.imageUrls[0]} alt="" /></div><div><div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-tri-orange" onClick={() => handleProductClick(p)}>{p.title}</div><div className="text-xs text-gray-500">{p.brand}</div></div></div></td><td className="px-6 py-4"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{getCategoryLabel(p.category, t)}</span></td><td className="px-6 py-4 text-sm text-gray-500 font-mono">${p.price.toLocaleString()}</td><td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status === 'published' ? 'Active' : 'Draft'}</span></td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => handleEditProduct(p)} className="text-tri-blue hover:text-blue-900 mr-4"><i className="fa-solid fa-pen"></i></button><button onClick={(e) => handleDeleteProduct(p.id, e)} className="text-red-500 hover:text-red-700"><i className="fa-solid fa-trash"></i></button></td></tr>))}</tbody>
              </table></div></div>)}
          </div>
        );
    }
  };

  return (
    <Layout user={user} activePage={view} onNavigate={setView} onLogout={handleLogout} language={language} onToggleLanguage={() => setLanguage(prev => prev === 'es' ? 'en' : 'es')} t={t} siteConfig={siteConfig}>
      {renderContent()}
      <TriBot currentContext={getScreenContext()} />
    </Layout>
  );
};

export default App;
