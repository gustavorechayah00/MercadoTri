
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithTriBot } from '../services/geminiService';

interface TriBotProps {
  currentContext: string;
}

export const TriBot: React.FC<TriBotProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: '¡Hola! 👋 ¿Buscás algo en especial hoy? Avisame si te puedo dar una mano con algún equipo.', timestamp: Date.now() }
  ]);
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
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStopRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    if (audioBlob.size < 100) return; // Too small, ignore

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      
      // Add "Audio Sent" placeholder message
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: '🎤 Mensaje de audio enviado',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMsg]);
      setIsProcessing(true);

      // Call AI with current screen context
      const responseText = await chatWithTriBot(base64Audio, messages, currentContext);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsProcessing(false);
    };
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden transform transition-all duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-tri-orange to-orange-500 p-4 flex items-center justify-between text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                 <i className="fa-solid fa-robot"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">TriBot</h3>
                <p className="text-xs text-orange-100">Experto Mercado Tri</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-tri-blue text-white rounded-br-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm rounded-bl-none flex items-center space-x-2">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-center">
             <button 
               onMouseDown={startRecording}
               onMouseUp={stopRecording}
               onTouchStart={startRecording}
               onTouchEnd={stopRecording}
               className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                 isRecording 
                   ? 'bg-red-500 text-white recording-pulse scale-110' 
                   : 'bg-gray-100 text-gray-500 hover:bg-tri-orange hover:text-white'
               }`}
             >
               <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-xl`}></i>
             </button>
             <p className="absolute bottom-1 text-[10px] text-gray-400 mt-2">
               {isRecording ? 'Soltar para enviar' : 'Mantén para hablar'}
             </p>
          </div>
        </div>
      )}

      {/* Toggle Button (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-gray-500' : 'bg-tri-orange'} text-white w-14 h-14 rounded-full shadow-lg hover:bg-orange-600 transition flex items-center justify-center transform hover:scale-105`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-headset'} text-2xl`}></i>
      </button>
    </div>
  );
};
