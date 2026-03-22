
import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Zap, 
  Play, 
  Download, 
  Save, 
  FileUp, 
  Trash2, 
  Settings2,
  ChevronRight,
  Info,
  History,
  Loader2,
  Type
} from 'lucide-react';
import { NavId } from '../types';
import { NAV_ITEMS } from '../constants';

export const StoryboardModule: React.FC = () => {
  const [activeShot, setActiveShot] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const moduleInfo = NAV_ITEMS.find(item => item.id === NavId.STORYBOARD)!;

  const handleGenerate = () => {
    setIsGenerating(true);
    window.dispatchEvent(new CustomEvent('add-task', {
      detail: { name: '分镜序列批量生成', module: NavId.STORYBOARD }
    }));
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in text-slate-800 pb-6">
      {/* 模块标题与副标题 */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">分镜 (Storyboard)</h1>
          </div>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Info className="w-4 h-4" />
            {moduleInfo.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent hover:border-slate-200">
            <History className="w-4 h-4" /> 分镜库
          </button>
        </div>
      </header>

      {/* 主布局：严格遵循原型图比例 */}
      <div className="flex-1 grid grid-cols-[240px_1fr_300px] gap-6 min-h-0">
        
        {/* 左侧：分镜脚本区域 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-white shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-50">
             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
               <FileUp size={16} className="text-purple-500" /> 分镜脚本
             </h3>
          </div>
          
          <div className="p-4 flex gap-2">
            <input 
              type="text" 
              placeholder="导入脚本..." 
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-100"
            />
            <button className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">
              导入
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 bg-slate-50/50 border-y border-slate-50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">角色场景提示词</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`p-3 rounded-xl border transition-all cursor-pointer ${activeShot === i ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                  <div className="text-xs font-bold text-slate-800 mb-1">镜头{i}:</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed font-medium">人物1 (描述细节...)</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed font-medium">场景1 (光影/环境...)</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-50 grid grid-cols-2 gap-3">
            <button className="py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> 添加
            </button>
            <button 
              onClick={handleGenerate}
              className="py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
            >
              <Zap size={14} className="fill-current" /> 生成
            </button>
          </div>
        </div>

        {/* 中间：分镜序列网格 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-sm flex flex-col overflow-hidden">
          <div className="h-14 flex items-center justify-between px-6 border-b border-slate-50">
            <div className="w-8" /> {/* Placeholder for balance */}
            <h3 className="text-base font-bold text-slate-800 tracking-widest">分镜序列</h3>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-all active:scale-90">
              <Play size={20} fill="currentColor" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveShot(i)}
                  className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeShot === i ? 'border-purple-500 ring-4 ring-purple-50' : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                    <img 
                      src={`https://picsum.photos/400/225?random=${i + 50}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={`Shot ${i}`}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-black/40 backdrop-blur-sm">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">镜头 {i}</span>
                  </div>
                  {activeShot === i && (
                    <div className="absolute top-2 right-2 p-1 bg-purple-500 rounded-md text-white shadow-lg">
                      <Settings2 size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-sm p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="text-center pb-4 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800">控制面板</h3>
          </div>

          {/* 选中镜头预览 */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">镜头 {activeShot} 预览</span>
               <button className="text-purple-600 hover:underline text-[10px] font-bold">全屏</button>
             </div>
             <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl group relative">
                <img 
                  src={`https://picsum.photos/400/225?random=${activeShot + 50}`} 
                  className="w-full h-full object-cover" 
                  alt="Current Shot"
                />
                <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none" />
             </div>
          </div>

          {/* 提示词修改 */}
          <div className="space-y-3">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Type size={14} className="text-purple-500" /> 提示词修改
             </label>
             <textarea 
               placeholder="在此优化选中镜头的视觉描述..."
               className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium leading-relaxed outline-none focus:ring-4 focus:ring-purple-50 transition-all resize-none"
             />
          </div>

          {/* 参数设置 */}
          <div className="space-y-4">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Settings2 size={14} className="text-purple-500" /> 参数设置
             </label>
             <div className="space-y-5">
               {[
                 { label: '构图权重', val: 10 },
                 { label: '光影感', val: 7 },
                 { label: '色彩饱和', val: 5 },
                 { label: '细节度', val: 0 }
               ].map((param, idx) => (
                 <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>{param.label}</span>
                      <span>{param.val}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full relative">
                       <div 
                         className="absolute inset-y-0 left-0 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.3)]" 
                         style={{ width: `${param.val * 10}%` }}
                       />
                       <div 
                         className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-purple-500 rounded-full shadow-md cursor-pointer"
                         style={{ left: `calc(${param.val * 10}% - 6px)` }}
                       />
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* 保存镜头按钮 */}
          <div className="mt-auto pt-4">
             <button 
               className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-95 shadow-lg shadow-slate-900/10"
             >
               <Save size={18} />
               保存镜头
             </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};
