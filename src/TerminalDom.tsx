import { useEffect, useRef, useState } from 'react';
import { routeCommand } from './commandRouter';
import { useTerminalEngine } from './hooks/useTerminalEngine';
import type { WorkoutSet } from './types/workout';
import { Helpers } from './utils/helpers';
function isMobileDevice() {
  return /iPhone|iPad|Android/i.test(navigator.userAgent);
}

export default function TerminalDom() {
  const workoutStartRef = useRef<number | null>(null);
  const workoutSetsRef = useRef<WorkoutSet[]>([]);
  const isMobile = isMobileDevice();

  const [, forceTick] = useState(0);

  const terminal = useTerminalEngine({
    onCommand: runCommand,
  });
  function MobileTerminalInput({
    prompt,
    onSubmit,
  }: {
    prompt: string;
    onSubmit: (value: string) => void;
  }) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    return (
      <div style={mobileInputLine}>
        <span>{prompt}</span>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); //  important on iOS

              const cmd = value;
              setValue('');
              onSubmit(cmd);

              // force focus back AFTER render
              requestAnimationFrame(() => {
                inputRef.current?.focus();
              });
            }
          }}
          spellCheck={false}
          autoCorrect='off'
          autoCapitalize='off'
          inputMode='text'
          style={mobileInput}
        />
      </div>
    );
  }

  const workoutStatus = workoutStartRef.current
    ? `WORKOUT ACTIVE — ${Helpers.formatDuration(
        Date.now() - workoutStartRef.current
      )}`
    : null;

  function runCommand(cmd: string) {
    return routeCommand(cmd, {
      workoutStart: workoutStartRef.current,
      startWorkout: () => {
        workoutStartRef.current = Date.now();
      },
      addSet: (set) => {
        workoutSetsRef.current.push({
          ...set,
          timestamp: Date.now(),
        });
      },
      endWorkout: () => {
        const durationMs = Date.now() - workoutStartRef.current!;
        const sets = workoutSetsRef.current;

        workoutStartRef.current = null;
        workoutSetsRef.current = [];

        return {
          durationMs,
          sets,
        };
      },
      clear: terminal.clear,
    });
  }
  // useEffect(() => {
  //   if (!workoutStartRef.current) return;

  //   const interval = setInterval(() => {
  //     forceTick((n) => n + 1);
  //   }, 1_000); // once per minute

  //   return () => clearInterval(interval);
  // }, [workoutStartRef.current]);

  return (
    <div ref={terminal.containerRef} style={container} onClick={terminal.focus}>
      {workoutStatus && <div style={statusLine}>[{workoutStatus}]</div>}

      {terminal.lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: isMobile ? 'pre-wrap' : 'pre' }}>
          {line}
        </div>
      ))}

      {isMobile ? (
        <MobileTerminalInput
          prompt={workoutStartRef.current ? '(workout) > ' : '> '}
          onSubmit={(cmd) => {
            terminal.print(
              `${workoutStartRef.current ? '(workout) > ' : '> '}${cmd}`
            );

            const result = runCommand(cmd);

            if (typeof result === 'string') {
              terminal.print(result);
            } else if (Array.isArray(result)) {
              result.forEach(terminal.print);
            }
          }}
        />
      ) : (
        <div style={inputLine}>
          <span>{workoutStartRef.current ? '(workout) > ' : '> '}</span>

          <span ref={terminal.inputTextRef} style={{ whiteSpace: 'pre' }}>
            {terminal.input}
          </span>

          <span ref={terminal.cursorRef} style={cursorStyle}>
            ▊
          </span>

          <input
            ref={terminal.hiddenInputRef}
            value={terminal.input}
            onChange={terminal.onChange}
            onKeyDown={terminal.onKeyDown}
            autoFocus
            style={hiddenInput}
          />
        </div>
      )}
    </div>
  );
}

const container: React.CSSProperties = {
  background: '#000',
  color: '#0f0',
  fontFamily: 'monospace',
  width: '100vw',
  height: '100vh',
  padding: '16px',
  boxSizing: 'border-box',
  fontSize: '16px',
  lineHeight: 1.5,
  overflowY: 'auto',
  overflowX: 'auto',
};

const inputLine: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  whiteSpace: 'pre',
};

const cursorStyle: React.CSSProperties = {
  marginLeft: 2,
  animation: 'blink 1s step-end infinite',
};

const hiddenInput: React.CSSProperties = {
  position: 'absolute',
  opacity: 0,
  pointerEvents: 'none',
};
const statusLine: React.CSSProperties = {
  opacity: 0.8,
  marginBottom: 8,
};
const mobileInputLine: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingTop: 12,
};

const mobileInput: React.CSSProperties = {
  flex: 1,
  background: 'black',
  color: '#0f0',
  border: 'none',
  outline: 'none',
  fontFamily: 'monospace',
  fontSize: 16,
};
