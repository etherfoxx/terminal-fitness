import { useEffect, useRef, useState } from 'react';
import { routeCommand } from './commandRouter';
import { useTerminalEngine } from './hooks/useTerminalEngine';
import { formatDuration } from './utils/helpers';

export default function App() {
  const workoutStartRef = useRef<number | null>(null);
  const workoutSetsRef = useRef<
    {
      exercise: string;
      weight: number;
      sets: number;
      reps: number;
      timestamp: number;
    }[]
  >([]);

  const [, forceTick] = useState(0);

  const terminal = useTerminalEngine({
    onCommand: runCommand,
  });

  const workoutStatus = workoutStartRef.current
    ? `WORKOUT ACTIVE — ${formatDuration(Date.now() - workoutStartRef.current)}`
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
        const duration = Date.now() - workoutStartRef.current!;
        workoutStartRef.current = null;
        return duration;
      },
      clear: terminal.clear,
    });
  }
  useEffect(() => {
    if (!workoutStartRef.current) return;

    const interval = setInterval(() => {
      forceTick((n) => n + 1);
    }, 1_000); // once per minute

    return () => clearInterval(interval);
  }, [workoutStartRef.current]);

  return (
    <div ref={terminal.containerRef} style={container} onClick={terminal.focus}>
      {workoutStatus && <div style={statusLine}>[{workoutStatus}]</div>}

      {terminal.lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre' }}>
          {line}
        </div>
      ))}

      <div style={inputLine}>
        <span>{workoutStartRef.current ? '(workout) > ' : '> '}</span>

        {/* Rendered input (preserve spaces) */}
        <span ref={terminal.inputTextRef} style={{ whiteSpace: 'pre' }}>
          {terminal.input}
        </span>

        {/* Cursor that gets scrolled into view */}
        <span ref={terminal.cursorRef} style={cursorStyle}>
          ▊
        </span>

        {/* Invisible input to capture keystrokes */}
        <input
          ref={terminal.hiddenInputRef}
          value={terminal.input}
          onChange={terminal.onChange}
          onKeyDown={terminal.onKeyDown}
          autoFocus
          style={hiddenInput}
        />
      </div>
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
