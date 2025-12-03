
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { ProductCard } from './components/ProductCard';
import { TriBot } from './components/TriBot'; 
import { authService, productService, adminService, configService } from './services/mockBackend';
import { analyzeProductImage, generateShopName, generateShopDescription } from './services/geminiService';
import { Product, User, Category, Condition, AIAnalysisResult, UserRole, SiteSettings, AIProvider, ShopSummary } from './types';

// --- Translation Dictionary ---
const translations = {
  es: {
    navShop: 'Mercado',
    navShops: 'Tiendas',
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
    googleLogin: 'Continuar con Google',
    githubLogin: 'Continuar con GitHub',
    or: 'o',
    
    // Roles
    roleAdmin: 'Administrador',
    roleSeller: 'Vendedor',
    roleBuyer: 'Comprador',

    // Profile
    myProfile: 'Mi Perfil',
    profileTitle: 'Editar Perfil',
    saveProfile: 'Guardar Perfil',
    profileSaved: 'Perfil actualizado con éxito',
    changeAvatar: 'Cambiar Foto',
    
    // Shop
    shopConfigTitle: 'Configura tu Tienda',
    shopEditTitle: 'Editar Tienda',
    shopConfigDesc: 'Para vender, primero necesitas crear tu tienda. Elige un nombre, sube un logo y comienza.',
    shopNameLabel: 'Nombre de la Tienda',
    shopDescLabel: 'Descripción de la Tienda',
    shopLogoLabel: 'Logo de la Tienda',
    generateAiBtn: 'Generar con IA',
    createShopBtn: 'Crear Tienda',
    saveShopBtn: 'Guardar Cambios',
    myShopDashboard: 'Panel de Mi Tienda',
    editShop: 'Editar Tienda',
    allShopsTitle: 'Todas las Tiendas',
    searchShops: 'Buscar tiendas...',
    noShopsFound: 'No se encontraron tiendas activas.',
    
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
    currencyLabel: 'Moneda',
    brandLabel: 'Marca',
    conditionLabel: 'Condición',
    statusLabel: 'Estado',
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
    sold: 'Vendido',
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
    featuredShops: 'Tiendas Destacadas',
    viewShop: 'Ver Tienda',
    productsCount: 'productos',

    // Admin / Actions
    editAction: 'Editar',
    deleteAction: 'Eliminar',
    confirmDelete: '¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.',
    confirmBulkDelete: '¿Estás seguro que deseas eliminar los productos seleccionados?',
    deletedSuccess: 'Producto eliminado correctamente.',

    // Config
    configTitle: 'Configuración del Sitio',
    siteNameLabel: 'Nombre del Sitio',
    siteDescLabel: 'Descripción del Sitio',
    logoUrlLabel: 'URL del Logo (o subir)',
    aiConfigTitle: 'Configuración de Inteligencia Artificial',
    aiProviderLabel: 'Proveedor de IA',
    apiKeyLabel: 'API Key',
    modelLabel: 'Modelo',
    saveConfig: 'Guardar Configuración'
  },
  en: {
    navShop: 'Market',
    navShops: 'Shops',
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
    googleLogin: 'Continue with Google',
    githubLogin: 'Continue with GitHub',
    or: 'or',
    
    // Roles
    roleAdmin: 'Admin',
    roleSeller: 'Seller',
    roleBuyer: 'Buyer',

    // Profile
    myProfile: 'My Profile',
    profileTitle: 'Edit Profile',
    saveProfile: 'Save Profile',
    profileSaved: 'Profile updated successfully',
    changeAvatar: 'Change Photo',

    // Shop
    shopConfigTitle: 'Configure your Shop',
    shopEditTitle: 'Edit Shop',
    shopConfigDesc: 'To start selling, you need to create your shop first. Choose a name, upload a logo, and start.',
    shopNameLabel: 'Shop Name',
    shopDescLabel: 'Shop Description',
    shopLogoLabel: 'Shop Logo',
    generateAiBtn: 'Generate with AI',
    createShopBtn: 'Create Shop',
    saveShopBtn: 'Save Changes',
    myShopDashboard: 'My Shop Dashboard',
    editShop: 'Edit Shop',
    allShopsTitle: 'All Shops',
    searchShops: 'Search shops...',
    noShopsFound: 'No active shops found.',

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
    currencyLabel: 'Currency',
    brandLabel: 'Brand',
    conditionLabel: 'Condition',
    statusLabel: 'Status',
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
    sold: 'Sold',
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
    featuredShops: 'Featured Shops',
    viewShop: 'View Shop',
    productsCount: 'products',

    // Admin / Actions
    editAction: 'Edit',
    deleteAction: 'Delete',
    confirmDelete: 'Are you sure you want to delete this product? This action cannot be undone.',
    confirmBulkDelete: 'Are you sure you want to delete the selected products?',
    deletedSuccess: 'Product deleted successfully.',

    // Config
    configTitle: 'Site Configuration',
    siteNameLabel: 'Site Name',
    siteDescLabel: 'Site Description',
    logoUrlLabel: 'Logo URL (or upload)',
    aiConfigTitle: 'AI Configuration',
    aiProviderLabel: 'AI Provider',
    apiKeyLabel: 'API Key',
    modelLabel: 'Model',
    saveConfig: 'Save Configuration'
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

const getRoleLabel = (role: string, t: any) => {
  const map: Record<string, string> = {
    'admin': t.roleAdmin,
    'seller': t.roleSeller,
    'buyer': t.roleBuyer
  };
  return map[role] || role;
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

const getPriceDisplay = (price: number, currency?: string) => {
  const symbol = currency === 'USD' ? 'U$S' : currency === 'EUR' ? '€' : '$';
  return `${symbol} ${price.toLocaleString()}`;
};

// --- NEW SHOP VIEWS ---

const ShopConfigView = ({ user, t, onShopCreated, isEditing }: { user: User, t: any, onShopCreated: (u: User) => void, isEditing?: boolean }) => {
    const [shopName, setShopName] = useState(user.shopName || user.name || '');
    const [shopDesc, setShopDesc] = useState(user.shopDescription || '');
    const [shopImage, setShopImage] = useState<string | null>(user.shopImageUrl || null);
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
        setSaving(true);
        try {
            const updatedUser = await (authService as any).createShop(user.id, shopName, shopImage, shopDesc);
            onShopCreated(updatedUser);
        } catch (e) {
            console.error(e);
            alert("Error guardando datos de la tienda.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
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

const MyShopView = ({ user, t, onViewProduct, onEditShop }: { user: User, t: any, onViewProduct: (p: Product) => void, onEditShop: () => void }) => {
    const [stats, setStats] = useState({ total: 0, active: 0, sold: 0, revenue: 0 });
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadShopData = async () => {
            setLoading(true);
            try {
                const s = await productService.getShopStats(user.id);
                setStats(s);
                const allProds = await productService.getAll();
                setProducts(allProds.filter(p => p.userId === user.id));
            } catch(e) { console.error(e); } 
            finally { setLoading(false); }
        };
        loadShopData();
    }, [user.id]);

    const StatCard = ({ icon, label, value, color }: any) => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
                <i className={`fa-solid ${icon} text-xl`}></i>
            </div>
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-start">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mr-4 overflow-hidden border border-gray-100 flex-shrink-0">
                        {user.shopImageUrl ? (
                            <img src={user.shopImageUrl} alt={user.shopName} className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-solid fa-store text-3xl text-gray-400"></i>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <h2 className="text-2xl font-bold text-gray-900">{user.shopName}</h2>
                             <button onClick={onEditShop} className="text-gray-400 hover:text-tri-orange transition"><i className="fa-solid fa-pen-to-square"></i></button>
                        </div>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">{t.myShopDashboard}</p>
                        {user.shopDescription && <p className="text-sm text-gray-600 italic max-w-lg">"{user.shopDescription}"</p>}
                    </div>
                </div>
                <button className="bg-gradient-to-r from-tri-blue to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2">
                    <i className="fa-solid fa-robot"></i> AI Sales Assistant
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="fa-box" label="Total Productos" value={stats.total} color="bg-blue-50 text-blue-500" />
                <StatCard icon="fa-check-circle" label="Activos" value={stats.active} color="bg-green-50 text-green-500" />
                <StatCard icon="fa-handshake" label="Vendidos" value={stats.sold} color="bg-purple-50 text-purple-500" />
                <StatCard icon="fa-sack-dollar" label="Ingresos (Est.)" value={`$${stats.revenue}`} color="bg-orange-50 text-orange-500" />
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-700">Tus Productos Recientes</div>
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Cargando...</div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No hay productos en tu tienda.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                         {products.slice(0, 4).map(p => (
                             <ProductCard key={p.id} product={p} onClick={() => onViewProduct(p)} categoryLabel={getCategoryLabel(p.category, t)} showStatus />
                         ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ShopsListView = ({ shops, t, onSelectShop }: { shops: ShopSummary[], t: any, onSelectShop: (id: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredShops = shops.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <h2 className="text-3xl font-sport font-bold text-gray-900 uppercase">{t.allShopsTitle}</h2>
                <input 
                    type="text" 
                    placeholder={t.searchShops} 
                    className="w-full md:w-80 px-4 py-2 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-tri-orange outline-none"
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
                             <div className="w-24 h-24 rounded-full bg-gray-50 mb-4 overflow-hidden border-2 border-gray-100 group-hover:border-tri-orange transition shadow-sm">
                                 {shop.shopImageUrl ? (
                                     <img src={shop.shopImageUrl} className="w-full h-full object-cover"/>
                                 ) : (
                                     <i className="fa-solid fa-store text-4xl text-gray-300 mt-6 block"></i>
                                 )}
                             </div>
                             <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-tri-orange transition">{shop.name}</h3>
                             <p className="text-sm text-gray-500 mb-4 font-medium">{shop.productCount} {t.productsCount}</p>
                             <button className="mt-auto w-full bg-gray-50 text-gray-600 font-bold py-2 rounded-lg group-hover:bg-tri-orange group-hover:text-white transition text-sm">
                                 {t.viewShop}
                             </button>
                         </div>
                     ))}
                </div>
            )}
        </div>
    );
};

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
      } catch (error: any) {
        console.error(error);
        alert(error.message || t.analysisError);
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

const EditView = ({ initialData, images: initialImages, onSave, onCancel, t, isEditing, onDelete }: any) => {
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    category: initialData.category,
    brand: initialData.brand,
    condition: initialData.condition,
    price: initialData.suggestedPrice || initialData.price || 0,
    currency: initialData.currency || 'ARS',
    tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
    status: initialData.status || 'published'
  });
  const [localImages, setLocalImages] = useState<string[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const addImgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocalImages(initialImages); }, [initialImages]);

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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
        tags: formData.tags.split(',').map((t: string) => t.trim())
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
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.priceLabel}</label>
              <div className="flex rounded-lg shadow-sm">
                <select 
                  className="bg-gray-100 border border-r-0 border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-tri-orange focus:border-tri-orange block p-2.5 outline-none"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <input 
                  type="number" 
                  className="rounded-none rounded-r-lg bg-white border border-gray-300 text-gray-900 focus:ring-1 focus:ring-tri-orange focus:border-tri-orange block flex-1 min-w-0 w-full text-sm p-2.5 outline-none" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                />
              </div>
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.brandLabel}</label>
              <input className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-tri-orange focus:border-tri-orange" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
          </div>
          
          {/* Status Selector for Edit Mode */}
          {isEditing && (
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.statusLabel}</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="published">{t.available}</option>
                      <option value="draft">{t.draft}</option>
                      <option value="sold">{t.sold}</option>
                  </select>
              </div>
          )}

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

const ConfigView = ({ siteConfig, onUpdateConfig, t }: { siteConfig: SiteSettings, onUpdateConfig: (s: SiteSettings) => void, t: any }) => {
    const [config, setConfig] = useState<SiteSettings>(siteConfig);
    const [logoBase64, setLogoBase64] = useState<string | undefined>(undefined);
    const [saving, setSaving] = useState(false);
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setLogoBase64(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await configService.updateSettings(config, logoBase64);
            onUpdateConfig({...config, logoUrl: logoBase64 || config.logoUrl});
            alert("Configuración guardada.");
        } catch (e) {
            console.error(e);
            alert("Error guardando configuración.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.configTitle}</h2>
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.siteNameLabel}</label>
                    <input className="w-full px-4 py-2 border rounded-lg bg-white" value={config.siteName} onChange={e => setConfig({...config, siteName: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.siteDescLabel}</label>
                    <input className="w-full px-4 py-2 border rounded-lg bg-white" value={config.siteDescription} onChange={e => setConfig({...config, siteDescription: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.logoUrlLabel}</label>
                    <div className="flex items-center gap-4">
                        <input type="file" onChange={handleLogoChange} className="text-sm" accept="image/*" />
                        {(logoBase64 || config.logoUrl) && <img src={logoBase64 || config.logoUrl} className="h-10 w-10 object-contain" />}
                    </div>
                </div>
                
                <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t.aiConfigTitle}</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.aiProviderLabel}</label>
                            <select 
                                className="w-full px-4 py-2 border rounded-lg bg-white"
                                value={config.aiProvider}
                                onChange={e => setConfig({...config, aiProvider: e.target.value as AIProvider})}
                            >
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI (GPT-4)</option>
                            </select>
                        </div>
                        {config.aiProvider === 'gemini' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gemini {t.apiKeyLabel}</label>
                                    <input type="password" className="w-full px-4 py-2 border rounded-lg bg-white" value={config.geminiApiKey || ''} onChange={e => setConfig({...config, geminiApiKey: e.target.value})} placeholder="AIzaSy..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gemini {t.modelLabel}</label>
                                    <input className="w-full px-4 py-2 border rounded-lg bg-white" value={config.geminiModel || 'gemini-2.5-flash'} onChange={e => setConfig({...config, geminiModel: e.target.value})} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">OpenAI {t.apiKeyLabel}</label>
                                    <input type="password" className="w-full px-4 py-2 border rounded-lg bg-white" value={config.openaiApiKey || ''} onChange={e => setConfig({...config, openaiApiKey: e.target.value})} placeholder="sk-..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">OpenAI {t.modelLabel}</label>
                                    <input className="w-full px-4 py-2 border rounded-lg bg-white" value={config.openaiModel || 'gpt-4o'} onChange={e => setConfig({...config, openaiModel: e.target.value})} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800">{saving ? t.saving : t.saveConfig}</button>
            </form>
        </div>
    );
};

const ProfileView = ({ user, t, onUpdateUser, getRoleLabel }: { user: User, t: any, onUpdateUser: (u: User) => void, getRoleLabel: (r: string) => string }) => {
    const [name, setName] = useState(user.name);
    const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setAvatarBase64(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await authService.updateProfile(user.id, { name, whatsapp, phone }, avatarBase64);
            onUpdateUser(updated);
            alert(t.profileSaved);
        } catch (e) {
            console.error(e);
            alert("Error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
             <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.profileTitle}</h2>
             <form onSubmit={handleSave} className="space-y-6">
                 <div className="flex flex-col items-center mb-6">
                     <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-2 relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                         <img src={avatarBase64 || user.avatarUrl || `https://ui-avatars.com/api/?name=${name}`} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs font-bold">{t.changeAvatar}</div>
                     </div>
                     <input type="file" ref={fileRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                     <p className="text-sm font-bold text-gray-500">{user.email}</p>
                     <span className="bg-tri-orange/10 text-tri-orange text-xs font-bold px-2 py-1 rounded mt-1 uppercase">{getRoleLabel(user.role)}</span>
                 </div>
                 
                 <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.nameLabel}</label><input className="w-full px-4 py-2 border rounded-lg bg-white" value={name} onChange={e => setName(e.target.value)} /></div>
                 <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label><input className="w-full px-4 py-2 border rounded-lg bg-white" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} /></div>
                 <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label><input className="w-full px-4 py-2 border rounded-lg bg-white" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                 
                 <button type="submit" disabled={saving} className="w-full bg-tri-orange text-white py-3 rounded-lg font-bold">{saving ? '...' : t.saveProfile}</button>
             </form>
        </div>
    );
};

const UserManagementView = ({ t, currentUser, getRoleLabel }: { t: any, currentUser: User | null, getRoleLabel: (r:string) => string }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const loadUsers = async () => {
        setLoading(true); setErrorMsg('');
        try {
            const u = await adminService.getAllUsers();
            setUsers(u);
            if (u.length === 0) setErrorMsg("No users found. Check RLS policies.");
        } catch (e) {
            console.error(e);
            setErrorMsg("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (e) { alert(t.updateError); }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if(!window.confirm("¿Seguro de borrar este usuario?")) return;
        try {
            await adminService.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch(e) { alert("Error deleting user"); }
    };

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-xl font-bold">{t.usersTitle}</h2>
                 <button onClick={loadUsers} className="text-gray-500 hover:text-tri-orange"><i className="fa-solid fa-rotate-right"></i></button>
             </div>
             {loading ? <div className="p-6 text-center">Loading...</div> : errorMsg ? <div className="p-6 text-center text-red-500">{errorMsg}</div> : 
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                         <tr>
                             <th className="px-6 py-3">User</th>
                             <th className="px-6 py-3">Contact</th>
                             <th className="px-6 py-3">Role</th>
                             <th className="px-6 py-3 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody>
                         {users.map(u => (
                             <tr key={u.id} className="border-b hover:bg-gray-50">
                                 <td className="px-6 py-4 flex items-center gap-3">
                                     <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-8 h-8 rounded-full bg-gray-200" />
                                     <div>
                                         <div className="font-bold text-gray-900">{u.name}</div>
                                         <div className="text-gray-500 text-xs">{u.email}</div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-gray-500">{u.whatsapp || u.phone || '-'}</td>
                                 <td className="px-6 py-4">
                                     <select 
                                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                        disabled={u.id === currentUser?.id} // Prevent locking oneself out
                                     >
                                         <option value="buyer">{t.roleBuyer}</option>
                                         <option value="seller">{t.roleSeller}</option>
                                         <option value="admin">{t.roleAdmin}</option>
                                     </select>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 ml-2" disabled={u.id === currentUser?.id}>
                                         <i className="fa-solid fa-trash"></i>
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>}
        </div>
    );
};

const ProductDetailView = ({ product, onBack, t, user, onEdit, onDelete }: { product: Product, onBack: () => void, t: any, user: User | null, onEdit: (p: Product) => void, onDelete: (id: string) => void }) => {
    const [mainImageIdx, setMainImageIdx] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const images = product.imageUrls.length > 0 ? product.imageUrls : ['https://via.placeholder.com/600'];
    const isOwner = user && (user.id === product.userId || user.role === 'admin');

    const handleNextImg = (e?: React.MouseEvent) => { e?.stopPropagation(); setMainImageIdx((i) => (i + 1) % images.length); };
    const handlePrevImg = (e?: React.MouseEvent) => { e?.stopPropagation(); setMainImageIdx((i) => (i - 1 + images.length) % images.length); };

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
             {/* Lightbox */}
             {isLightboxOpen && (
                 <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setIsLightboxOpen(false)}>
                     <button className="absolute top-4 right-4 text-white text-3xl"><i className="fa-solid fa-times"></i></button>
                     <button className="absolute left-4 text-white text-3xl" onClick={handlePrevImg}><i className="fa-solid fa-chevron-left"></i></button>
                     <img src={images[mainImageIdx]} className="max-h-full max-w-full object-contain" onClick={(e)=>e.stopPropagation()} />
                     <button className="absolute right-4 text-white text-3xl" onClick={handleNextImg}><i className="fa-solid fa-chevron-right"></i></button>
                 </div>
             )}

             <div className="flex flex-col md:flex-row">
                 {/* Images */}
                 <div className="w-full md:w-1/2 bg-gray-50 relative group">
                     <div className="aspect-square w-full relative cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                         <img src={images[mainImageIdx]} className="w-full h-full object-cover" />
                         {images.length > 1 && (
                            <>
                                <button onClick={handlePrevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"><i className="fa-solid fa-chevron-left"></i></button>
                                <button onClick={handleNextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"><i className="fa-solid fa-chevron-right"></i></button>
                            </>
                         )}
                     </div>
                     <div className="flex gap-2 p-4 overflow-x-auto">
                         {images.map((img, i) => (
                             <img key={i} src={img} className={`w-16 h-16 rounded cursor-pointer object-cover border-2 ${i === mainImageIdx ? 'border-tri-orange' : 'border-transparent'}`} onClick={() => setMainImageIdx(i)} />
                         ))}
                     </div>
                 </div>

                 {/* Details */}
                 <div className="w-full md:w-1/2 p-8 flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                         <div>
                             <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide mb-2 inline-block">{getCategoryLabel(product.category, t)}</span>
                             <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                         </div>
                         {isOwner && (
                             <div className="flex gap-2">
                                 <button onClick={() => onEdit(product)} className="text-gray-400 hover:text-blue-600 p-2"><i className="fa-solid fa-pen"></i></button>
                                 <button onClick={() => onDelete(product.id)} className="text-gray-400 hover:text-red-600 p-2"><i className="fa-solid fa-trash"></i></button>
                             </div>
                         )}
                     </div>
                     
                     <div className="text-3xl font-bold text-tri-orange mb-6">{getPriceDisplay(product.price, product.currency)}</div>
                     
                     <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                         <div><span className="text-gray-500 block text-xs uppercase font-bold">{t.brandLabel}</span><span className="font-semibold">{product.brand}</span></div>
                         <div><span className="text-gray-500 block text-xs uppercase font-bold">{t.conditionLabel}</span><span className="font-semibold">{getConditionLabel(product.condition, t)}</span></div>
                     </div>

                     <div className="prose prose-sm text-gray-600 mb-8 flex-grow">
                         <p>{product.description}</p>
                     </div>
                     
                     <div className="mt-auto">
                        <button className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center">
                            <i className="fa-brands fa-whatsapp mr-2 text-xl"></i> {t.contactSeller}
                        </button>
                        <button onClick={onBack} className="w-full mt-3 text-gray-500 font-bold hover:text-gray-800 text-sm">{t.backToMarket}</button>
                     </div>
                 </div>
             </div>
        </div>
    );
};


const LoginView = ({ onLoginSuccess, t, siteConfig, initialError }: { onLoginSuccess: (user: User) => void, t: any, siteConfig: SiteSettings, initialError?: string }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(initialError || '');

    useEffect(() => { if (initialError) setError(initialError); }, [initialError]);

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
    
    // ... Handlers for Google/Github ...
    const handleGoogleLogin = async () => { setLoading(true); try { await authService.loginWithGoogle(); } catch (err: any) { setError(err.message); setLoading(false); } };
    const handleGithubLogin = async () => { setLoading(true); try { await authService.loginWithGithub(); } catch (err: any) { setError(err.message); setLoading(false); } };
    
    const nameParts = siteConfig.siteName.split(' ');
    const firstPart = nameParts[0];
    const restPart = nameParts.slice(1).join(' ');

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                 {/* Logo & Header */}
                 <div className="text-center mb-8">
                    {/* ... Same Logo SVG/Img ... */}
                    <div className="flex justify-center mb-4">
                        {siteConfig.logoUrl ? <img src={siteConfig.logoUrl} className="w-24 h-24 object-contain" /> : 
                        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none"><path d="M50 15 C65 15 80 25 85 40 C88 48 85 55 80 60 L 50 25 L 50 15 Z" fill="#06B6D4" /><path d="M45 20 C35 30 35 45 40 55 L 85 40 C 80 25 65 15 45 20 Z" fill="#06B6D4" fillOpacity="0.8"/><path d="M20 70 C20 50 35 35 50 35 L 40 85 C 30 80 20 75 20 70 Z" fill="#84CC16" /><path d="M40 85 L 50 35 L 85 85 C 70 95 50 95 40 85 Z" fill="#F97316" /><circle cx="50" cy="55" r="8" fill="white" /></svg>}
                    </div>
                    <h2 className="text-4xl font-sport font-bold tracking-tight text-gray-900 uppercase leading-none">{firstPart}{restPart && <span className="bg-gradient-to-r from-tri-blue via-tri-green to-tri-orange text-transparent bg-clip-text ml-2">{restPart}</span>}</h2>
                    <p className="text-gray-400 text-xs mt-1">{isSignUp ? t.signUpTitle : t.signInTitle}</p>
                 </div>
                 
                 {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 text-red-700 text-sm">
                        <div className="font-bold flex items-center mb-1"><i className="fa-solid fa-circle-exclamation mr-2"></i> Error de Autenticación</div>
                        <p>{error}</p>
                        {error.includes("getting user profile") && (
                            <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                                <strong>Github Tip:</strong> This usually means you are using a "GitHub App" instead of an "OAuth App". Please create a new <strong>OAuth App</strong> in GitHub Developer Settings.
                            </div>
                        )}
                    </div>
                 )}

                 <div className="space-y-3 mb-4">
                    <button type="button" onClick={handleGoogleLogin} className="w-full bg-white text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center"><i className="fa-brands fa-google text-red-500 mr-2 text-xl"></i> {t.googleLogin}</button>
                    <button type="button" onClick={handleGithubLogin} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center"><i className="fa-brands fa-github text-white mr-2 text-xl"></i> {t.githubLogin}</button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <>
                        <input type="text" placeholder={t.nameLabel} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none" value={name} onChange={e => setName(e.target.value)} required />
                        <div className="grid grid-cols-2 gap-2">
                             <input type="tel" placeholder={t.whatsappLabel} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                             <input type="tel" placeholder={t.phoneLabel} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        </>
                    )}
                    <input type="email" placeholder={t.emailLabel} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder={t.passwordLabel} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" disabled={loading} className="w-full bg-tri-orange text-white font-bold py-4 rounded-xl shadow-lg">{loading ? '...' : (isSignUp ? t.signUpBtn : t.signInBtn)}</button>
                 </form>
                 <div className="mt-6 text-center"><button onClick={() => setIsSignUp(!isSignUp)} className="text-gray-400 hover:text-tri-orange text-sm font-medium">{isSignUp ? t.hasAccount : t.noAccount}</button></div>
            </div>
        </div>
    );
};


// --- APP COMPONENT ---

const App: React.FC = () => {
  const [siteConfig, setSiteConfig] = useState<SiteSettings>({
    siteName: 'Mercado Tri',
    siteDescription: 'La plataforma líder.',
    defaultLanguage: 'es',
    aiProvider: 'gemini'
  });
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [view, setView] = useState('marketplace'); 
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [oauthError, setOauthError] = useState('');
  
  // Filters...
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  
  // Shop Filter (for Marketplace)
  const [selectedShopFilter, setSelectedShopFilter] = useState<string | null>(null);

  // Inventory filters...
  const [invSearchTerm, setInvSearchTerm] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('All');
  const [invSortOrder, setInvSortOrder] = useState('newest');
  const [invPriceMin, setInvPriceMin] = useState('');
  const [invPriceMax, setInvPriceMax] = useState('');

  const [analysisData, setAnalysisData] = useState<AIAnalysisResult | null>(null);
  const [uploadImages, setUploadImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventoryViewMode, setInventoryViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<Set<string>>(new Set());

  const t = translations[language];

  // Load Config, Products, and Check for OAuth Errors
  useEffect(() => {
    const init = async () => {
        // 1. Check URL for OAuth errors
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (params.get('error') || (hash.includes('error='))) {
            const errDesc = params.get('error_description') || decodeURIComponent(hash.match(/error_description=([^&]*)/)?.[1] || 'Login failed');
            setOauthError(errDesc);
            setView('login');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const s = await configService.getSettings();
        setSiteConfig(s);
        setLanguage(s.defaultLanguage);
        const u = await (authService as any).getSessionUser();
        if(u) setUser(u);
        loadProducts();
        loadShops();
    };
    init();
  }, []);

  const loadProducts = async () => {
      setProductsLoading(true);
      try {
          const p = await productService.getAll();
          setProducts(p);
      } catch(e) { console.error(e); }
      finally { setProductsLoading(false); }
  };

  const loadShops = async () => {
      try {
          const s = await productService.getFeaturedShops();
          setShops(s);
      } catch(e) { console.error(e); }
  };

  const handleLogout = async () => { await authService.logout(); setUser(null); setView('marketplace'); };

  // ... (Delete and Edit Handlers same as before) ...
  const handleEditProduct = (p: Product) => {
      setAnalysisData({ title: p.title, category: p.category, brand: p.brand, condition: p.condition, description: p.description, suggestedPrice: p.price, tags: p.tags, confidenceScore: 1, isSafe: true, currency: p.currency });
      setUploadImages(p.imageUrls);
      setEditingId(p.id);
      setView('edit');
  };
  
  const handleDeleteProduct = async (id: string, e?: React.MouseEvent) => {
      if(e) e.stopPropagation();
      if(!window.confirm(t.confirmDelete)) return;
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (view === 'product-detail') setView('marketplace');
  };

  const handleBulkDelete = async () => {
      if(!window.confirm(t.confirmBulkDelete)) return;
      await productService.deleteMany(Array.from(selectedInventoryItems));
      setProducts(prev => prev.filter(p => !selectedInventoryItems.has(p.id)));
      setSelectedInventoryItems(new Set());
  };

  const handleSaveProduct = async (productData: any) => {
    if (editingId) await productService.update(editingId, productData);
    else await productService.create(productData);
    await loadProducts();
    setAnalysisData(null); setUploadImages([]); setEditingId(null);
    if (user?.role === 'admin' || user?.role === 'seller') setView('inventory');
    else setView('marketplace');
  };

  const handleShopCreated = (updatedUser: User) => {
      setUser(updatedUser);
      setView('my-shop'); // Redirect to dashboard
  };

  // Helper for Marketplace Display
  const filteredProducts = products.filter(p => {
      // Exclude drafts and sold items from marketplace
      if (p.status !== 'published') return false;
      
      // Shop Filter
      if (selectedShopFilter && p.userId !== selectedShopFilter) return false;

      const search = searchTerm.toLowerCase();
      return (p.title.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search)) &&
             (selectedCategory === 'All' || p.category === selectedCategory) &&
             (selectedCondition === 'All' || p.condition === selectedCondition) &&
             (p.price >= (Number(priceMin) || 0) && p.price <= (Number(priceMax) || Infinity));
  });

  // Sort continuous flow
  const sortedMarketplace = [...filteredProducts].sort((a,b) => {
      const catOrder: any = { [Category.TRIATHLON]: 1, [Category.CYCLING]: 2, [Category.RUNNING]: 3, [Category.SWIMMING]: 4, [Category.OTHER]: 5 };
      const diff = (catOrder[a.category] || 99) - (catOrder[b.category] || 99);
      if (diff !== 0) return diff;
      return b.createdAt - a.createdAt;
  });

  const getScreenContext = () => view; 

  const renderContent = () => {
      switch(view) {
          case 'login': return <LoginView onLoginSuccess={u => { setUser(u); setView('marketplace'); }} t={t} siteConfig={siteConfig} initialError={oauthError} />;
          case 'upload': return <UploadView onAnalysisComplete={(d, i) => { setAnalysisData(d); setUploadImages(i); setView('edit'); }} onCancel={() => setView('marketplace')} t={t} />;
          case 'edit': return analysisData ? <EditView initialData={analysisData} images={uploadImages} onSave={handleSaveProduct} onCancel={() => setView('marketplace')} t={t} isEditing={!!editingId} onDelete={() => editingId && handleDeleteProduct(editingId)} /> : null;
          case 'product-detail': return selectedProduct ? <ProductDetailView product={selectedProduct} onBack={() => setView('marketplace')} t={t} user={user} onEdit={handleEditProduct} onDelete={handleDeleteProduct} /> : null;
          case 'users': return <UserManagementView t={t} currentUser={user} getRoleLabel={(r:string)=>getRoleLabel(r,t)} />;
          case 'config': return <ConfigView siteConfig={siteConfig} onUpdateConfig={setSiteConfig} t={t} />;
          case 'profile': return <ProfileView user={user} t={t} onUpdateUser={setUser} getRoleLabel={(r:string)=>getRoleLabel(r,t)} />;
          
          case 'shop-config': return user ? <ShopConfigView user={user} t={t} onShopCreated={handleShopCreated} /> : null;
          case 'edit-shop': return user ? <ShopConfigView user={user} t={t} onShopCreated={handleShopCreated} isEditing /> : null;
          case 'my-shop': return user ? <MyShopView user={user} t={t} onViewProduct={p => { setSelectedProduct(p); setView('product-detail'); }} onEditShop={() => setView('edit-shop')} /> : null;

          case 'shops': return <ShopsListView shops={shops} t={t} onSelectShop={(id) => { setSelectedShopFilter(id); setView('marketplace'); }} />;

          case 'inventory': 
             // ... (Inventory logic reused from previous) ...
             const myProds = user?.role === 'admin' ? products : products.filter(p => p.userId === user?.id);
             return (
                 <div className="space-y-4">
                     <div className="flex justify-between items-center">
                         <h2 className="text-2xl font-bold">{t.myInventory}</h2>
                         {selectedInventoryItems.size > 0 && <button onClick={handleBulkDelete} className="text-red-600 font-bold">{t.deleteSelected}</button>}
                         <button onClick={() => setView('upload')} className="bg-tri-orange text-white px-4 py-2 rounded font-bold">New</button>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {myProds.map(p => <ProductCard key={p.id} product={p} onClick={() => { setSelectedProduct(p); setView('product-detail'); }} categoryLabel={getCategoryLabel(p.category, t)} showStatus />)}
                     </div>
                 </div>
             );

          case 'marketplace':
          default:
             return (
                 <div className="space-y-8 pb-12">
                     {/* Filters UI ... */}
                     <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 flex-wrap items-center">
                        <input className="flex-1 border p-2 rounded bg-white" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                        <div className="flex gap-2 overflow-x-auto">
                            <button onClick={()=>setSelectedCategory('All')} className={`px-4 py-2 rounded-full border ${selectedCategory==='All'?'bg-black text-white':'bg-white'}`}>{t.anyCategory}</button>
                            {Object.values(Category).map(c => <button key={c} onClick={()=>setSelectedCategory(c)} className={`px-4 py-2 rounded-full border ${selectedCategory===c?'bg-black text-white':'bg-white'}`}>{getCategoryLabel(c, t)}</button>)}
                        </div>
                        {selectedShopFilter && (
                           <button onClick={() => setSelectedShopFilter(null)} className="bg-orange-100 text-tri-orange px-4 py-2 rounded-full flex items-center gap-2 font-bold hover:bg-orange-200">
                               <i className="fa-solid fa-store"></i> Filtro Tienda Activado <i className="fa-solid fa-times"></i>
                           </button>
                        )}
                     </div>
                     
                     {/* Products */}
                     {productsLoading ? <div className="text-center py-10">Loading...</div> : 
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                         {sortedMarketplace.length > 0 ? (
                             sortedMarketplace.map(p => <ProductCard key={p.id} product={p} onClick={() => { setSelectedProduct(p); setView('product-detail'); }} categoryLabel={getCategoryLabel(p.category, t)} />)
                         ) : (
                             <div className="col-span-full text-center py-12 text-gray-400">
                                 No se encontraron productos.
                             </div>
                         )}
                     </div>}

                     {/* Featured Shops Section */}
                     {shops.length > 0 && !selectedShopFilter && (
                         <div className="mt-12 border-t border-gray-100 pt-8">
                             <h3 className="text-2xl font-sport font-bold text-gray-900 uppercase tracking-wide mb-6 flex items-center">
                                 <i className="fa-solid fa-store text-tri-orange mr-3"></i> {t.featuredShops}
                             </h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                 {shops.map(shop => (
                                     <div key={shop.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition group">
                                         <div className="w-16 h-16 rounded-full bg-gray-50 mb-3 overflow-hidden border border-gray-100 group-hover:border-tri-orange transition">
                                             {shop.shopImageUrl ? <img src={shop.shopImageUrl} className="w-full h-full object-cover"/> : <i className="fa-solid fa-store text-2xl text-gray-300 mt-4"></i>}
                                         </div>
                                         <h4 className="font-bold text-gray-900 text-sm mb-1">{shop.name}</h4>
                                         <p className="text-xs text-gray-500 mb-3">{shop.productCount} {t.productsCount}</p>
                                         <button 
                                             onClick={() => {
                                                 setSelectedShopFilter(shop.id);
                                                 window.scrollTo({ top: 0, behavior: 'smooth' });
                                             }}
                                             className="w-full bg-gray-50 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-tri-orange hover:text-white transition"
                                         >
                                             {t.viewShop}
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>
             );
      }
  };

  return (
    <Layout user={user} activePage={view} onNavigate={setView} onLogout={handleLogout} language={language} onToggleLanguage={() => setLanguage(l => l==='es'?'en':'es')} t={t} siteConfig={siteConfig} getRoleLabel={r=>getRoleLabel(r,t)}>
        {renderContent()}
        <TriBot currentContext={getScreenContext()} onNavigateProduct={(id) => {
            const p = products.find(prod => prod.id === id);
            if(p) { setSelectedProduct(p); setView('product-detail'); }
        }}/>
    </Layout>
  );
};

export default App;
