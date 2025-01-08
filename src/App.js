import React, {useState, useEffect, useRef} from 'react';



function Imagery ({image}) {
  return (
      <img src={image} className="w-full h-[40vh] object-cover object-[50%_37%]">
      </img>
  )
}

const MultipleTimers = () => {
  const [MAX_DURATION, setDuration] = useState(5);
  const inputRef = useRef(null)
  const MAX_TIMERS = 10;
  const TITLE = "Line Distribution Application";

  const [timers, setTimers] = useState({});
  const [timerLabels, setTimerLabels] = useState({});
  const [visibleTimers, setVisibleTimers] = useState(1);
  const [timerHistory, setTimerHistory] = useState({});
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
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



  useEffect(() => {
    const handleKeyPress = (e) => {
      if (document.activeElement === inputRef.current) return;
      const key = e.key;
      const timerNumber = key === '0' ? 10 : parseInt(key);

      if (timerNumber >= 1 && timerNumber <= visibleTimers) {
        toggleTimer(timerNumber);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [timers, visibleTimers]);

  useEffect(() => {
    const interval = setInterval(() => {
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
                  newTimers[key].elapsed + 0.01,
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

  const handleLabelChange = (number, value) => {
    saveToTimerHistory(number);
    setTimerLabels(prev => ({
      ...prev,
      [number]: value
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

  const { ranks, percentages } = calculateRanksAndPercentages();

  const [isVisible, setVisibility] = useState('visible');

  return (
      <div className="p-4 w-[90vw] mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isVisible === 'visible'
                ? 'Maximum Duration: ' + formatTime(MAX_DURATION)
                : TITLE
            }
          </h2>
          <div className="space-x-2">
            <button
                onClick={removeTimer}
                className={"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 " + isVisible}
                disabled={visibleTimers <= 1}
            >
              Remove Timer
            </button>
            <button
                onClick={addTimer}
                className={"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 " + isVisible}
                disabled={visibleTimers >= MAX_TIMERS}
            >
              Add Timer
            </button>
            <input type="text" ref={inputRef} defaultValue={MAX_DURATION} placeholder={"Enter max time duration"} className={isVisible + ' w-10 border-red-300'} onChange={(t)=>setDuration(t.target.value)}/>

            <button
                onClick={() => setVisibility(isVisible === 'visible' ? 'invisible' : 'visible')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isVisible === 'visible' ? 'Hide Utils' : 'Show Utils'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {Array.from({length: visibleTimers}, (_, i) => i + 1).map(number => {
            const timer = timers[number === 10 ? 10 : number];
            const displayNumber = number === 10 ? '0' : number;
            const hasUndo = (timerHistory[number]?.length || 0) > 1;
            const rank = ranks[number];
            const percentage = percentages[number];

            const TIMER_COLORS = [
              'bg-blue-500',    // Blue
              'bg-green-500',   // Green
              'bg-purple-500',  // Purple
              'bg-pink-500',    // Pink
              'bg-indigo-500',  // Indigo
              'bg-teal-500',    // Teal
              'bg-orange-500',  // Orange
              'bg-cyan-500',    // Cyan
              'bg-rose-500',    // Rose
              'bg-emerald-500', // Emerald
            ];

            return (
                <div key={number} className="flex items-center space-x-4">
                  <div className="w-40">
                    {displayNumber}:
                    <input
                        type="text"
                        value={timerLabels[number] || ''}
                        onChange={(e) => handleLabelChange(number, e.target.value)}
                        className="w-32 mx-1 px-1 border rounded"
                        placeholder="Label"
                    />
                  </div>

                  <div className="flex-1 h-6 bg-gray-200 rounded-2xl overflow-hidden">
                    <div
                        className={`h-full rounded-2xl ${timer?.isRunning ? TIMER_COLORS[number % TIMER_COLORS.length] : TIMER_COLORS[number % TIMER_COLORS.length]}`}
                        style={{
                          width: `${timer ? (timer.elapsed / MAX_DURATION) * 100 : 0}%`,
                          transition: timer?.isRunning ? 'none' : 'width 0.3s ease-in-out'
                        }}
                    />
                  </div>

                  <div className="w-24 text-right">
                    {timer ? formatTime(timer.elapsed) : '00:00:000'}
                  </div>

                  <div className="w-24 text-center font-bold">
                    {timer?.elapsed > 0 && (
                        <span className={`
        ${rank === 1 ? 'text-yellow-500' : ''}
        ${rank === 2 ? 'text-gray-500' : ''}
        ${rank === 3 ? 'text-orange-500' : ''}
      `}>
        #{rank} ({percentage}%)
      </span>
                    )}
                  </div>

                  <div className="space-x-2">
                    <button
                        onClick={() => resetTimer(number)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                        disabled={!timer || timer.elapsed === 0}
                    >
                      Reset
                    </button>

                    <button
                        onClick={() => undoTimer(number)}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                        disabled={!hasUndo}
                    >
                      Undo
                    </button>
                  </div>
                </div>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Press number keys (1-{visibleTimers === 10 ? '0' : visibleTimers}) to start/stop timers
        </div>
      </div>
  );
};
export default {MultipleTimers, Imagery};