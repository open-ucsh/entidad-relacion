'use client';

import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type FeedbackTone = 'success' | 'error' | 'info';

interface Feedback {
  id: number;
  tone: FeedbackTone;
  message: string;
}

interface ShowFeedbackOptions {
  tone: FeedbackTone;
  message: string;
}

interface EditorFeedbackContextValue {
  showFeedback: (options: ShowFeedbackOptions) => void;
}

const EditorFeedbackContext = createContext<EditorFeedbackContextValue | null>(null);

const TONE_STYLES = {
  success: {
    Icon: CircleCheck,
    iconClassName: 'text-emerald-600',
    borderClassName: 'border-emerald-200',
  },
  error: {
    Icon: CircleAlert,
    iconClassName: 'text-rose-600',
    borderClassName: 'border-rose-200',
  },
  info: {
    Icon: Info,
    iconClassName: 'text-brand-primary',
    borderClassName: 'border-border',
  },
} as const;

interface EditorFeedbackProviderProps {
  children: ReactNode;
}

export function EditorFeedbackProvider({ children }: EditorFeedbackProviderProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const timeoutRef = useRef<number | null>(null);

  const dismissFeedback = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setFeedback(null);
  }, []);

  const showFeedback = useCallback(({ tone, message }: ShowFeedbackOptions) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    const id = Date.now();

    setFeedback({
      id,
      tone,
      message,
    });

    timeoutRef.current = window.setTimeout(() => {
      setFeedback((currentFeedback) => (currentFeedback?.id === id ? null : currentFeedback));

      timeoutRef.current = null;
    }, 4500);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const style = feedback ? TONE_STYLES[feedback.tone] : null;

  return (
    <EditorFeedbackContext.Provider value={{ showFeedback }}>
      {children}

      {feedback && style && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-70 flex max-w-sm items-start gap-3 rounded-xl border bg-background px-4 py-3 shadow-xl ${style.borderClassName}`}
        >
          <style.Icon
            size={19}
            className={`mt-0.5 shrink-0 ${style.iconClassName}`}
            aria-hidden="true"
          />

          <p className="flex-1 text-sm leading-5 text-text">{feedback.message}</p>

          <button
            type="button"
            onClick={dismissFeedback}
            aria-label="Cerrar aviso"
            className="flex size-6 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </EditorFeedbackContext.Provider>
  );
}

export function useEditorFeedback(): EditorFeedbackContextValue {
  const context = useContext(EditorFeedbackContext);

  if (!context) {
    throw new Error('useEditorFeedback debe usarse dentro de EditorFeedbackProvider.');
  }

  return context;
}
