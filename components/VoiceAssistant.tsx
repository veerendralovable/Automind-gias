import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Activity, MessageSquare } from 'lucide-react';
import { VoiceInteractionAgent } from '../services/geminiService';
import { autoMind } from '../services/autoMindService';

export const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<'NEUTRAL' | 'HAPPY' | 'CONCERNED' | 'ALERT'>('NEUTRAL');

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceQuery(text);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }

    synthesisRef.current = window.speechSynthesis;
    
    return () => {
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
        alert("Voice recognition not supported in this browser.");
        return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setIsOpen(true);
      setTranscript("Listening...");
      setResponse(null);
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleVoiceQuery = async (text: string) => {
    setProcessing(true);
    
    // Get Context
    const context = autoMind.getVoiceContext();
    
    // Call Gemini Agent
    const result = await VoiceInteractionAgent.chatWithDriver(text, context);
    
    setProcessing(false);
    setResponse(result.text);
    setEmotion(result.emotion);
    
    speakResponse(result.text);
  };

  const speakResponse = (text: string) => {
    if (!synthesisRef.current) return;
    
    synthesisRef.current.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    
    // Attempt to pick a decent voice
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    synthesisRef.current.speak(utterance);
  };

  const getEmotionColor = () => {
    switch(emotion) {
        case 'HAPPY': return 'bg-green-500';
        case 'CONCERNED': return 'bg-yellow-500';
        case 'ALERT': return 'bg-red-500';
        default: return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      
      {/* Interaction Card */}
      {isOpen && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 w-72 mb-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                    <Activity size={16} className={listening ? "text-red-500 animate-pulse" : "text-blue-500"} />
                    <span className="text-xs font-bold text-slate-300">AUTO-MIND ASSISTANT</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={16} />
                </button>
            </div>
            
            <div className="bg-slate-950 rounded p-3 mb-3 border border-slate-800 min-h-[60px]">
                {processing ? (
                    <div className="flex items-center space-x-2 text-slate-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                    </div>
                ) : (
                    <p className="text-sm text-slate-300 italic">"{transcript}"</p>
                )}
            </div>

            {response && (
                <div className={`p-3 rounded border-l-4 border-slate-700 bg-slate-800`}>
                     <p className="text-sm text-white">{response}</p>
                </div>
            )}
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={toggleListen}
        className={`${getEmotionColor()} hover:opacity-90 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center`}
      >
        {listening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
};