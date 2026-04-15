import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useSpeechToText({ lang = 'pt-BR', onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const supported = !!SpeechRecognition;

  const start = useCallback(() => {
    if (!SpeechRecognition) {
      onErrorRef.current?.('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) onResultRef.current?.(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        onErrorRef.current?.('Permita o acesso ao microfone nas configurações do navegador.');
      } else if (event.error !== 'aborted') {
        onErrorRef.current?.('Erro no reconhecimento de voz.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [lang]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isListening, start, stop, supported };
}
