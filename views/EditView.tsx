
import React, { useState, useEffect, useRef } from 'react';
import { Category, Condition } from '../types';
import { CATEGORY_CONFIG, getCategoryLabel, getConditionLabel } from '../utils/helpers';

// --- CHART COMPONENT ---
const PriceRangeVisualizer = ({ min, max, current }: { min: number, max: number, current: number }) => {
    // Avoid division by zero
    if (min >= max) return null;
    
    // Calculate percentage position
    let percent = ((current - min) / (max - min)) * 100;
    // Clamp
    percent = Math.max(0, Math.min(100, percent));

    return (
        <div className="mt-4 mb-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                <span>Min</span>
                <span>Max</span>
            </div>
            <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-visible">
                {/* Background Track */}
                <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                {/* Colored Gradient Track */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-tri-green via-tri-blue to-tri-orange opacity-30"></div>
                
                {/* Marker */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-tri-orange rounded-full shadow-md border-2 border-white transform -translate-x-1/2 z-10 flex items-center justify-center transition-all duration-500"
                    style={{ left: `${percent}%` }}
                >
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export const EditView = ({ initialData, images: initialImages, onSave, onCancel, t, isEditing, onDelete }: any) => {
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
  const [isSpeaking, setIsSpeaking] = useState(false);
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
  
  // TTS Logic
  const toggleSpeech = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    if (!initialData.priceExplanation) return;

    // Use Web Speech API
    window.speechSynthesis.cancel(); // Stop any previous
    const utterance = new SpeechSynthesisUtterance(initialData.priceExplanation);
    
    // Attempt to find an Argentine or Spanish voice
    const voices = window.speechSynthesis.getVoices();
    // Prioritize es-AR, then any Spanish female if possible (simple heuristic), then any Spanish
    const targetVoice = 
        voices.find(v => v.lang === 'es-AR') || 
        voices.find(v => v.lang.startsWith('es') && (v.name.includes('Female') || v.name.includes('Helena') || v.name.includes('Sabina'))) ||
        voices.find(v => v.lang.startsWith('es'));
        
    if (targetVoice) {
        utterance.voice = targetVoice;
    }
    utterance.lang = 'es-AR'; // Hint language
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  
  // Ensure voices are loaded (browsers load async)
  useEffect(() => {
     window.speechSynthesis.getVoices();
  }, []);

  // Helper to safely display price
  const displayCurrency = (amount: number, curr: string) => {
      const symbol = curr === 'USD' ? 'U$S' : '$';
      return `${symbol} ${amount.toLocaleString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
       <div className="bg-white p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">{isEditing ? t.editTitle : t.reviewTitle}</h2>
        <p className="text-gray-500 text-sm">{isEditing ? t.editDesc : t.reviewDesc}</p>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Images Column */}
        <div className="w-full md:w-1/3 bg-white p-4 border-r border-gray-100">
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
              <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
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
                  
                  {/* VISUAL CHART */}
                  {(initialData.minPrice && initialData.maxPrice && initialData.suggestedPrice) && (
                      <PriceRangeVisualizer 
                          min={initialData.minPrice} 
                          max={initialData.maxPrice} 
                          current={formData.price} 
                      />
                  )}
                  
                  <div className="flex items-start gap-3 mt-3">
                      <p className="text-xs text-gray-600 leading-relaxed italic flex-1">
                          "{initialData.priceExplanation}"
                      </p>
                      <button 
                        type="button"
                        onClick={toggleSpeech}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-tri-blue border border-gray-200'}`}
                        title={isSpeaking ? t.stopAudio : t.listenAudio}
                      >
                         <i className={`fa-solid ${isSpeaking ? 'fa-stop' : 'fa-volume-high'}`}></i>
                      </button>
                  </div>

                  {/* Sources / Grounding Links */}
                  {initialData.sourceLinks && initialData.sourceLinks.length > 0 && (
                      <div className="border-t border-blue-100 pt-2 mt-2">
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
