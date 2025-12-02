
import React, { useState, useRef, useEffect } from 'react';
import { User, SiteSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onNavigate: (page: string) => void;
  activePage: string;
  onLogout: () => void;
  language: 'es' | 'en';
  onToggleLanguage: () => void;
  t: any;
  siteConfig: SiteSettings;
  getRoleLabel: (role: string) => string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, onNavigate, activePage, onLogout, language, onToggleLanguage, t, siteConfig, getRoleLabel
}) => {
  // Helpers to determine role capabilities
  const canSell = user && (user.role === 'admin' || user.role === 'seller');
  const isAdmin = user && user.role === 'admin';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper to render logo text dynamically or default
  const renderLogoText = () => {
    const name = siteConfig.siteName || 'Mercado Tri';
    // Split name to colorize the last part if it matches "Tri" or similar, otherwise just render
    const parts = name.split(' ');
    const firstPart = parts[0];
    const rest = parts.slice(1).join(' ');

    return (
      <span className="text-3xl md:text-4xl font-sport font-bold tracking-tight text-slate-900 uppercase leading-none">
        {firstPart}
        {rest && (
          <span className="bg-gradient-to-r from-tri-blue via-tri-green to-tri-orange text-transparent bg-clip-text ml-1">
            {rest}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-tri-light flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer group space-x-3" onClick={() => onNavigate('marketplace')}>
              {siteConfig.logoUrl ? (
                <img src={siteConfig.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
              ) : (
                /* Fallback SVG Logo */
                <svg className="w-12 h-12 transform group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15 C65 15 80 25 85 40 C88 48 85 55 80 60 L 50 25 L 50 15 Z" fill="#06B6D4" />
                  <path d="M45 20 C35 30 35 45 40 55 L 85 40 C 80 25 65 15 45 20 Z" fill="#06B6D4" fillOpacity="0.8"/>
                  <path d="M20 70 C20 50 35 35 50 35 L 40 85 C 30 80 20 75 20 70 Z" fill="#84CC16" />
                  <path d="M40 85 L 50 35 L 85 85 C 70 95 50 95 40 85 Z" fill="#F97316" />
                  <circle cx="50" cy="55" r="8" fill="white" />
                </svg>
              )}
              <div className="flex flex-col justify-center -space-y-1">
                {renderLogoText()}
                <span className="text-xs md:text-sm font-sport text-gray-500 uppercase tracking-wide leading-none hidden sm:block">
                  {siteConfig.siteDescription.slice(0, 50)}{siteConfig.siteDescription.length > 50 ? '...' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              
              {/* Desktop Sell Button (Always visible for sellers/admins) */}
              {canSell && (
                <button
                  onClick={() => onNavigate('upload')}
                  className="hidden md:flex items-center bg-tri-orange text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition shadow-sm hover:shadow-md mr-2"
                >
                  <i className="fa-solid fa-camera mr-2"></i>
                  {t.navSell}
                </button>
              )}

              {/* Language Switcher */}
              <button 
                onClick={onToggleLanguage}
                className="text-xs font-bold px-2 py-1 rounded border border-gray-300 text-gray-600 hover:border-tri-orange hover:text-tri-orange transition uppercase"
              >
                {language === 'es' ? 'ES' : 'EN'}
              </button>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200 hover:ring-2 hover:ring-tri-orange transition focus:outline-none"
                  >
                     {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <i className="fa-solid fa-user text-gray-500 mt-1"></i>}
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fade-in-down origin-top-right">
                      {/* Header with Name/Role */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-tri-orange font-bold uppercase tracking-wider">{getRoleLabel(user.role)}</p>
                      </div>

                      {/* Menu Options */}
                      <div className="py-1">
                        <button onClick={() => { onNavigate('marketplace'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-tri-blue font-medium transition flex items-center">
                          <i className="fa-solid fa-store w-5 text-gray-400"></i> {t.navShop}
                        </button>
                        <button onClick={() => { onNavigate('profile'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-tri-blue font-medium transition flex items-center">
                          <i className="fa-solid fa-user w-5 text-gray-400"></i> {t.myProfile}
                        </button>
                        
                        {canSell && (
                           <button onClick={() => { onNavigate('inventory'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-tri-blue font-medium transition flex items-center">
                             <i className="fa-solid fa-box-open w-5 text-gray-400"></i> {t.navInventory}
                           </button>
                        )}

                        {isAdmin && (
                          <>
                             <button onClick={() => { onNavigate('users'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-tri-blue font-medium transition flex items-center">
                               <i className="fa-solid fa-users w-5 text-gray-400"></i> {t.navUsers}
                             </button>
                             <button onClick={() => { onNavigate('config'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-tri-blue font-medium transition flex items-center">
                               <i className="fa-solid fa-gear w-5 text-gray-400"></i> Config
                             </button>
                          </>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition flex items-center">
                          <i className="fa-solid fa-right-from-bracket w-5"></i> {t.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-gray-600 hover:text-tri-orange font-medium text-sm transition"
                >
                  {t.login}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <NavButton 
          icon="fa-store" 
          label={t.navShop}
          active={activePage === 'marketplace' || activePage === 'product-detail'} 
          onClick={() => onNavigate('marketplace')} 
        />
        {canSell && (
          <NavButton 
            icon="fa-plus-circle" 
            label={t.navSell}
            active={activePage === 'upload'} 
            onClick={() => onNavigate('upload')} 
            primary
          />
        )}
        {canSell && (
          <NavButton 
            icon="fa-box-open" 
            label={isAdmin ? t.navInventory : 'Inventario'} 
            active={activePage === 'inventory'} 
            onClick={() => onNavigate('inventory')} 
          />
        )}
        <NavButton 
            icon={user ? "fa-user" : "fa-sign-in-alt"} 
            label={user ? t.myProfile : t.login} 
            active={activePage === 'profile' || activePage === 'login'} 
            onClick={() => onNavigate(user ? 'profile' : 'login')} 
        />
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick, primary }: { icon: string, label: string, active: boolean, onClick: () => void, primary?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-1/4 transition-colors ${active ? 'text-tri-orange' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <i className={`fa-solid ${icon} ${primary ? 'text-3xl mb-1 text-tri-orange transform -translate-y-2 drop-shadow-lg bg-white rounded-full p-1' : 'text-xl mb-1'}`}></i>
    <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
  </button>
);
