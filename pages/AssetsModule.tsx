
import React, { useState, useRef } from 'react';
import { 
  User, 
  Clapperboard, 
  Shirt, 
  Image as ImageIcon, 
  Upload, 
  Settings, 
  RefreshCw, 
  Info, 
  History,
  Check,
  Zap,
  Loader2,
  Maximize2,
  Download,
  Layers,
  Box,
  FileText
} from 'lucide-react';
import { NavId } from '../types';
import { NAV_ITEMS } from '../constants';

type AssetTab = 'role' | 'scene' | 'dressing';

export const AssetsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssetTab>('role');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  
  const moduleInfo = NAV_ITEMS.find(item => item.id === NavId.ASSETS)!;
  const taskCounter = useRef(1);

  const getPreviewTitle = () => {
    switch(activeTab) {
      case 'role': return '角色预览';
      case 'scene': return '场景预览';
      case 'dressing': return '衣物预览';
      default: return '预览区';
    }
  };

  const handleGenerate = () => {
    const taskNum = taskCounter.current.toString().padStart(2, '0');
    taskCounter.current += 1;
    
    window.dispatchEvent(new CustomEvent('add-task', {
      detail: { name: `${getPreviewTitle()}生成 ${taskNum}`, module: NavId.ASSETS }
    }));

    setIsGenerating(true);
    setHasResult(false);

    // 模拟 AI 生成耗时
    setTimeout(() => {
      setIsGenerating(false);
      setHasResult(true);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in text-slate-800 pb-6">
      {/* 模块标题 */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-pink-500 rounded-full"></div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">资产 (Assets)</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent hover:border-slate-200">
            <History className="w-4 h-4" /> 资产历史记录
          </button>
        </div>
      </header>

      {/* 主布局：严格遵循原型图比例 */}
      <div className="flex-1 grid grid-cols-[220px_1fr_300px] gap-6 min-h-0">
        
        {/* 左侧：分类导航 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-50 text-center">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分类导航</span>
          </div>
          <div className="p-2 space-y-1">
            <button 
              onClick={() => {
                setActiveTab('role');
                setHasResult(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'role' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <User className="w-5 h-5" /> 角色
            </button>
            <button 
              onClick={() => {
                setActiveTab('scene');
                setHasResult(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'scene' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Clapperboard className="w-5 h-5" /> 场景素材
            </button>
            <button 
              onClick={() => {
                setActiveTab('dressing');
                setHasResult(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'dressing' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Shirt className="w-5 h-5" /> 更衣室
            </button>
          </div>
        </div>

        {/* 中间：预览主体 */}
        <div className="flex flex-col gap-2 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          {/* 大预览图 - 纵向长方形 (原型比例) */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-white shadow-sm flex flex-col min-h-[640px] shrink-0">
            <div className="h-14 flex items-center justify-center border-b border-slate-50">
              <h3 className="text-base font-bold text-slate-800 tracking-widest">{getPreviewTitle()}</h3>
            </div>
            <div className="flex-1 bg-slate-50/50 rounded-b-[32px] flex items-center justify-center relative overflow-hidden group">
               {isGenerating ? (
                 <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                    <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">智能资产生成中...</p>
                 </div>
               ) : hasResult ? (
                 <img 
                   src={activeTab === 'role' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&h=1200&q=80' : 
                        activeTab === 'scene' ? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&h=800&q=80' :
                        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&h=1200&q=80'} 
                   className="w-full h-full object-contain animate-fade-in"
                   alt="Preview"
                 />
               ) : (
                 <div className="flex flex-col items-center opacity-[0.05] scale-[1.5]">
                    {activeTab === 'role' ? <User size={120} /> : activeTab === 'scene' ? <Clapperboard size={120} /> : <Shirt size={120} />}
                    <p className="mt-4 font-bold uppercase tracking-[0.4em]">Waiting for Prompt</p>
                 </div>
               )}
            </div>
          </div>

          {/* 三视图输出 - 仅在非场景模式下显示 */}
          {activeTab !== 'scene' && (
            <div className="grid grid-cols-3 gap-4 shrink-0 mt-2 pb-4">
              {[
                { label: '正面视图 (Front)', key: 1 },
                { label: '侧面视图 (Side)', key: 2 },
                { label: '背面视图 (Back)', key: 3 }
              ].map((view) => (
                <div key={view.key} className="flex flex-col gap-2 animate-fade-in-up" style={{ animationDelay: `${view.key * 100}ms` }}>
                  <div className="aspect-square bg-white/80 backdrop-blur-xl rounded-[24px] border border-white shadow-sm flex items-center justify-center overflow-hidden p-2 group transition-all hover:border-pink-300">
                    <div className="w-full h-full bg-slate-50/50 rounded-[18px] border border-slate-100 flex items-center justify-center overflow-hidden">
                       {hasResult ? (
                         <img 
                           src={`https://picsum.photos/400/400?random=${activeTab === 'role' ? view.key + 100 : view.key + 200}`} 
                           className="w-full h-full object-cover animate-fade-in"
                           alt={view.label}
                         />
                       ) : (
                         <ImageIcon className="w-8 h-8 text-slate-200" />
                       )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{view.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：控制面板 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-sm p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="text-center pb-4 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-800">控制面板</h3>
          </div>

          {/* 脚本提示词 */}
          <div className="space-y-3">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <FileText size={14} className="text-pink-500" /> 脚本提示词
             </label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder={`输入${getPreviewTitle()}描述词...`}
               className="w-full h-32 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-pink-50 transition-all resize-none font-medium leading-relaxed"
             />
          </div>

          {/* 动作/表情控制 */}
          <div className="space-y-4">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">动作/表情控制</label>
             <button className="w-full h-12 bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-sm font-bold hover:bg-slate-50 hover:border-pink-300 transition-all group active:scale-95">
                <Upload size={16} className="group-hover:text-pink-500" /> 上传图片
             </button>
             <div className="aspect-[4/3] bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                <ImageIcon className="w-10 h-10 text-slate-200 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 select-none">参考图区</p>
                <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
             </div>
          </div>

          {/* 模型设置 */}
          <div className="space-y-3">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Settings size={14} className="text-pink-500" /> 模型设置
             </label>
             <div className="grid grid-cols-1 gap-2">
                <button className="h-10 bg-white rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:border-pink-500 hover:text-pink-600 transition-all text-left px-4 flex items-center justify-between">
                  LoopIn Asset-V3.0
                  <Box size={12} className="opacity-40" />
                </button>
             </div>
          </div>

          {/* 重新生成按钮 */}
          <div className="mt-auto pt-4">
             <button 
               onClick={handleGenerate}
               disabled={isGenerating}
               className={`w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                 isGenerating 
                 ? 'bg-slate-100 text-slate-400' 
                 : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'
               }`}
             >
               {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
               开始生成
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
