import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

/**
 * VoiceInput Component
 * 
 * Uses the Web Speech API for browser-based voice recognition.
 * This is FREE and works in Chrome, Edge, and Safari.
 * 
 * For users who need it, there's also server-side Whisper support
 * via the /api/voice/transcribe endpoint (requires OpenAI key).
 */
export default function VoiceInput({ onResult }) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(event.error)
        setIsListening(false)
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript)
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onResult])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-3 bg-gray-700 text-gray-500 rounded-xl cursor-not-allowed"
        title="Voice input not supported in this browser. Try Chrome or Edge."
      >
        <MicOff size={20} />
      </button>
    )
  }

  return (
    <button
      onClick={toggleListening}
      className={`p-3 rounded-xl transition ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 animate-pulse'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <Mic size={20} className="text-white" />
      ) : (
        <Mic size={20} />
      )}
    </button>
  )
}


/**
 * Hook version for more flexibility
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (e) => {
      setError(e.error)
      setIsListening(false)
    }
    recognition.onresult = (event) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        }
      }
      if (final) setTranscript(final)
    }

    recognitionRef.current = recognition
    
    return () => recognition.stop()
  }, [])

  const startListening = () => recognitionRef.current?.start()
  const stopListening = () => recognitionRef.current?.stop()
  const toggleListening = () => {
    if (isListening) stopListening()
    else startListening()
  }

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    isSupported: !!recognitionRef.current
  }
}
