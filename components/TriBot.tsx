
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithTriBot } from '../services/geminiService';

interface TriBotProps {
  currentContext: string;
}

export const TriBot: React.FC<TriBotProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: '¡Hola! 🤖 Soy TriBot, tu asistente de IA. ¿En qué te puedo ayudar hoy?', timestamp: Date.now() }
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
    const responseText = await chatWithTriBot(input, messages, currentContext);

    const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, botMsg]);
    setIsProcessing(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden transform transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex items-center justify-between text-white">
            <div className="flex items-center">
              <div className="bg-white/10 p-2 rounded-lg mr-3 backdrop-blur-sm border border-white/20">
                 <i className="fa-solid fa-microchip text-tri-blue"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm font-sport tracking-wide text-lg">TriBot AI</h3>
                <p className="text-[10px] text-gray-300 uppercase tracking-wider">Asistente Inteligente</p>
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
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 mr-2 flex items-center justify-center">
                        <i className="fa-solid fa-robot text-xs text-gray-600"></i>
                    </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-tri-blue text-white rounded-br-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
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
                <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-tri-blue focus-within:bg-white transition-colors">
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
        className={`${isOpen ? 'bg-gray-700 rotate-90' : 'bg-gradient-to-r from-tri-blue to-cyan-400'} text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-microchip'} text-2xl`}></i>
      </button>
    </div>
  );
};
