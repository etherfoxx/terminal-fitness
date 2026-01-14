import { useEffect, useRef, useState } from 'react';

type CommandResult = void | string | string[];

type UseTerminalEngineOptions = {
  initialLines?: string[];
  onCommand?: (cmd: string) => CommandResult;
  cursorGutterPx?: number; // little breathing room from right edge
};

export function useTerminalEngine(options?: UseTerminalEngineOptions) {
  const {
    initialLines = ['Homelab Fitness Terminal', "Type 'help' to begin."],
    onCommand,
    cursorGutterPx = 24,
  } = options ?? {};

  const [lines, setLines] = useState<string[]>(initialLines);
  const [input, setInput] = useState('');

  // DOM refs used by the renderer (App)
  const containerRef = useRef<HTMLDivElement>(null);
  const inputTextRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Keep latest onCommand without re-wiring handlers
  const onCommandRef = useRef<typeof onCommand>(onCommand);
  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  // Helpers exposed to App (and used internally)
  const print = (text: string) => {
    setLines((prev) => [...prev, text]);
  };

  const clear = () => {
    setLines(initialLines);
  };

  const focus = () => {
    hiddenInputRef.current?.focus();
  };

  // The “perfect” horizontal behavior:
  // - measure ONLY the input text width
  // - if it fits -> snap left
  // - if it overflows -> keep cursor visible
  useEffect(() => {
    const container = containerRef.current;
    const inputText = inputTextRef.current;
    const cursor = cursorRef.current;

    if (!container || !inputText || !cursor) return;

    const inputWidth = inputText.offsetWidth;
    const visibleWidth = container.clientWidth;

    const isOverflowing = inputWidth + cursorGutterPx > visibleWidth;

    if (!isOverflowing) {
      container.scrollLeft = 0;
    } else {
      cursor.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [input, cursorGutterPx]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    const cmd = input;

    // Echo command like a terminal
    setLines((prev) => [...prev, `> ${cmd}`]);

    // Ask consumer what to do (no circular dependency!)
    const result = onCommandRef.current?.(cmd);

    // Print result(s) if provided
    if (typeof result === 'string') {
      setLines((prev) => [...prev, result]);
    } else if (Array.isArray(result)) {
      setLines((prev) => [...prev, ...result]);
    }

    // Clear input for next prompt
    setInput('');
  };

  return {
    // state
    lines,
    input,

    // refs
    containerRef,
    inputTextRef,
    cursorRef,
    hiddenInputRef,

    // handlers
    onChange,
    onKeyDown,

    // helpers
    focus,
    print,
    clear,
  };
}
