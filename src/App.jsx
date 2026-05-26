import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'standup-wheel-data-v1';

const defaultNames = ['Sandhya', 'Bharani', 'Vivek', 'Revathi', 'Sumit', 'Chanakyan' , 'Prasanna', 'SESHADRI', 'Kiran', 'Priya', 'Sunil', 'Jaya Sai' , 'Jyotika', 'Manwin', 'Ritvik', 'Pratik', 'Sheetal'];

const colors = [
  '#6366F1',
  '#8B5CF6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#EF4444',
  '#14B8A6',
  '#3B82F6',
  '#A855F7',
  '#84CC16',
  '#F97316',
];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        activeNames: defaultNames,
        completedNames: [],
        lastWinner: '',
      };
    }
    const parsed = JSON.parse(raw);
    return {
      activeNames: Array.isArray(parsed.activeNames) ? parsed.activeNames : defaultNames,
      completedNames: Array.isArray(parsed.completedNames) ? parsed.completedNames : [],
      lastWinner: typeof parsed.lastWinner === 'string' ? parsed.lastWinner : '',
    };
  } catch {
    return {
      activeNames: defaultNames,
      completedNames: [],
      lastWinner: '',
    };
  }
}

export default function App() {
  const saved = loadData();

  const [input, setInput] = useState('');
  const [activeNames, setActiveNames] = useState(saved.activeNames);
  const [completedNames, setCompletedNames] = useState(saved.completedNames);
  const [lastWinner, setLastWinner] = useState(saved.lastWinner);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [message, setMessage] = useState('Add team members, then spin the wheel.');

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeNames,
        completedNames,
        lastWinner,
      })
    );
  }, [activeNames, completedNames, lastWinner]);

  const wheelSegments = useMemo(() => activeNames.map((name, index) => ({
    name,
    color: colors[index % colors.length],
  })), [activeNames]);

  const wheelBackground = useMemo(() => {
    if (wheelSegments.length === 0) {
      return 'radial-gradient(circle at center, #ffffff 0%, #f3f4f6 70%, #e5e7eb 100%)';
    }

    const slice = 360 / wheelSegments.length;
    const parts = wheelSegments.map((segment, index) => {
      const start = index * slice;
      const end = (index + 1) * slice;
      return `${segment.color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${parts.join(', ')})`;
  }, [wheelSegments]);

  const addName = () => {
    const name = input.trim();
    if (!name) {
      setMessage('Please type a name first.');
      return;
    }

    const exists =
      activeNames.some((n) => n.toLowerCase() === name.toLowerCase()) ||
      completedNames.some((n) => n.toLowerCase() === name.toLowerCase());

    if (exists) {
      setMessage(`${name} is already in the list.`);
      return;
    }

    setActiveNames((prev) => [...prev, name]);
    setInput('');
    setMessage(`${name} added to the wheel.`);
  };

  const removeName = (name) => {
    setActiveNames((prev) => prev.filter((n) => n !== name));
    setCompletedNames((prev) => prev.filter((n) => n !== name));
    if (lastWinner === name) {
      setLastWinner('');
    }
    setMessage(`${name} removed.`);
  };

  const restoreAll = () => {
    const merged = [...activeNames, ...completedNames];
    const unique = [...new Set(merged)];
    setActiveNames(unique);
    setCompletedNames([]);
    setLastWinner('');
    setSelectedName('');
    setMessage('All names restored to the active wheel.');
  };

  const resetDay = () => {
    if (!lastWinner) {
      setMessage('No winner to restore yet.');
      return;
    }

    setActiveNames((prev) => {
      if (prev.includes(lastWinner)) return prev;
      return [...prev, lastWinner];
    });

    setCompletedNames((prev) => prev.filter((n) => n !== lastWinner));
    setSelectedName('');
    setMessage(`${lastWinner} restored back to the active list.`);
    setLastWinner('');
  };

  const spinWheel = () => {
    if (spinning) return;

    if (activeNames.length < 2) {
      setMessage('You need at least 2 names to spin the wheel.');
      return;
    }

    setSpinning(true);

    const winnerIndex = Math.floor(Math.random() * activeNames.length);
    const sliceAngle = 360 / activeNames.length;
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = 360 * spins + (360 - winnerIndex * sliceAngle - sliceAngle / 2);

    setRotation((prev) => prev + finalRotation);

    window.setTimeout(() => {
      const winner = activeNames[winnerIndex];
      setSelectedName(winner);
      setLastWinner(winner);
      setActiveNames((prev) => prev.filter((n) => n !== winner));
      setCompletedNames((prev) => [winner, ...prev]);
      setMessage(`Today's standup: ${winner}`);
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className="app-shell">
      <div className="container">
        <header className="hero">
          <div>
            <h1>Standup Wheel</h1>
            <p>
              Add names, spin the wheel, and automatically remove the person who did today’s standup.
            </p>
          </div>
          <div className="status-box">{message}</div>
        </header>

        <main className="grid">
          <section className="card wheel-card">
            <h2>Wheel</h2>

            <div className="wheel-wrap">
              <div className="pointer"></div>

              <div
                className="wheel"
                style={{
                  background: wheelBackground,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                }}
              >
                {wheelSegments.length > 0 &&
                  wheelSegments.map((segment, index) => {
                    const slice = 360 / wheelSegments.length;
                    const angle = index * slice;

                    return (
                      <div
                        key={segment.name}
                        className="segment-label"
                        style={{
                          transform: `translate(-50%, -100%) rotate(${angle + slice / 2}deg) translateY(-112px) rotate(${-angle - slice / 2}deg)`,
                        }}
                      >
                        <span>{segment.name}</span>
                      </div>
                    );
                  })}

                <div className="wheel-center">
                  <div className="wheel-center-small">Today</div>
                  <div className="wheel-center-name">{selectedName || 'Spin'}</div>
                </div>
              </div>
            </div>

            <div className="button-row">
              <button className="primary" onClick={spinWheel} disabled={spinning}>
                Spin the wheel
              </button>
              <button className="secondary" onClick={restoreAll}>
                Restore all
              </button>
              <button className="secondary" onClick={resetDay}>
                Restore last winner
              </button>
            </div>

            {selectedName && (
              <div className="winner-box">
                <strong>Selected:</strong> {selectedName}
              </div>
            )}
          </section>

          <section className="side-column">
            <div className="card">
              <h2>Add names</h2>
              <div className="input-row">
                <input
                  type="text"
                  placeholder="Enter team member name"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addName();
                  }}
                />
                <button className="primary" onClick={addName}>
                  Add
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Active pool ({activeNames.length})</h2>
              <div className="chips">
                {activeNames.length === 0 ? (
                  <span className="muted">No active names left.</span>
                ) : (
                  activeNames.map((name) => (
                    <span key={name} className="chip">
                      {name}
                      <button onClick={() => removeName(name)} aria-label={`Remove ${name}`}>
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <h2>Completed today ({completedNames.length})</h2>
              <div className="chips">
                {completedNames.length === 0 ? (
                  <span className="muted">No one selected yet.</span>
                ) : (
                  completedNames.map((name) => (
                    <span key={name} className="chip completed">
                      {name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
