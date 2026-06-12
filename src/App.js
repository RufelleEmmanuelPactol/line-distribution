import React, {useState, useEffect, useRef} from 'react';
import {RotateCcw, Undo2, Plus, Minus, CornerDownLeft, Delete, Pencil, Command} from 'lucide-react';

function Imagery ({image}) {
  return (
      <img src={image} alt="" className="w-full h-[40vh] object-cover object-[50%_37%]">
      </img>
  )
}

// Linear-light palette — saturated bar fills with a slightly deeper text shade
// so colored labels stay legible on a white background.
const COLORS = [
  { fill: '#fa5252', text: '#e03131' }, // red
  { fill: '#ff922b', text: '#e8590c' }, // orange
  { fill: '#fcc419', text: '#f08c00' }, // yellow
  { fill: '#51cf66', text: '#2f9e44' }, // green
  { fill: '#4dabf7', text: '#1c7ed6' }, // blue
  { fill: '#748ffc', text: '#4263eb' }, // indigo
  { fill: '#cc5de8', text: '#9c36b5' }, // grape
  { fill: '#f783ac', text: '#d6336c' }, // pink
  { fill: '#20c997', text: '#099268' }, // teal
  { fill: '#3bc9db', text: '#0c8599' }, // cyan
];

const colorFor = (number) => COLORS[(number - 1) % COLORS.length];

const PRESETS = [
  {
    name: 'GFRIEND',
    labels: ['Sowon', 'Yerin', 'Eunha', 'Yuju', 'SinB', 'Umji'],
  },
  {
    name: 'Apink',
    labels: ['Chorong', 'Bomi', 'Eunji', 'Namjoo', 'Hayoung'],
  },
  {
    name: 'TWICE',
    labels: ['Nayeon', 'Jeongyeon', 'Momo', 'Sana', 'Jihyo', 'Mina', 'Dahyun', 'Chaeyoung', 'Tzuyu'],
  },
  {
    name: 'AHOF',
    labels: ['Steven', 'Jeongwoo', 'Woongki', 'Shuaibo', 'Han', 'JL', 'Juwon', 'Chih En', 'Daisuke'],
  },
  {
    name: 'BTS',
    labels: ['Jin', 'Suga', 'J-Hope', 'RM', 'Jimin', 'V', 'Jungkook'],
  },
  {
    name: "Girls' Generation",
    labels: ['Taeyeon', 'Jessica', 'Sunny', 'Tiffany', 'Hyoyeon', 'Yuri', 'Sooyoung', 'Yoona', 'Seohyun'],
  },
];

