import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { SessionManager } from './managers/sessionManager';
import { routeCommand } from './app/commandRouter';
import type { Prompt } from './classes/Prompt';
import { CreateConfigPrompt } from './classes/CreateConfigPrompt';
import type { SessionData } from './types/session/session';
type TerminalInitResult = {
  dispose: () => void;
};
export default function TerminalXterm() {
  const containerRef = useRef<HTMLDivElement>(null);
  let activePrompt: Prompt | null = null;
  let activeConfigId: string | null = null;

  function writePrompt(term: Terminal) {
    if (activeConfigId) {
      term.write(`[config: ${activeConfigId}] > `);
      return;
    }

    term.write('> ');
  }

  function emitOutput(
    term: Terminal,
    session: SessionData,
    lines: string[]
  ): SessionData {
    let s = session;

    for (const line of lines) {
      term.writeln(line);
      s = SessionManager.append(s, {
        type: 'output',
        text: line,
      });
    }

    return s;
  }

  const TerminalInit = (container: HTMLDivElement): TerminalInitResult => {
    // ---------- Create terminal ----------
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'monospace',
      fontSize: 16,
      theme: {
        background: '#000',
        foreground: 'rgb(0, 221, 255)',
        cursor: 'rgb(0, 221, 255)',
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

      term.writeln('Terminal Configurator');
      term.writeln("Type '--help' to begin.");
      term.writeln('');
    } else {
      term.writeln('[Session restored]');
      term.writeln('Terminal Configurator');
      term.writeln('');

      for (const entry of session.transcript) {
        if (entry.type === 'input') {
          term.writeln(`> ${entry.text}`);
        } else if (entry.type === 'config-created') {
          term.writeln(`[config: ${activeConfigId}] > ${entry.text}`);
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
        const input = buffer.trim();
        buffer = '';

        term.writeln(''); // cursor movement only (not logged)

        // PROMPT HAS CONTROL
        if (activePrompt) {
          const result = activePrompt.handleInput(input);

          if (result.createdConfigId) {
            //  Persist the semantic event FIRST
            session = SessionManager.append(session!, {
              type: 'config-created',
              configId: result.createdConfigId,
            });

            //  Update runtime state
            activeConfigId = result.createdConfigId;
          }

          //  Emit user-visible output
          session = emitOutput(term, session!, result.output);

          if (result.done) {
            activePrompt = null;
          }

          writePrompt(term);
          return;
        }

        // START PROMPT
        if (input === 'new config') {
          session = SessionManager.append(session!, {
            type: 'input',
            text: input,
          });
          activePrompt = new CreateConfigPrompt();
          session = emitOutput(term, session!, activePrompt.start());
          writePrompt(term);
          return;
        }

        // NORMAL COMMAND
        if (input.length > 0) {
          session = SessionManager.append(session!, {
            type: 'input',
            text: input,
          });
          const result = routeCommand(input, session!);
          session = emitOutput(term, session!, result.outputLines);
        }

        writePrompt(term);
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
