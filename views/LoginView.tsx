
import React, { useState } from 'react';
import { authService } from '../services/mockBackend';
import { User } from '../types';

interface LoginViewProps {
  t: any;
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ t, onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [regName, setRegName] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPhone, setRegPhone] = useState('');

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
          onLoginSuccess(u);
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

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{isSignUp ? t.signUpTitle : t.signInTitle}</h2>
        {authError && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{authError}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.emailLabel}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" required />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.passwordLabel}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" required />
            </div>
            {isSignUp && (
                <>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.nameLabel}</label>
                        <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.whatsappLabel}</label>
                            <input type="text" value={regWhatsapp} onChange={e => setRegWhatsapp(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phoneLabel}</label>
                            <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-tri-orange outline-none" />
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
  );
};
