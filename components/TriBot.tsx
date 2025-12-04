
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
// Fix import if services are in same folder structure relative to components
import { chatWithTriBot as chatService } from '../services/geminiService';

interface TriBotProps {
  currentContext: string;
  onNavigateProduct?: (productId: string) => void;
}

export const TriBot: React.FC<TriBotProps> = ({ currentContext, onNavigateProduct }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: '¡Hola! 🤖 Soy TriBot, tu asistente de IA. ¿En qué puedo ayudarte hoy?', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStopRecording;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No pudimos acceder al micrófono. Por favor verifica los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    if (audioBlob.size < 100) return;

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      await processMessage({ type: 'audio', content: base64Audio }, '🎤 Audio enviado');
    };
  };

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue('');
    await processMessage({ type: 'text', content: text }, text);
  };

  const processMessage = async (input: { type: 'audio'|'text', content: string }, displayProps: string) => {
    // Add user message
    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: displayProps,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Call AI
    const responseText = await chatService(input, messages, currentContext);

    const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, botMsg]);
    setIsProcessing(false);
  };

  // Custom Icon: Modern AI Robot
  const TriBotIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Robot Head Shape */}
      <rect x="20" y="25" width="60" height="55" rx="15" fill="#EDF2F7" stroke="#06B6D4" strokeWidth="2" />
      
      {/* Screen/Face Area */}
      <rect x="28" y="38" width="44" height="30" rx="8" fill="#1A202C" />
      
      {/* Glowing Eyes */}
      <circle cx="40" cy="50" r="4" fill="#06B6D4">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="50" r="4" fill="#06B6D4">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Mouth Line */}
      <path d="M45 58 Q 50 60 55 58" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" fill="none" />
      
      {/* Antenna */}
      <line x1="50" y1="25" x2="50" y2="15" stroke="#06B6D4" strokeWidth="3" />
      <circle cx="50" cy="12" r="5" fill="#F97316">
         <animate attributeName="fill" values="#F97316;#FFD700;#F97316" dur="3s" repeatCount="indefinite" />
      </circle>
      
      {/* Ears/Side Bolts */}
      <rect x="15" y="45" width="5" height="15" rx="2" fill="#06B6D4" />
      <rect x="80" y="45" width="5" height="15" rx="2" fill="#06B6D4" />
    </svg>
  );

  // Helper to parse markdown-like bold, lists, AND product links
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const isList = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const cleanLine = isList ? line.trim().substring(2) : line;

      // 1. Split by Links: [Title](ID:xyz)
      // Regex groups: 1=Title, 2=ID
      const linkRegex = /\[(.*?)\]\(ID:(.*?)\)/g;
      const parts = cleanLine.split(linkRegex);
      
      // If we have matches, parts will be [text, title, id, text, title, id...]
      const elements: React.ReactNode[] = [];
      let k = 0;
      
      while (k < parts.length) {
          // Regular text
          const part = parts[k];
          if (part) {
             // 2. Split Regular text by Bold
             const boldParts = part.split(/(\*\*.*?\*\*)/g);
             boldParts.forEach((bp, idx) => {
                 if (bp.startsWith('**') && bp.endsWith('**')) {
                     elements.push(<strong key={`${i}-${k}-b-${idx}`} className="font-bold text-gray-900">{bp.slice(2, -2)}</strong>);
                 } else if (bp) {
                     elements.push(<span key={`${i}-${k}-t-${idx}`}>{bp}</span>);
                 }
             });
          }
          
          // Check if next is a Link Match (title + id)
          if (k + 2 < parts.length) {
              const linkTitle = parts[k+1];
              const linkId = parts[k+2];
              elements.push(
                  <button 
                    key={`${i}-link-${k}`}
                    onClick={() => onNavigateProduct && onNavigateProduct(linkId)}
                    className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-orange-100 text-tri-orange font-bold text-xs hover:bg-orange-200 transition cursor-pointer border border-orange-200 align-middle"
                  >
                    <i className="fa-solid fa-tag mr-1 text-[10px]"></i>
                    {linkTitle}
                  </button>
              );
              k += 3; // Skip title and id
          } else {
              k++;
          }
      }

      if (isList) {
        return (
          <div key={i} className="flex items-start ml-2 mb-1.5">
            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-current rounded-full flex-shrink-0 opacity-70"></span>
            <span className="leading-relaxed">{elements}</span>
          </div>
        );
      }

      if (!line.trim()) return <div key={i} className="h-2"></div>;

      return <div key={i} className="mb-1 leading-relaxed">{elements}</div>;
    });
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden transform transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between text-white">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/10 p-1 rounded-full mr-3 backdrop-blur-sm border border-white/20 overflow-hidden">
                 <TriBotIcon />
              </div>
              <div>
                <h3 className="font-bold text-sm font-sport tracking-wide text-lg">TriBot</h3>
                <p className="text-[10px] text-gray-300 uppercase tracking-wider">Asistente de Mercado</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden border border-blue-200">
                        <div className="w-6 h-6"><TriBotIcon /></div>
                    </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-tri-blue text-white rounded-br-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.sender === 'user' ? msg.text : formatMessage(msg.text)}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start items-center ml-8">
                <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm rounded-bl-none flex items-center space-x-1">
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
             <form onSubmit={handleSendText} className="flex items-end gap-2 relative">
                <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-2 border border-gray-300 focus-within:border-tri-blue transition-colors shadow-sm">
                    <input 
                        type="text" 
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 max-h-24 py-1"
                        placeholder="Escribe un mensaje..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
                
                {inputValue.trim() ? (
                    <button 
                        type="submit"
                        className="w-10 h-10 rounded-full bg-tri-blue text-white flex items-center justify-center hover:bg-cyan-600 transition shadow-sm flex-shrink-0"
                    >
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                ) : (
                    <button 
                        type="button"
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${
                            isRecording 
                            ? 'bg-red-500 text-white recording-pulse' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                    </button>
                )}
             </form>
             {isRecording && <p className="text-[10px] text-center text-red-500 mt-1 font-bold animate-pulse">Grabando...</p>}
          </div>
        </div>
      )}

      {/* Toggle Button (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-gray-700 rotate-90' : 'bg-gradient-to-r from-tri-blue to-cyan-400'} text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 overflow-hidden border-2 border-white`}
      >
        {isOpen ? (
            <i className="fa-solid fa-times text-2xl"></i>
        ) : (
            <div className="w-10 h-10 mt-1">
                <TriBotIcon />
            </div>
        )}
      </button>
    </div>
  );
};
