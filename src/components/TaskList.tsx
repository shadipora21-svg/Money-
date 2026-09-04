import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Zap,
  Layers,
  Calculator,
  ClipboardCheck,
  Smartphone,
  Disc,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { TaskItem, TaskCategory } from '../types';
import { sounds } from '../utils/audio';

interface TaskListProps {
  tasks: TaskItem[];
  onStartTask: (task: TaskItem) => void;
}

const CATEGORY_TABS: { id: TaskCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Tasks', icon: '⚡' },
  { id: 'game', label: 'Mini Games', icon: '🎮' },
  { id: 'daily', label: 'Daily Free', icon: '🎁' },
  { id: 'survey', label: 'Surveys', icon: '📋' },
  { id: 'testing', label: 'App Testing', icon: '📱' },
];

export const TaskList: React.FC<TaskListProps> = ({ tasks, onStartTask }) => {
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('all');

  const filteredTasks = tasks.filter((task) => {
    if (activeCategory === 'all') return true;
    return task.category === activeCategory;
  });

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Disc':
        return <Disc className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-rose-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-teal-400" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-5 h-5 text-blue-400" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-purple-400" />;
      default:
        return <Gamepad2 className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playTap();
                  setActiveCategory(tab.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>{filteredTasks.length} Tasks available</span>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-200 flex flex-col justify-between group hover:shadow-2xl"
          >
            <div>
              {/* Card Header Row */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                    {renderIcon(task.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">
                        {task.title}
                      </h4>
                      {task.badge && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {task.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {task.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center gap-2 my-3">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{task.timeEstimate}</span>
                </div>

                <div className="text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                  {task.difficulty}
                </div>

                <div className="text-[11px] text-slate-400 ml-auto">
                  Plays: {task.playsToday} / {task.maxPlaysPerDay}
                </div>
              </div>
            </div>

            {/* Bottom Reward Row & Start Action */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-1.5">
                <div className="flex items-center gap-1 text-amber-300 font-black text-sm sm:text-base">
                  <span>🪙</span>
                  <span>+{task.rewardCoins}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  (+${task.rewardCash.toFixed(2)})
                </span>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  onStartTask(task);
                }}
                className="py-2 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1 transition active:scale-95 group-hover:shadow-amber-500/30"
              >
                <span>{task.category === 'game' || task.category === 'daily' ? 'Play Game' : 'Start Task'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