const MultipleTimers = () => {
  const [MAX_DURATION, setDuration] = useState(50);
  const inputRef = useRef(null)
  const MAX_TIMERS = 10;
  const [title, setTitle] = useState("Line Distribution");

  const [timers, setTimers] = useState({});
  const [timerLabels, setTimerLabels] = useState({});
  const [visibleTimers, setVisibleTimers] = useState(4);
  const [timerHistory, setTimerHistory] = useState({});
  // 'normal' | 'reset' | 'undo' — drives the keyboard-action modes.
  const [mode, setMode] = useState('normal');
  const [showPresets, setShowPresets] = useState(false);
  const MAX_DURATION_REF = useRef(MAX_DURATION);
  useEffect(() => {
    // Update the ref whenever MAX_DURATION changes
    MAX_DURATION_REF.current = MAX_DURATION;
  }, [MAX_DURATION]);

  // Calculate rankings and percentages based on elapsed times
  const calculateRanksAndPercentages = () => {
    const activeTimers = Object.entries(timers)
        .filter(([number]) => number <= visibleTimers)
        .map(([number, timer]) => ({
          number: parseInt(number),
          elapsed: timer.elapsed || 0
        }))
        .sort((a, b) => b.elapsed - a.elapsed);

    const totalElapsed = activeTimers.reduce((sum, timer) => sum + timer.elapsed, 0);

    const ranks = {};
    const percentages = {};

    activeTimers.forEach((timer, index) => {
      ranks[timer.number] = index + 1;
      percentages[timer.number] = totalElapsed > 0
          ? ((timer.elapsed / totalElapsed) * 100).toFixed(1)
          : '0.0';
    });

    return { ranks, percentages };
  };

  const saveToTimerHistory = (number) => {
    setTimerHistory(prev => ({
      ...prev,
      [number]: [
        ...(prev[number] || []),
        {
          elapsed: timers[number]?.elapsed || 0,
          isRunning: timers[number]?.isRunning || false,
          label: timerLabels[number] || ''
        }
      ]
    }));
  };

  const undoTimer = (number) => {
    setTimerHistory(prev => {
      const timerStates = prev[number] || [];
      if (timerStates.length <= 1) return prev;

      const newHistory = {
        ...prev,
        [number]: timerStates.slice(0, -1)
      };

      const lastState = timerStates[timerStates.length - 2];
      setTimers(prevTimers => ({
        ...prevTimers,
        [number]: {
          ...prevTimers[number],
          elapsed: lastState.elapsed,
          isRunning: lastState.isRunning
        }
      }));

      setTimerLabels(prevLabels => ({
        ...prevLabels,
        [number]: lastState.label
      }));

      return newHistory;
    });
  };

  const toggleTimer = (number) => {
    if (!timers[number]) {
      setTimerHistory(prev => ({
        ...prev,
        [number]: [{
          elapsed: 0,
          isRunning: false,
          label: ''
        }]
      }));
    }

    saveToTimerHistory(number);

    setTimers(prev => ({
      ...prev,
      [number]: {
        ...prev[number],
        duration: MAX_DURATION,
        elapsed: prev[number]?.elapsed || 0,
        isRunning: !prev[number]?.isRunning
      }
    }));
  };

  const resetTimer = (number) => {
    saveToTimerHistory(number);
    setTimers(prev => ({
      ...prev,
      [number]: {
        ...prev[number],
        elapsed: 0,
        isRunning: false
      }
    }));
  };

  const resetAll = () => {
    for (let n = 1; n <= visibleTimers; n++) {
      saveToTimerHistory(n);
    }
    setTimers(prev => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = { ...next[key], elapsed: 0, isRunning: false };
      });
      return next;
    });
  };

  const handleLabelChange = (number, value) => {
    saveToTimerHistory(number);
    setTimerLabels(prev => ({
      ...prev,
      [number]: value
    }));
  };

  const addTimer = () => {
    if (visibleTimers < MAX_TIMERS) {
      const newTimerNumber = visibleTimers + 1;
      setVisibleTimers(prev => prev + 1);

      setTimerHistory(prev => ({
        ...prev,
        [newTimerNumber]: [{
          elapsed: 0,
          isRunning: false,
          label: ''
        }]
      }));
    }
  };

  const removeTimer = () => {
    if (visibleTimers > 1) {
      const lastTimer = visibleTimers;
      setVisibleTimers(prev => prev - 1);
      setTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[lastTimer];
        return newTimers;
      });
      setTimerLabels(prev => {
        const newLabels = { ...prev };
        delete newLabels[lastTimer];
        return newLabels;
      });
      setTimerHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[lastTimer];
        return newHistory;
      });
    }
  };

  const applyPreset = (preset) => {
    const nextLabels = {};
    const nextTimers = {};
    const nextHistory = {};

    preset.labels.forEach((label, index) => {
      const number = index + 1;
      nextLabels[number] = label;
      nextTimers[number] = {
        duration: MAX_DURATION,
        elapsed: 0,
        isRunning: false,
      };
      nextHistory[number] = [{
        elapsed: 0,
        isRunning: false,
        label,
      }];
    });

    setTitle(preset.name);
    setVisibleTimers(preset.labels.length);
    setTimerLabels(nextLabels);
    setTimers(nextTimers);
    setTimerHistory(nextHistory);
    setMode('normal');
    setShowPresets(false);
  };

  // Keyboard control scheme:
  //   1-9, 0    → start/stop a timer (0 = timer 10)
  //   Enter     → enter RESET mode; next number resets that timer
  //   Backspace → enter UNDO mode; next number undoes that timer
  //   Enter then Backspace → reset all timers
  //   Esc       → cancel any pending mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key;

      // ⌘/Ctrl + = (or +) adds a line, ⌘/Ctrl + - removes one. Handled before
      // the text-field guard so they work even while a label is focused, and
      // they override the browser's native zoom shortcuts.
      if (e.metaKey || e.ctrlKey) {
        if (key.toLowerCase() === 'k') {
          e.preventDefault();
          setShowPresets(prev => !prev);
          return;
        }
        if (key === '=' || key === '+') {
          e.preventDefault();
          addTimer();
          return;
        }
        if (key === '-' || key === '_') {
          e.preventDefault();
          removeTimer();
          return;
        }
      }

      // Don't hijack keys while the user is typing in any text field.
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

      if (key === 'Escape') {
        setShowPresets(false);
        setMode('normal');
        return;
      }

      if (showPresets) return;

      if (key === 'Enter') {
        e.preventDefault();
        setMode('reset');
        return;
      }

      if (key === 'Backspace') {
        e.preventDefault();
        if (mode === 'reset') {
          resetAll();
          setMode('normal');
        } else {
          setMode('undo');
        }
        return;
      }

      const timerNumber = key === '0' ? 10 : parseInt(key);
      if (timerNumber >= 1 && timerNumber <= visibleTimers) {
        if (mode === 'reset') {
          resetTimer(timerNumber);
          setMode('normal');
        } else if (mode === 'undo') {
          undoTimer(timerNumber);
          setMode('normal');
        } else {
          toggleTimer(timerNumber);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timers, visibleTimers, timerLabels, mode, showPresets, MAX_DURATION]);

  const lastTickRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      // Use real wall-clock time between ticks so elapsed tracks actual
      // seconds, instead of assuming each interval fires exactly on time.
      const now = performance.now();
      const delta = (now - (lastTickRef.current ?? now)) / 1000;
      lastTickRef.current = now;
      if (delta <= 0) return;

      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        let hasChanges = false;

        Object.keys(newTimers).forEach((key) => {
          if (
              newTimers[key].isRunning &&
              newTimers[key].elapsed < MAX_DURATION_REF.current
          ) {
            newTimers[key] = {
              ...newTimers[key],
              elapsed: Math.min(
                  newTimers[key].elapsed + delta,
                  MAX_DURATION_REF.current
              ),
            };
            hasChanges = true;
          }
        });

        return hasChanges ? newTimers : prevTimers;
      });
    }, 10);

    return () => clearInterval(interval);
  }, []);

  const { percentages } = calculateRanksAndPercentages();

  const [isVisible, setVisibility] = useState('visible');
  const showUtils = isVisible === 'visible';

  // Faint left-side key indicator so users can see which keyboard key maps to
  // each member's line (timer 10 is the "0" key).
  const [showMapping, setShowMapping] = useState(true);

  const numbers = Array.from({length: visibleTimers}, (_, i) => i + 1);

  const Kbd = ({ children }) => (
      <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[#e3e3e7] bg-white text-[11px] font-medium text-[#62656e] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        {children}
      </kbd>
  );

  const modeBanner = () => {
    if (mode === 'normal') return null;
    const isReset = mode === 'reset';
    return (
        <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] font-medium animate-[fadeIn_120ms_ease-out]"
            style={{
              background: isReset ? '#fef2f2' : '#eff6ff',
              color: isReset ? '#b91c1c' : '#1d4ed8',
              border: `1px solid ${isReset ? '#fecaca' : '#bfdbfe'}`,
            }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                  style={{ background: isReset ? '#ef4444' : '#3b82f6' }}/>
            <span className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: isReset ? '#ef4444' : '#3b82f6' }}/>
          </span>
          {isReset ? (
              <span>Reset mode — press a <strong>number</strong> to reset it, or <Kbd>⌫</Kbd> to reset all</span>
          ) : (
              <span>Undo mode — press a <strong>number</strong> to step it back</span>
          )}
          <span className="text-[#9ca0ab]">·</span>
          <span className="text-current/70"><Kbd>Esc</Kbd> to cancel</span>
        </div>
    );
  };

  return (
      <div className="min-h-screen w-full px-6 sm:px-10 py-8 sm:py-10">
        <div className="w-full">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="group/title relative inline-flex items-center -ml-1">
                  <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Untitled distribution"
                      size={Math.max((title || '').length, 'Untitled distribution'.length) + 1}
                      className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.02em] text-[#16161a] leading-none bg-transparent outline-none rounded-lg px-1 focus:bg-[#f4f4f6] placeholder:text-[#c4c7ce] max-w-full"
                  />
                  <Pencil size={16} strokeWidth={2}
                          className="ml-1 shrink-0 text-[#c4c7ce] opacity-0 group-hover/title:opacity-100 transition-opacity pointer-events-none"/>
                </div>
                <p className="mt-2 text-[14px] text-[#8a8f98]">
                  Hold a key to fill its line. The longer it runs, the bigger its share.
                </p>
              </div>

              {showUtils && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 pr-1.5 pl-3 h-9 rounded-xl bg-[#f1f2f5]">
                      <label className="text-[12px] font-medium text-[#8a8f98] whitespace-nowrap">Max</label>
                      <input
                          type="number"
                          min="1"
                          ref={inputRef}
                          defaultValue={MAX_DURATION}
                          onChange={(t) => setDuration(parseInt(t.target.value) || 1)}
                          className="w-12 h-7 px-1 text-[13px] font-semibold text-[#16161a] text-center rounded-lg outline-none focus:bg-white"
                      />
                      <span className="text-[12px] text-[#b0b3bb]">sec</span>
                    </div>

                    <button
                        onClick={() => setShowPresets(true)}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#f1f2f5] text-[13px] font-semibold text-[#3c3f47] hover:bg-[#e8e9ee] transition-colors"
                    >
                      <Command size={15} strokeWidth={2.4}/> Presets
                    </button>

                    <button
                        onClick={removeTimer}
                        disabled={visibleTimers <= 1}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#f1f2f5] text-[13px] font-semibold text-[#3c3f47] hover:bg-[#e8e9ee] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={15} strokeWidth={2.4}/> Remove
                    </button>
                    <button
                        onClick={addTimer}
                        disabled={visibleTimers >= MAX_TIMERS}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#5e6ad2] text-[13px] font-semibold text-white hover:bg-[#525dc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={15} strokeWidth={2.4}/> Add
                    </button>
                  </div>
              )}
            </div>

            {showPresets && (
                <div className="mt-4 max-w-xl rounded-xl border border-[#e6e7ec] bg-white shadow-[0_18px_50px_rgba(22,22,26,0.12)] overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[#ececef]">
                    <Command size={15} strokeWidth={2.4} className="text-[#5e6ad2]"/>
                    <span className="text-[13px] font-bold text-[#3c3f47]">Presets</span>
                    <span className="ml-auto text-[11px] text-[#9ca0ab]"><Kbd>⌘</Kbd> <Kbd>K</Kbd></span>
                  </div>
                  <div className="p-1.5">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#f6f6f8] transition-colors"
                        >
                          <span className="w-28 shrink-0 text-[13px] font-extrabold text-[#16161a]">{preset.name}</span>
                          <span className="min-w-0 truncate text-[12px] font-medium text-[#8a8f98]">
                            {preset.labels.join(', ')}
                          </span>
                        </button>
                    ))}
                  </div>
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                  onClick={() => setVisibility(showUtils ? 'invisible' : 'visible')}
                  className="text-[12px] font-medium text-[#8a8f98] hover:text-[#16161a] transition-colors"
              >
                {showUtils ? 'Hide controls' : 'Show controls'}
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-[12px] font-medium text-[#8a8f98]">Show mapping</span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={showMapping}
                    onClick={() => setShowMapping(v => !v)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showMapping ? 'bg-[#5e6ad2]' : 'bg-[#d4d6dd]'}`}
                >
                  <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${showMapping ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}/>
                </button>
              </label>

              {modeBanner()}
            </div>
          </header>

          {/* Distribution */}
          <div className="border-t border-[#ececef] pt-6">
            <div className="flex flex-col gap-1.5">
              {numbers.map(number => {
                const timer = timers[number];
                const color = colorFor(number);
                const hasUndo = (timerHistory[number]?.length || 0) > 1;
                const percentage = percentages[number] || '0.0';
                const isRunning = timer?.isRunning;
                const share = timer ? Math.min((timer.elapsed / MAX_DURATION) * 100, 100) : 0;

                const keyLabel = number === 10 ? '0' : String(number);

                return (
                    <div key={number} className="group flex items-center gap-2.5">
                      {/* faint keyboard-key indicator for quick navigation */}
                      {showMapping && (
                          <div className="shrink-0 w-3 text-center text-[12px] font-semibold tabular-nums text-[#c4c7ce] select-none">
                            {keyLabel}
                          </div>
                      )}

                      {/* seconds badge (primary) */}
                      <div
                          className="shrink-0 w-[3.5rem] h-9 flex items-center justify-center rounded-full text-[16px] font-extrabold tabular-nums tracking-[-0.02em] transition-colors"
                          style={{
                            background: `${color.fill}1f`,
                            color: color.text,
                          }}
                      >
                        {timer ? timer.elapsed.toFixed(1) : '0.0'}
                      </div>

                      {/* bar with name inside — no track, just the floating fill */}
                      <div className="relative flex-1 h-9">
                        <div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              width: `${share}%`,
                              // Full pill ends. No min-width so it grows smoothly
                              // from zero (no hang on short bars).
                              background: color.fill,
                              opacity: 0.92,
                              transition: isRunning ? 'none' : 'width 0.35s cubic-bezier(0.4,0,0.2,1)'
                            }}
                        />
                        <div className="absolute inset-0 flex items-center pl-4 pr-3.5 gap-1.5">
                          <input
                              type="text"
                              value={timerLabels[number] || ''}
                              onChange={(e) => handleLabelChange(number, e.target.value)}
                              placeholder={`Member ${number}`}
                              className="min-w-0 flex-1 bg-transparent text-[14px] font-extrabold tracking-[0.02em] uppercase outline-none placeholder:text-[#b6b9c1] placeholder:font-bold"
                              style={{ color: color.text }}
                          />
                          <Pencil size={12} strokeWidth={2.5}
                                  className="shrink-0 opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none"
                                  style={{ color: color.text }}/>
                          {timer && timer.elapsed > 0 && (
                              <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#9aa0aa]">
                                {percentage}%
                              </span>
                          )}
                        </div>
                      </div>

                      {/* reset / undo */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                            onClick={() => resetTimer(number)}
                            disabled={!timer || timer.elapsed === 0}
                            title="Reset"
                            className="p-1.5 rounded-md text-[#9ca0ab] hover:text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#9ca0ab] transition-colors"
                        >
                          <RotateCcw size={14} strokeWidth={2}/>
                        </button>
                        <button
                            onClick={() => undoTimer(number)}
                            disabled={!hasUndo}
                            title="Undo"
                            className="p-1.5 rounded-md text-[#9ca0ab] hover:text-[#5e6ad2] hover:bg-[#eef0fb] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#9ca0ab] transition-colors"
                        >
                          <Undo2 size={14} strokeWidth={2}/>
                        </button>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* Keyboard legend */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#8a8f98]">
            <span className="flex items-center gap-1.5">
              <Kbd>1</Kbd>–<Kbd>{visibleTimers === 10 ? '0' : visibleTimers}</Kbd> start / stop
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd><CornerDownLeft size={11} strokeWidth={2.2}/></Kbd> then number — reset
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd><Delete size={11} strokeWidth={2.2}/></Kbd> then number — undo
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd><CornerDownLeft size={11} strokeWidth={2.2}/></Kbd><Kbd><Delete size={11} strokeWidth={2.2}/></Kbd> reset all
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>⌘</Kbd><Kbd>+</Kbd> / <Kbd>⌘</Kbd><Kbd>–</Kbd> add / remove line
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>⌘</Kbd><Kbd>K</Kbd> presets
            </span>
          </div>
        </div>
      </div>
  );
};

const App = {MultipleTimers, Imagery};
export default App;
