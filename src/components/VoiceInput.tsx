import { Mic, MicOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { appendSpeechTranscript, hasSpeechRecognitionSupport, type SpeechRecognitionEventLike } from '../voice/speechRecognition';

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoiceInput({ value, onChange, ariaLabel = 'Usar microfone' }: { value: string; onChange: (value: string) => void; ariaLabel?: string }) {
  const recognitionRef = useRef<Recognition | null>(null);
  const baseValueRef = useRef(value);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const supported = typeof window !== 'undefined' && hasSpeechRecognitionSupport(window);

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  const toggle = () => {
    if (!supported) { setMessage('A transcrição por voz não está disponível neste navegador.'); return; }
    if (listening) { recognitionRef.current?.stop(); return; }
    const RecognitionConstructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!RecognitionConstructor) return;
    const recognition = new RecognitionConstructor() as unknown as Recognition;
    baseValueRef.current = value;
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => onChange(appendSpeechTranscript(baseValueRef.current, event));
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setMessage('Não foi possível acessar o microfone.'); };
    recognitionRef.current = recognition;
    setMessage('');
    setListening(true);
    recognition.start();
  };

  return <span className="voice-control"><button type="button" className={`voice-button ${listening ? 'is-listening' : ''}`} onClick={toggle} aria-label={listening ? 'Parar gravação' : ariaLabel} title={listening ? 'Parar gravação' : ariaLabel}>{listening ? <MicOff size={15} /> : <Mic size={15} />}</button>{message && <span className="voice-message" role="status">{message}</span>}</span>;
}
