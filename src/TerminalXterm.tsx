import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import type { SessionData } from './types/session/session';
import { SessionManager } from './managers/sessionManager';
type TerminalInitResult = {
  dispose: () => void;
};
export default function TerminalXterm() {
  const containerRef = useRef<HTMLDivElement>(null);

  const TerminalInit = (container: HTMLDivElement): TerminalInitResult => {
    // ---------- Create terminal ----------
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

    term.open(container);
    fitAddon.fit();
    term.focus();

    const onResize = () => fitAddon.fit();
    window.addEventListener('resize', onResize);

    // ---------- Session restore (VISUAL ONLY) ----------
    let session = SessionManager.load();

    if (!session || session.transcript.length === 0) {
      session = SessionManager.createNew();

      term.writeln('Terminal Fitness');
      term.writeln("Type '--help' to begin.");
      term.writeln('');
    } else {
      term.writeln('[Session restored]');
      term.writeln('');

      for (const entry of session.transcript) {
        if (entry.type === 'input') {
          term.writeln(`> ${entry.text}`);
        } else {
          term.writeln(entry.text);
        }
      }
    }

    term.write('> ');

    // ---------- Input handling ----------
    let buffer = '';

    const disposable = term.onData((data) => {
      // Enter
      if (data === '\r') {
        const command = buffer.trim();
        buffer = '';

        term.writeln('');

        if (command.length > 0) {
          // Persist INPUT
          session = SessionManager.append(session!, {
            type: 'input',
            text: command,
          });

          // TEMP output (replace later with routeCommand)
          const output = `You typed: ${command}`;
          term.writeln(output);

          // Persist OUTPUT
          session = SessionManager.append(session!, {
            type: 'output',
            text: output,
          });
        }

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

    // ---------- Return cleanup ----------
    return {
      dispose() {
        disposable.dispose();
        window.removeEventListener('resize', onResize);
        term.dispose();
      },
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const { dispose } = TerminalInit(containerRef.current);

    return () => {
      dispose();
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
