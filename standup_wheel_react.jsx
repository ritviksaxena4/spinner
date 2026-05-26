import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, Shuffle, Trash2, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const COLORS = [
  '#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899',
  '#EF4444', '#14B8A6', '#3B82F6', '#A855F7', '#84CC16', '#F97316',
];

function clampIndex(n, max) {
  if (max <= 0) return 0;
  return ((n % max) + max) % max;
}

export default function StandupWheel() {
  const [input, setInput] = useState('');
  const [activeNames, setActiveNames] = useState([
    'Aarav', 'Priya', 'Rahul', 'Sneha', 'Karan', 'Neha'
  ]);
  const [completedNames, setCompletedNames] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [message, setMessage] = useState('Add your team names, then spin the wheel for today’s standup.');
  const [lastWinner, setLastWinner] = useState(null);
  const wheelRef = useRef(null);

  const segments = useMemo(() => activeNames.map((name, index) => ({
    name,
    color: COLORS[index % COLORS.length],
  })), [activeNames]);

  const canSpin = activeNames.length >= 2 && !spinning;

  useEffect(() => {
    if (activeNames.length === 0) {
      setSelectedName(null);
    }
    if (activeNames.length === 1) {
      setMessage(`Only one name left: ${activeNames[0]}.`);
    }
  }, [activeNames]);

  const addName = () => {
    const name = input.trim();
    if (!name) return;
    const exists = activeNames.some(n => n.toLowerCase() === name.toLowerCase()) ||
      completedNames.some(n => n.toLowerCase() === name.toLowerCase());
    if (exists) {
      setMessage(`${name} is already in the pool.`);
      return;
    }
    setActiveNames(prev => [...prev, name]);
    setInput('');
    setMessage(`${name} added to the wheel.`);
  };

  const removeName = (name) => {
    setActiveNames(prev => prev.filter(n => n !== name));
    setCompletedNames(prev => prev.filter(n => n !== name));
    setMessage(`${name} removed from the wheel.`);
  };

  const resetDay = () => {
    if (!lastWinner) {
      setMessage('Nothing to reset yet.');
      return;
    }
    setActiveNames(prev => [...prev, lastWinner].filter((v, i, a) => a.indexOf(v) === i));
    setCompletedNames(prev => prev.filter(n => n !== lastWinner));
    setLastWinner(null);
    setSelectedName(null);
    setMessage(`Restored ${lastWinner} back into the wheel.`);
  };

  const restoreAll = () => {
    setActiveNames(prev => [...prev, ...completedNames].filter((v, i, a) => a.indexOf(v) === i));
    setCompletedNames([]);
    setSelectedName(null);
    setLastWinner(null);
    setMessage('All names restored to the active wheel.');
  };

  const spinWheel = () => {
    if (!canSpin) {
      if (activeNames.length < 2) setMessage('Add at least 2 names to spin the wheel.');
      return;
    }

    setSpinning(true);
    const winnerIndex = Math.floor(Math.random() * activeNames.length);
    const sliceAngle = 360 / activeNames.length;
    const centerOffset = sliceAngle / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = 360 * spins + (360 - winnerIndex * sliceAngle - centerOffset);

    setRotation(prev => prev + finalRotation);

    window.setTimeout(() => {
      const winner = activeNames[winnerIndex];
      setSelectedName(winner);
      setLastWinner(winner);
      setActiveNames(prev => prev.filter(n => n !== winner));
      setCompletedNames(prev => [winner, ...prev]);
      setMessage(`Today's standup: ${winner}. Removed from the wheel.`);
      setSpinning(false);
    }, 4200);
  };

  const resetWheelRotation = () => {
    setRotation(0);
    setMessage('Wheel rotation reset.');
  };

  const wheelStyle = useMemo(() => {
    if (segments.length === 0) {
      return {
        background: 'radial-gradient(circle at center, #ffffff 0%, #f3f4f6 60%, #e5e7eb 100%)',
      };
    }
    const slice = 360 / segments.length;
    const parts = segments.map((seg, index) => {
      const start = index * slice;
      const end = (index + 1) * slice;
      return `${seg.color} ${start}deg ${end}deg`;
    });
    return {
      background: `conic-gradient(${parts.join(', ')})`,
    };
  }, [segments]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Standup Wheel</h1>
              <p className="mt-1 text-slate-600">
                Add your team members, spin the wheel, and automatically move the selected person out of today’s pool.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" /> Wheel
              </CardTitle>
              <CardDescription>
                The selected name will be removed from the active list after the spin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -top-2 z-20 h-0 w-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-slate-900" />
                  <motion.div
                    ref={wheelRef}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 4.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex h-80 w-80 items-center justify-center rounded-full border-8 border-white shadow-xl ring-1 ring-slate-200"
                    style={wheelStyle}
                  >
                    <div className="absolute inset-10 rounded-full bg-white/90 shadow-inner" />
                    <div className="absolute inset-0 rounded-full">
                      {segments.length > 0 && segments.map((seg, index) => {
                        const slice = 360 / segments.length;
                        const angle = index * slice;
                        return (
                          <div
                            key={seg.name}
                            className="absolute left-1/2 top-1/2 origin-bottom text-center"
                            style={{
                              transform: `translate(-50%, -100%) rotate(${angle + slice / 2}deg) translateY(-110px) rotate(${-angle - slice / 2}deg)`,
                              width: 120,
                            }}
                          >
                            <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                              {seg.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
                      <div className="text-center">
                        <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Today</div>
                        <div className="mt-1 text-sm font-semibold">
                          {selectedName ? selectedName : 'Spin'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={spinWheel} disabled={!canSpin} size="lg" className="rounded-2xl px-6">
                    <Shuffle className="mr-2 h-4 w-4" /> Spin the wheel
                  </Button>
                  <Button variant="outline" onClick={resetWheelRotation} className="rounded-2xl">
                    Reset rotation
                  </Button>
                  <Button variant="secondary" onClick={restoreAll} className="rounded-2xl">
                    <RotateCcw className="mr-2 h-4 w-4" /> Restore all
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {selectedName && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      Selected for standup
                    </div>
                    <div className="mt-1 text-2xl font-bold">{selectedName}</div>
                    <p className="mt-1 text-sm text-emerald-700">That name has been moved to today’s completed list.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Add names
                </CardTitle>
                <CardDescription>Type a name and add it to the active wheel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addName();
                    }}
                    placeholder="Enter team member name"
                    className="rounded-2xl"
                  />
                  <Button onClick={addName} className="rounded-2xl">
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Tip: Press Enter to add faster.</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Active pool ({activeNames.length})</CardTitle>
                <CardDescription>These people are still in the wheel for today.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {activeNames.length === 0 ? (
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
                      No active names left.
                    </div>
                  ) : (
                    activeNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium"
                      >
                        <span>{name}</span>
                        <button
                          onClick={() => removeName(name)}
                          className="rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                          aria-label={`Remove ${name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Completed today ({completedNames.length})</CardTitle>
                <CardDescription>Names removed after being selected.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {completedNames.length === 0 ? (
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
                      No one selected yet.
                    </div>
                  ) : (
                    completedNames.map((name) => (
                      <span key={name} className="rounded-full bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-800">
                        {name}
                      </span>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
