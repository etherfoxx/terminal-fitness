import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function TerminalXterm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'monospace',
      fontSize: 16,
      theme: {
        background: '#000',
        foreground: '#0f0',
        cursor: '#0f0',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    fitAddon.fit(); // 🔥 THIS LINE FIXES IT
    term.focus();
    window.addEventListener('resize', () => {
      fitAddon.fit();
    });
    // Initial text
    term.writeln('Terminal Fitness');
    term.writeln("Type '--help' to begin.");
    term.writeln('');
    term.write('> ');

    let buffer = '';

    term.onData((data) => {
      // Enter
      if (data === '\r') {
        term.writeln('');
        term.writeln(`You typed: ${buffer}`);
        buffer = '';
        term.write('> ');
        return;
      }

      // Backspace
      if (data === '\u007F') {
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      // Normal characters
      buffer += data;
      term.write(data);
    });

    termRef.current = term;

    return () => {
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'black',
        padding: '1rem',
      }}
    />
  );
}
