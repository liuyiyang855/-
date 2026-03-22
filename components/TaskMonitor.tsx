
import React, { useEffect, useState } from 'react';
import { NavId, TaskStatus } from '../types';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const TaskMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<TaskStatus[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Listen for custom task events
  useEffect(() => {
    const handleAddTask = (e: any) => {
      const { name, module } = e.detail;
      const newTask: TaskStatus = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        module: module as NavId,
        progress: 0,
        status: 'processing'
      };
      setTasks(prev => [newTask, ...prev]);
      // 当有新任务时，确保监控器是可见的
      setIsVisible(true);
    };

    window.addEventListener('add-task', handleAddTask);
    return () => window.removeEventListener('add-task', handleAddTask);
  }, []);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(t => {
        if (t.status === 'processing') {
          const newProgress = Math.min(100, t.progress + Math.random() * 5);
          return {
            ...t,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'processing'
          };
        }
        return t;
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // 如果没有任务或者被手动关闭，则不渲染
  if (tasks.length === 0 || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl overflow-hidden z-50 animate-fade-in-up">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">实时任务追踪 (Live)</h3>
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-slate-200/50 rounded-md transition-colors text-slate-400 hover:text-slate-600"
          title="关闭监控器"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
        {tasks.map(task => (
          <div key={task.id} className="group animate-fade-in">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{task.name}</span>
              <div className="flex items-center gap-2">
                {task.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                {task.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <div 
                className={`h-full transition-all duration-700 ease-out rounded-full ${
                  task.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                  task.status === 'failed' ? 'bg-red-500' : 
                  'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between items-center">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.module}</span>
               <span className="text-[9px] font-bold text-slate-500">{Math.floor(task.progress)}%</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};
