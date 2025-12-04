
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
    analyzingTitle: 'TriBot está analizando tu producto...',
    analyzingDesc: 'Buscando precios de mercado en Argentina e identificando componentes.',
    uploadTitle: 'Vende tu Equipo',
    uploadDesc: 'Selecciona hasta 10 fotos. La IA identificará el producto y sugerirá precio de mercado.',
    selectPhotosBtn: 'Seleccionar Fotos',
    cancel: 'Cancelar',
    maxPhotos: 'Por favor selecciona un máximo de 10 imágenes.',
    analysisError: 'Falló el análisis de IA. Intenta de nuevo.',

    // Edit
    reviewTitle: 'Revisar & Publicar',
    editTitle: 'Editar Publicación',
    reviewDesc: 'Revisa los detalles y el precio de mercado sugerido antes de publicar.',
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
    
    // Pricing Analysis
    marketAnalysisTitle: 'Análisis de Mercado (Argentina)',
    priceRange: 'Rango estimado:',
    suggested: 'Sugerido:',
    applyPrice: 'Aplicar Precio',
    analysisSource: 'Fuentes encontradas:',
    noAnalysis: 'No se encontraron datos de mercado suficientes.',

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
    analyzingTitle: 'TriBot is analyzing your gear...',
    analyzingDesc: 'Searching for market prices in Argentina and identifying components.',
    uploadTitle: 'Sell your Gear',
    uploadDesc: 'Select up to 10 photos. AI will identify the product and suggest local market price.',
    selectPhotosBtn: 'Select Photos',
    cancel: 'Cancel',
    maxPhotos: 'Please select a maximum of 10 images.',
    analysisError: 'AI Analysis failed. Please try again.',

    // Edit
    reviewTitle: 'Review & Publish',
    editTitle: 'Edit Listing',
    reviewDesc: 'Review the details and suggested market price before publishing.',
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
    
    // Pricing Analysis
    marketAnalysisTitle: 'Market Analysis (Argentina)',
    priceRange: 'Estimated Range:',
    suggested: 'Suggested:',
    applyPrice: 'Apply Price',
    analysisSource: 'Sources found:',
    noAnalysis: 'No sufficient market data found.',

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
    editAction: 'Editar',
    deleteAction: 'Eliminar',
    confirmDelete: '¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.',
    confirmBulkDelete: '¿Estás seguro que deseas eliminar los productos seleccionados?',
    deletedSuccess: 'Producto eliminado correctamente.',

    // Config
    configTitle: 'Site Configuration',
    siteNameLabel: 'Site Name',
    siteDescLabel: 'Site Description',
    logoUrlLabel: 'Logo URL (or upload)',
    aiConfigTitle: 'AI Configuration',
    aiProviderLabel: 'AI Provider',
    apiKeyLabel: 'API Key',
    modelLabel: 'Modelo',
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
  
  // TriBot Avatar for Loading Screen
  const TriBotLoadingIcon = () => (
    <svg viewBox="0 0 100 100" className="w-28 h-28 drop-shadow-xl animate-pulse" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="25" width="60" height="55" rx="15" fill="#EDF2F7" stroke="#06B6D4" strokeWidth="2" />
      <rect x="28" y="38" width="44" height="30" rx="8" fill="#1A202C" />
      <circle cx="40" cy="50" r="4" fill="#06B6D4">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="50" r="4" fill="#06B6D4">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
      </circle>
      <path d="M45 58 Q 50 60 55 58" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="50" y1="25" x2="50" y2="15" stroke="#06B6D4" strokeWidth="3" />
      <circle cx="50" cy="12" r="5" fill="#F97316">
         <animate attributeName="fill" values="#F97316;#FFD700;#F97316" dur="3s" repeatCount="indefinite" />
      </circle>
      <rect x="15" y="45" width="5" height="15" rx="2" fill="#06B6D4" />
      <rect x="80" y="45" width="5" height="15" rx="2" fill="#06B6D4" />
    </svg>
  );

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center min-h-[400px] flex flex-col justify-center relative overflow-hidden">
        {analyzing ? (
          <div className="py-12 flex flex-col items-center justify-center z-10">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-10 animate-ping"></div>
              <TriBotLoadingIcon />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-sport tracking-wide">{t.analyzingTitle}</h3>
            <p className="text-gray-500 mb-10 max-w-sm">{t.analyzingDesc}</p>

            {/* Triathlon Sport Icons Animation */}
            <div className="flex space-x-6 text-3xl text-gray-300">
               <i className="fa-solid fa-person-swimming animate-bounce text-tri-blue" style={{ animationDelay: '0s', animationDuration: '1.5s' }}></i>
               <i className="fa-solid fa-bicycle animate-bounce text-tri-orange" style={{ animationDelay: '0.2s', animationDuration: '1.5s' }}></i>
               <i className="fa-solid fa-person-running animate-bounce text-tri-green" style={{ animationDelay: '0.4s', animationDuration: '1.5s' }}></i>
            </div>
          </div>
        ) : (
          <div className="py-4 z-10">
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

  // Helper to safely display price
  const displayCurrency = (amount: number, curr: string) => {
      const symbol = curr === 'USD' ? 'U$S' : '$';
      return `${symbol} ${amount.toLocaleString()}`;
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
                  className="bg-white border border-r-0 border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-tri-orange focus:border-tri-orange block p-2.5 outline-none"
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

          {/* AI Pricing Analysis Block */}
          {!isEditing && initialData.priceExplanation && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                      <i className="fa-solid fa-chart-line text-blue-500"></i>
                      <span className="font-bold text-sm text-blue-900 uppercase tracking-wide">{t.marketAnalysisTitle}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-3">
                      {(initialData.minPrice && initialData.maxPrice) && (
                          <div className="bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
                              <span className="text-xs text-gray-500 block">{t.priceRange}</span>
                              <span className="font-bold text-gray-900">
                                  {displayCurrency(initialData.minPrice, initialData.currency)} - {displayCurrency(initialData.maxPrice, initialData.currency)}
                              </span>
                          </div>
                      )}
                      
                      {initialData.suggestedPrice > 0 && (
                          <div className="bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm flex-1 flex justify-between items-center">
                              <div>
                                  <span className="text-xs text-gray-500 block">{t.suggested}</span>
                                  <span className="font-bold text-tri-orange text-lg">
                                      {displayCurrency(initialData.suggestedPrice, initialData.currency)}
                                  </span>
                              </div>
                              <button 
                                  type="button" 
                                  onClick={() => setFormData({...formData, price: initialData.suggestedPrice, currency: initialData.currency})}
                                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold hover:bg-blue-200 transition"
                              >
                                  {t.applyPrice}
                              </button>
                          </div>
                      )}
                  </div>
                  
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      "{initialData.priceExplanation}"
                  </p>

                  {/* Sources / Grounding Links */}
                  {initialData.sourceLinks && initialData.sourceLinks.length > 0 && (
                      <div className="border-t border-blue-200 pt-2 mt-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{t.analysisSource}</span>
                          <div className="flex flex-wrap gap-2">
                              {initialData.sourceLinks.slice(0, 3).map((link: any, i: number) => (
                                  <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white border border-blue-200 px-2 py-1 rounded text-blue-600 hover:underline truncate max-w-[150px]">
                                      {link.title || link.uri}
                                  </a>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}
          
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('marketplace');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteSettings>({
      siteName: 'Mercado Tri', siteDescription: '', defaultLanguage: 'es', aiProvider: 'gemini'
  });
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [regName, setRegName] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Upload/Edit State
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const t = translations[language];

  useEffect(() => {
    const init = async () => {
       const s = await configService.getSettings();
       setSiteConfig(s);
       setLanguage(s.defaultLanguage);
       const u = await authService.getSessionUser();
       setUser(u);
       const p = await productService.getAll();
       setProducts(p);
    };
    init();
  }, []);

  const handleNavigate = (page: string) => {
      setActivePage(page);
      if (page === 'shops') {
          productService.getFeaturedShops().then(setShops);
      }
      if (page === 'marketplace' || page === 'inventory') {
          productService.getAll().then(setProducts);
      }
      window.scrollTo(0,0);
  };

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      try {
          let u;
          if (isSignUp) {
              u = await authService.signUp(email, password, { name: regName, whatsapp: regWhatsapp, phone: regPhone });
          } else {
              u = await authService.login(email, password);
          }
          setUser(u);
          handleNavigate('marketplace');
      } catch (err: any) {
          setAuthError(err.message);
      }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
      try {
          if (provider === 'google') await authService.loginWithGoogle();
          else await authService.loginWithGithub();
      } catch (e: any) {
          setAuthError(e.message);
      }
  };

  // Main Marketplace View Logic
  const filteredProducts = products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const isPublished = p.status === 'published';
      return matchesSearch && matchesCategory && isPublished;
  });

  return (
      <Layout 
        user={user} 
        onNavigate={handleNavigate} 
        activePage={activePage} 
        onLogout={async () => { await authService.logout(); setUser(null); handleNavigate('marketplace'); }}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'es' ? 'en' : 'es')}
        t={t}
        siteConfig={siteConfig}
        getRoleLabel={(r) => getRoleLabel(r, t)}
      >
        {activePage === 'marketplace' && (
            <div className="space-y-6">
                {/* Search & Filter Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative w-full md:w-96">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input 
                            type="text" 
                            placeholder={t.searchPlaceholder} 
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tri-orange bg-white"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        <button 
                            onClick={() => setCategoryFilter('All')}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${categoryFilter === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {t.anyCategory}
                        </button>
                        {Object.values(Category).map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${categoryFilter === cat ? 'bg-tri-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {getCategoryLabel(cat, t)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                        <ProductCard 
                            key={p.id} 
                            product={p} 
                            onClick={() => { setSelectedProduct(p); handleNavigate('product-detail'); }}
                            categoryLabel={getCategoryLabel(p.category, t)}
                        />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            No se encontraron productos.
                        </div>
                    )}
                </div>
            </div>
        )}

        {activePage === 'login' && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{isSignUp ? t.signUpTitle : t.signInTitle}</h2>
                {authError && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{authError}</div>}
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.emailLabel}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tri-orange outline-none" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.passwordLabel}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tri-orange outline-none" required />
                    </div>
                    {isSignUp && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.nameLabel}</label>
                                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tri-orange outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label>
                                    <input type="text" value={regWhatsapp} onChange={e => setRegWhatsapp(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tri-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label>
                                    <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tri-orange outline-none" />
                                </div>
                            </div>
                        </>
                    )}
                    <button type="submit" className="w-full bg-tri-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition shadow-lg">
                        {isSignUp ? t.signUpBtn : t.signInBtn}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-xs text-gray-400 font-bold uppercase">{t.or}</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <div className="space-y-3">
                    <button onClick={() => handleSocialLogin('google')} className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                        <i className="fa-brands fa-google text-red-500"></i> {t.googleLogin}
                    </button>
                    <button onClick={() => handleSocialLogin('github')} className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2">
                        <i className="fa-brands fa-github"></i> {t.githubLogin}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-tri-blue font-bold hover:underline">
                        {isSignUp ? t.hasAccount : t.noAccount}
                    </button>
                </div>
            </div>
        )}

        {activePage === 'upload' && (
            <UploadView 
                t={t} 
                onCancel={() => handleNavigate('marketplace')} 
                onAnalysisComplete={(result, imgs) => {
                    setAnalysisResult(result);
                    setUploadedImages(imgs);
                    handleNavigate('edit-new');
                }}
            />
        )}

        {activePage === 'edit-new' && analysisResult && (
            <EditView 
                t={t}
                initialData={analysisResult}
                images={uploadedImages}
                isEditing={false}
                onSave={async (data: any) => {
                    await productService.create(data);
                    handleNavigate('marketplace');
                }}
                onCancel={() => handleNavigate('marketplace')}
            />
        )}
        
        {activePage === 'product-detail' && selectedProduct && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 bg-gray-100 relative min-h-[300px]">
                        <img src={selectedProduct.imageUrls[0]} className="w-full h-full object-cover" alt={selectedProduct.title} />
                        <button onClick={() => handleNavigate('marketplace')} className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-gray-800">
                             <i className="fa-solid fa-arrow-left"></i>
                        </button>
                    </div>
                    <div className="w-full md:w-1/2 p-8 flex flex-col">
                        <div className="mb-4">
                            <span className="bg-orange-100 text-tri-orange text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{getCategoryLabel(selectedProduct.category, t)}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{selectedProduct.title}</h1>
                        <p className="text-gray-500 mb-6 text-sm flex items-center gap-2">
                            <i className="fa-solid fa-tag"></i> {selectedProduct.brand} 
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span> 
                            {getConditionLabel(selectedProduct.condition, t)}
                        </p>
                        
                        <div className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
                            {getPriceDisplay(selectedProduct.price, selectedProduct.currency)}
                        </div>
                        
                        <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                            <p>{selectedProduct.description}</p>
                        </div>
                        
                        <div className="mt-auto pt-6 border-t border-gray-100">
                            {user && user.id === selectedProduct.userId ? (
                                <button onClick={() => { handleNavigate('edit-existing'); }} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                                    {t.editAction}
                                </button>
                            ) : (
                                <button className="w-full bg-tri-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition flex items-center justify-center gap-2">
                                    <i className="fa-brands fa-whatsapp text-xl"></i> {t.contactSeller}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activePage === 'edit-existing' && selectedProduct && (
            <EditView 
                t={t}
                initialData={selectedProduct}
                images={selectedProduct.imageUrls}
                isEditing={true}
                onSave={async (data: any) => {
                    await productService.update(selectedProduct.id, data);
                    handleNavigate('marketplace');
                }}
                onDelete={async () => {
                    if(window.confirm(t.confirmDelete)) {
                        await productService.delete(selectedProduct.id);
                        handleNavigate('marketplace');
                    }
                }}
                onCancel={() => handleNavigate('product-detail')}
            />
        )}

        {activePage === 'shops' && (
            <ShopsListView 
                shops={shops} 
                t={t} 
                onSelectShop={(shopId) => { 
                    setSearchTerm('');
                    alert("Ver tienda no implementado full. Filtra por este usuario.");
                }} 
            />
        )}

        {activePage === 'my-shop' && user && (
            <MyShopView 
                user={user} 
                t={t} 
                onViewProduct={(p) => { setSelectedProduct(p); handleNavigate('product-detail'); }}
                onEditShop={() => handleNavigate('shop-config')}
            />
        )}

        {activePage === 'shop-config' && user && (
            <ShopConfigView 
                user={user} 
                t={t} 
                onShopCreated={(u) => { setUser(u); handleNavigate('my-shop'); }}
                isEditing={!!user.shopName}
            />
        )}

        {activePage === 'inventory' && user && (
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
                                         <button onClick={() => { setSelectedProduct(p); handleNavigate('edit-existing'); }} className="text-indigo-600 hover:text-indigo-900 mr-4">{t.editAction}</button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        )}
        
        {activePage === 'config' && user?.role === 'admin' && (
             <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
                 <h2 className="text-xl font-bold mb-4">{t.configTitle}</h2>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold uppercase text-gray-500">{t.siteNameLabel}</label>
                         <input type="text" value={siteConfig.siteName} onChange={e => setSiteConfig({...siteConfig, siteName: e.target.value})} className="w-full border rounded p-2" />
                     </div>
                     <button onClick={async () => { await configService.updateSettings(siteConfig); alert('Saved'); }} className="bg-tri-orange text-white px-4 py-2 rounded">{t.saveConfig}</button>
                 </div>
             </div>
        )}
        
        {activePage === 'users' && user?.role === 'admin' && (
             <div className="bg-white p-6 rounded-xl shadow-sm">
                 <h2 className="text-xl font-bold mb-4">{t.usersTitle}</h2>
                 <p>User management interface here...</p>
             </div>
        )}

        <TriBot 
          currentContext={activePage} 
          onNavigateProduct={(id) => {
             const p = products.find(prod => prod.id === id);
             if (p) { setSelectedProduct(p); handleNavigate('product-detail'); }
          }} 
        />
      </Layout>
  );
}

export default App;
