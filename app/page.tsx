'use client';

import { useState, useEffect } from 'react';

type TaskStatus = 'not_started' | 'in_progress' | 'finished';

interface DailyTask {
  id: string;
  task: string;
  status: TaskStatus;
}

interface DailyLog {
  date: string;
  tasks: DailyTask[];
  timeSpent: { hours: number; minutes: number };
  notes: string;
}

interface WeeklyMilestone {
  id: string;
  task: string;
  done: boolean;
  week: string;
}

interface SprintMilestone {
  id: string;
  task: string;
  done: boolean;
}

interface SprintData {
  sprintConfig: {
    startDate: string;
    endDate: string;
    name: string;
  };
  dailyLogs: DailyLog[];
  weeklyMilestones: WeeklyMilestone[];
  sprintMilestones: SprintMilestone[];
  todaysWins: { date: string; wins: string[] }[];
}

const initialData: SprintData = {
  sprintConfig: {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    name: 'My Sprint'
  },
  dailyLogs: [],
  weeklyMilestones: [],
  sprintMilestones: [],
  todaysWins: []
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)}`;
};

export default function SprintDashboard() {
  const [data, setData] = useState<SprintData>(initialData);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newWinInput, setNewWinInput] = useState('');
  const [newWeeklyMilestone, setNewWeeklyMilestone] = useState('');
  const [newSprintMilestone, setNewSprintMilestone] = useState('');
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timeSaved, setTimeSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const today = new Date().toISOString().split('T')[0];
  const currentWeek = getWeekNumber(new Date());
  const isToday = selectedDate === today;
  const isPastDate = selectedDate < today;

  useEffect(() => {
    const saved = localStorage.getItem('sprintDashboard');
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sprintDashboard', JSON.stringify(data));
  }, [data]);

  // Load selected date's time data
  useEffect(() => {
    const selectedLog = data.dailyLogs.find(log => log.date === selectedDate);
    if (selectedLog) {
      setSelectedHours(selectedLog.timeSpent.hours);
      setSelectedMinutes(selectedLog.timeSpent.minutes);
    } else {
      setSelectedHours(0);
      setSelectedMinutes(0);
    }
  }, [data.dailyLogs, selectedDate]);

  const startDate = new Date(data.sprintConfig.startDate);
  const endDate = new Date(data.sprintConfig.endDate);
  const todayDate = new Date();
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.ceil((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const progressPercent = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  // Get data for selected date
  const selectedLog = data.dailyLogs.find(log => log.date === selectedDate);
  const selectedTasks = selectedLog?.tasks || [];
  const selectedWins = data.todaysWins.find(w => w.date === selectedDate)?.wins || [];
  const thisWeekMilestones = data.weeklyMilestones.filter(m => m.week === currentWeek);

  // Calculate total time this week
  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() - todayDate.getDay());
  const weekLogs = data.dailyLogs.filter(log => new Date(log.date) >= weekStart);
  const weekTotalMinutes = weekLogs.reduce((acc, log) => acc + log.timeSpent.hours * 60 + log.timeSpent.minutes, 0);
  const weekHours = Math.floor(weekTotalMinutes / 60);
  const weekMins = weekTotalMinutes % 60;

  // Get days with logged data (for calendar indicator)
  const daysWithData = new Set(data.dailyLogs.map(log => log.date));

  const addTask = () => {
    if (!newTaskInput.trim() || !isToday) return;
    const newTask: DailyTask = { id: generateId(), task: newTaskInput.trim(), status: 'not_started' };
    const existingLog = data.dailyLogs.find(log => log.date === selectedDate);
    
    if (existingLog) {
      setData({
        ...data,
        dailyLogs: data.dailyLogs.map(log =>
          log.date === selectedDate ? { ...log, tasks: [...log.tasks, newTask] } : log
        )
      });
    } else {
      setData({
        ...data,
        dailyLogs: [...data.dailyLogs, { date: selectedDate, tasks: [newTask], timeSpent: { hours: 0, minutes: 0 }, notes: '' }]
      });
    }
    setNewTaskInput('');
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (!isToday) return;
    setData({
      ...data,
      dailyLogs: data.dailyLogs.map(log =>
        log.date === selectedDate
          ? { ...log, tasks: log.tasks.map(task => task.id === taskId ? { ...task, status } : task) }
          : log
      )
    });
  };

  const removeTask = (taskId: string) => {
    if (!isToday) return;
    setData({
      ...data,
      dailyLogs: data.dailyLogs.map(log =>
        log.date === selectedDate ? { ...log, tasks: log.tasks.filter(task => task.id !== taskId) } : log
      )
    });
  };

  const saveTime = () => {
    if (!isToday) return;
    const existingLog = data.dailyLogs.find(log => log.date === selectedDate);
    if (existingLog) {
      setData({
        ...data,
        dailyLogs: data.dailyLogs.map(log =>
          log.date === selectedDate ? { ...log, timeSpent: { hours: selectedHours, minutes: selectedMinutes } } : log
        )
      });
    } else {
      setData({
        ...data,
        dailyLogs: [...data.dailyLogs, { date: selectedDate, tasks: [], timeSpent: { hours: selectedHours, minutes: selectedMinutes }, notes: '' }]
      });
    }
    setTimeSaved(true);
    setTimeout(() => setTimeSaved(false), 2000);
  };

  const addWin = () => {
    if (!newWinInput.trim() || !isToday) return;
    const updated = data.todaysWins.filter(w => w.date !== selectedDate);
    updated.push({ date: selectedDate, wins: [...selectedWins, newWinInput.trim()] });
    setData({ ...data, todaysWins: updated });
    setNewWinInput('');
  };

  const addWeeklyMilestone = () => {
    if (!newWeeklyMilestone.trim()) return;
    setData({
      ...data,
      weeklyMilestones: [...data.weeklyMilestones, { id: generateId(), task: newWeeklyMilestone.trim(), done: false, week: currentWeek }]
    });
    setNewWeeklyMilestone('');
  };

  const addSprintMilestone = () => {
    if (!newSprintMilestone.trim()) return;
    setData({
      ...data,
      sprintMilestones: [...data.sprintMilestones, { id: generateId(), task: newSprintMilestone.trim(), done: false }]
    });
    setNewSprintMilestone('');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sprint-dashboard-${today}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setData(imported);
      } catch { alert('Error importing data'); }
    };
    reader.readAsText(file);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatDateLong = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const goToToday = () => setSelectedDate(today);
  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev.toISOString().split('T')[0]);
  };
  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next.toISOString().split('T')[0] <= today) {
      setSelectedDate(next.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="h-screen bg-sage-50 p-4 overflow-hidden">
      <div className="max-w-6xl mx-auto h-full flex flex-col gap-4">
        
        {/* Header */}
        <header className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{data.sprintConfig.name}</h1>
              <p className="text-ink/50 text-xs">The Life of Piet</p>
            </div>
            <button onClick={() => setShowSettings(true)} className="text-ink/40 hover:text-ink transition-colors text-sm">
              ⚙ Settings
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={exportData} className="btn-secondary text-xs py-1.5 px-3">Export</button>
            <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </header>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
            <div className="card p-6 w-96 bg-white" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4">Sprint Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-ink/60 mb-1">Sprint Name</label>
                  <input
                    type="text"
                    value={data.sprintConfig.name}
                    onChange={(e) => setData({ ...data, sprintConfig: { ...data.sprintConfig, name: e.target.value } })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-ink/60 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={data.sprintConfig.startDate}
                      onChange={(e) => setData({ ...data, sprintConfig: { ...data.sprintConfig, startDate: e.target.value } })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink/60 mb-1">End Date</label>
                    <input
                      type="date"
                      value={data.sprintConfig.endDate}
                      onChange={(e) => setData({ ...data, sprintConfig: { ...data.sprintConfig, endDate: e.target.value } })}
                      className="input-field"
                    />
                  </div>
                </div>
                <button onClick={() => setShowSettings(false)} className="btn-primary w-full">Save & Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid - fits in viewport */}
        <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
          
          {/* Left Column - Sprint Progress + Time */}
          <div className="flex flex-col gap-4">
            {/* Sprint Progress */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-ink/50 uppercase tracking-wide">Progress</p>
                <p className="text-2xl font-bold">{daysRemaining}d</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-ink/10" />
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none"
                      strokeDasharray={`${progressPercent * 1.51} 151`} strokeLinecap="round" className="text-ink" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">{progressPercent}%</span>
                  </div>
                </div>
                <div className="text-xs text-ink/60">
                  <p>Day {daysElapsed} of {totalDays}</p>
                  <p className="text-ink/40">{formatDate(data.sprintConfig.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Time Tracker */}
            <div className="card p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-ink/50 uppercase tracking-wide">
                  {isToday ? "Today's Time" : "Time Logged"}
                </p>
                {timeSaved && <span className="text-xs text-emerald-600">✓ Saved</span>}
              </div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <input
                    type="number" min="0" max="24" value={selectedHours}
                    onChange={(e) => setSelectedHours(parseInt(e.target.value) || 0)}
                    disabled={!isToday}
                    className={`input-field text-center text-xl font-bold py-2 ${!isToday ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  <p className="text-xs text-ink/40 text-center mt-1">hrs</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number" min="0" max="59" step="5" value={selectedMinutes}
                    onChange={(e) => setSelectedMinutes(parseInt(e.target.value) || 0)}
                    disabled={!isToday}
                    className={`input-field text-center text-xl font-bold py-2 ${!isToday ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  <p className="text-xs text-ink/40 text-center mt-1">min</p>
                </div>
              </div>
              {isToday && (
                <button onClick={saveTime} className="btn-primary w-full text-xs py-2">Save Time</button>
              )}
              
              {/* Week Summary */}
              <div className="mt-3 pt-3 border-t border-ink/10">
                <p className="text-xs text-ink/40 mb-1">This Week</p>
                <p className="text-lg font-bold">{weekHours}h {weekMins}m</p>
              </div>
            </div>
          </div>

          {/* Middle Column - Tasks (spans 2 cols) */}
          <div className="col-span-2 card p-4 flex flex-col min-h-0">
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={goToPrevDay} className="p-1 hover:bg-ink/10 rounded transition-colors text-ink/60 hover:text-ink">
                  ←
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field py-1 px-2 text-sm w-36"
                  />
                  {!isToday && (
                    <button onClick={goToToday} className="text-xs text-ink/50 hover:text-ink underline">
                      Today
                    </button>
                  )}
                </div>
                <button 
                  onClick={goToNextDay} 
                  disabled={selectedDate >= today}
                  className={`p-1 hover:bg-ink/10 rounded transition-colors ${selectedDate >= today ? 'text-ink/20 cursor-not-allowed' : 'text-ink/60 hover:text-ink'}`}
                >
                  →
                </button>
              </div>
              <div className="flex items-center gap-2">
                {isPastDate && (
                  <span className="text-xs bg-ink/10 text-ink/60 px-2 py-1 rounded-full">View Only</span>
                )}
                {isToday && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Today</span>
                )}
                <p className="text-xs text-ink/50">{selectedTasks.filter(t => t.status === 'finished').length}/{selectedTasks.length}</p>
              </div>
            </div>

            <h2 className="font-bold text-sm mb-1 flex-shrink-0">{formatDateLong(selectedDate)}</h2>

            {/* Add Task - only for today */}
            {isToday && (
              <div className="flex gap-2 mb-3 flex-shrink-0">
                <input
                  type="text" value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="input-field flex-1 py-2 text-sm"
                  placeholder="What needs to be done today?"
                />
                <button onClick={addTask} className="btn-primary text-sm px-4">+ Add</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {selectedTasks.length === 0 ? (
                <p className="text-ink/30 text-sm italic text-center py-4">
                  {isToday ? 'No tasks yet' : 'No tasks logged for this day'}
                </p>
              ) : (
                selectedTasks.map((task) => (
                  <div key={task.id} className={`card-inner p-3 flex items-center gap-3 ${!isToday ? 'opacity-80' : ''}`}>
                    <p className={`flex-1 text-sm ${task.status === 'finished' ? 'line-through text-ink/40' : ''}`}>{task.task}</p>
                    <div className="flex gap-1">
                      {(['not_started', 'in_progress', 'finished'] as TaskStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateTaskStatus(task.id, status)}
                          disabled={!isToday}
                          className={`px-2 py-1 text-[10px] rounded-full border transition-all ${
                            task.status === status ? 'bg-ink text-sage-50 border-ink' : 'border-ink/20'
                          } ${!isToday ? 'cursor-default' : 'hover:border-ink/50'}`}
                        >
                          {status === 'not_started' ? 'Not Started' : status === 'in_progress' ? 'In Progress' : 'Finished'}
                        </button>
                      ))}
                      {isToday && (
                        <button onClick={() => removeTask(task.id)} className="px-1 text-ink/30 hover:text-red-500 text-xs">✕</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Wins */}
          <div className="card p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="font-bold">Wins</h2>
              {!isToday && selectedWins.length > 0 && (
                <span className="text-xs text-ink/40">{selectedWins.length}</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 mb-3">
              {selectedWins.length === 0 ? (
                <p className="text-ink/30 text-sm italic">
                  {isToday ? 'No wins yet' : 'No wins logged'}
                </p>
              ) : (
                selectedWins.map((win, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500">✓</span>
                    <p>{win}</p>
                  </div>
                ))
              )}
            </div>
            {isToday && (
              <div className="flex gap-2 flex-shrink-0">
                <input
                  type="text" value={newWinInput}
                  onChange={(e) => setNewWinInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWin()}
                  className="input-field flex-1 py-2 text-sm"
                  placeholder="Add a win..."
                />
                <button onClick={addWin} className="btn-primary text-sm px-3">Add</button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row - Milestones */}
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          {/* Weekly Milestones */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-sm">Weekly Milestones</h2>
                <p className="text-xs text-ink/40">{currentWeek}</p>
              </div>
              <p className="text-xs text-ink/50">{thisWeekMilestones.filter(m => m.done).length}/{thisWeekMilestones.length}</p>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={newWeeklyMilestone}
                onChange={(e) => setNewWeeklyMilestone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWeeklyMilestone()}
                className="input-field flex-1 py-1.5 text-sm"
                placeholder="Add milestone..."
              />
              <button onClick={addWeeklyMilestone} className="btn-primary text-xs px-3">Add</button>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {thisWeekMilestones.map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <div
                    onClick={() => setData({ ...data, weeklyMilestones: data.weeklyMilestones.map(x => x.id === m.id ? { ...x, done: !x.done } : x) })}
                    className={`w-4 h-4 rounded border-2 border-ink flex items-center justify-center ${m.done ? 'bg-ink' : ''}`}
                  >
                    {m.done && <span className="text-sage-50 text-[10px]">✓</span>}
                  </div>
                  <span className={m.done ? 'line-through text-ink/40' : ''}>{m.task}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sprint Milestones */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm">Sprint Milestones</h2>
              <p className="text-xs text-ink/50">{data.sprintMilestones.filter(m => m.done).length}/{data.sprintMilestones.length}</p>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={newSprintMilestone}
                onChange={(e) => setNewSprintMilestone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSprintMilestone()}
                className="input-field flex-1 py-1.5 text-sm"
                placeholder="Add milestone..."
              />
              <button onClick={addSprintMilestone} className="btn-primary text-xs px-3">Add</button>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {data.sprintMilestones.map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <div
                    onClick={() => setData({ ...data, sprintMilestones: data.sprintMilestones.map(x => x.id === m.id ? { ...x, done: !x.done } : x) })}
                    className={`w-4 h-4 rounded border-2 border-ink flex items-center justify-center ${m.done ? 'bg-ink' : ''}`}
                  >
                    {m.done && <span className="text-sage-50 text-[10px]">✓</span>}
                  </div>
                  <span className={m.done ? 'line-through text-ink/40' : ''}>{m.task}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
