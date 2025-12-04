
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TriBot } from './components/TriBot'; 
import { authService, productService, configService } from './services/mockBackend';
import { Product, User, AIAnalysisResult, SiteSettings, ShopSummary } from './types';
import { translations } from './utils/translations';
import { getRoleLabel } from './utils/helpers';

// Views
import { MarketplaceView } from './views/MarketplaceView';
import { LoginView } from './views/LoginView';
import { UploadView } from './views/UploadView';
import { EditView } from './views/EditView';
import { ShopsListView } from './views/ShopsListView';
import { MyShopView } from './views/MyShopView';
import { ShopConfigView } from './views/ShopConfigView';
import { ProductDetailView } from './views/ProductDetailView';
import { ProfileView } from './views/ProfileView';
import { ShopDetailView } from './views/ShopDetailView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('marketplace');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShop, setSelectedShop] = useState<User | null>(null);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteSettings>({
      siteName: 'Mercado Tri', siteDescription: '', defaultLanguage: 'es', aiProvider: 'gemini'
  });
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  
  // Upload/Edit State
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
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
      if (page === 'marketplace') {
          productService.getAll().then(setProducts);
      }
      window.scrollTo(0,0);
  };

  const handleSelectShop = async (shopId: string) => {
      try {
          const shopDetails = await productService.getShopDetails(shopId);
          if (shopDetails) {
              setSelectedShop(shopDetails);
              // Ensure we have latest products for this shop
              const allProducts = await productService.getAll();
              setProducts(allProducts);
              setActivePage('shop-detail');
              window.scrollTo(0,0);
          }
      } catch (e) {
          console.error("Error loading shop", e);
      }
  };

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
            <MarketplaceView 
                products={products} 
                t={t} 
                onProductClick={(p) => { setSelectedProduct(p); handleNavigate('product-detail'); }}
            />
        )}

        {activePage === 'login' && (
            <LoginView 
                t={t}
                onNavigate={handleNavigate}
                onLoginSuccess={(u) => { setUser(u); handleNavigate('marketplace'); }}
            />
        )}
        
        {activePage === 'profile' && user && (
            <ProfileView 
                user={user}
                t={t}
                onUpdateUser={(u) => setUser(u)}
                onNavigate={handleNavigate}
            />
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
                    handleNavigate('my-shop'); // Go to inventory after publish
                }}
                onCancel={() => handleNavigate('marketplace')}
            />
        )}
        
        {activePage === 'product-detail' && selectedProduct && (
            <ProductDetailView 
                product={selectedProduct}
                user={user}
                t={t}
                onNavigate={handleNavigate}
            />
        )}

        {activePage === 'edit-existing' && selectedProduct && (
            <EditView 
                t={t}
                initialData={selectedProduct}
                images={selectedProduct.imageUrls}
                isEditing={true}
                onSave={async (data: any) => {
                    await productService.update(selectedProduct.id, data);
                    handleNavigate('my-shop'); // Return to inventory
                }}
                onDelete={async () => {
                    if(window.confirm(t.confirmDelete)) {
                        await productService.delete(selectedProduct.id);
                        handleNavigate('my-shop');
                    }
                }}
                onCancel={() => handleNavigate('my-shop')}
            />
        )}

        {activePage === 'shops' && (
            <ShopsListView 
                shops={shops} 
                t={t} 
                onSelectShop={handleSelectShop} 
            />
        )}

        {activePage === 'shop-detail' && selectedShop && (
            <ShopDetailView 
                shop={selectedShop}
                products={products.filter(p => p.userId === selectedShop.id)}
                t={t}
                onBack={() => handleNavigate('shops')}
                onProductClick={(p) => { setSelectedProduct(p); handleNavigate('product-detail'); }}
            />
        )}

        {activePage === 'my-shop' && user && user.role === 'seller' && (
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
                isEditing={user.role === 'seller'}
            />
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
                 <p>Gestión de usuarios restringida a consola por seguridad.</p>
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
