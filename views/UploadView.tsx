
import React, { useState, useRef } from 'react';
import { AIAnalysisResult } from '../types';
import { analyzeProductImage, enhanceProductImageWithWatermark } from '../services/geminiService';

interface UploadViewProps {
    onAnalysisComplete: (data: AIAnalysisResult, imgs: string[]) => void;
    onCancel: () => void;
    t: any;
}

export const UploadView: React.FC<UploadViewProps> = ({ onAnalysisComplete, onCancel, t }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      if (files.length > 10) {
        alert(t.maxPhotos);
        return;
      }
      setAnalyzing(true);
      setLoadingStep('Analizando producto y mercado...');
      
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
        
        // 1. Analyze Data (Parallel-ish, but usually we want data first or together)
        const analysisPromise = analyzeProductImage(mainImage);
        
        // 2. Enhance Image (Background blur + Watermark)
        setLoadingStep('Mejorando imagen con IA (Fondo y Marca de Agua)...');
        // Start enhancement in parallel or after? Gemini rate limits might prefer sequential if sharing API key quota,
        // but parallel is faster. Let's try parallel.
        const enhancementPromise = enhanceProductImageWithWatermark(mainImage);

        const [analysis, enhancedImage] = await Promise.all([analysisPromise, enhancementPromise]);

        // If enhancement successful, replace the first image
        const finalImages = [...base64Images];
        if (enhancedImage) {
            finalImages[0] = enhancedImage;
        }

        onAnalysisComplete(analysis, finalImages);
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
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-sport tracking-wide">{loadingStep || t.analyzingTitle}</h3>
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
              <span className="inline-block p-4 rounded-full bg-white text-tri-orange mb-4 shadow-sm border border-gray-100">
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
