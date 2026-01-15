import React, { useState } from 'react';
import TerminalDom from './TerminalDom';
import TerminalXterm from './TerminalXterm';

type Props = {};

function App() {
  const [mode, setMode] = useState<'dom' | 'xterm'>('dom');

  return (
    <>
      <button onClick={() => setMode('dom')}>DOM</button>
      <button onClick={() => setMode('xterm')}>Xterm</button>

      {mode === 'dom' ? <TerminalDom /> : <TerminalXterm />}
    </>
  );
}

export default App;
