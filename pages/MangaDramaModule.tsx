
import React, { useState, useRef } from 'react';
import { 
  Tv, 
  Sparkles, 
  FileText, 
  User, 
  Download, 
  History, 
  Info, 
  Loader2, 
  ImageIcon,
  Video,
  MonitorPlay,
  ClipboardCheck,
  Play,
  Send,
  Edit3
} from 'lucide-react';
import { NavId } from '../types';
import { NAV_ITEMS } from '../constants';

// 模拟后端生成的数据结构
interface GeneratedContent {
  characterSettings: string;
  script: string;
  threeViews: string[];
  storyboardPrompts: string[];
  storyboards: string[];
  videoClips: string[];
  finalFilm: string;
}

interface MangaDramaModuleProps {
  onNavigate?: (id: NavId, data?: any) => void;
}

export const MangaDramaModule: React.FC<MangaDramaModuleProps> = ({ onNavigate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  
  const moduleInfo = NAV_ITEMS.find(item => item.id === NavId.MANGA_DRAMA)!;

  const handleSendInspiration = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsGenerating(true);

    window.dispatchEvent(new CustomEvent('add-task', {
      detail: { name: '全流程AI生成任务', module: NavId.MANGA_DRAMA }
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockResult: GeneratedContent = {
        characterSettings: "男主角：林诺，25岁，沉默寡言的黑客。女主角：苏瑶，23岁，身手矫健的私家侦探。",
        script: "第一幕：雨夜。林诺在黑暗的房间内敲击键盘，屏幕蓝光照在他苍白的脸上。突然，苏瑶破窗而入...",
        threeViews: ["https://picsum.photos/600/400?random=1", "https://picsum.photos/600/400?random=2"],
        storyboardPrompts: [
          "中景，雨夜霓虹灯映射下的窗台",
          "特写，快速敲击键盘的双手",
          "全景，苏瑶破窗而入的瞬间",
          "近景，两人对峙的紧张神情",
          "特写，林诺惊讶的眼神",
          "中景，苏瑶稳稳落地的姿态"
        ],
        storyboards: [
          "https://picsum.photos/400/225?random=11",
          "https://picsum.photos/400/225?random=12",
          "https://picsum.photos/400/225?random=13",
          "https://picsum.photos/400/225?random=14",
          "https://picsum.photos/400/225?random=15",
          "https://picsum.photos/400/225?random=16"
        ],
        videoClips: [
          "https://picsum.photos/640/360?random=21",
          "https://picsum.photos/640/360?random=22",
          "https://picsum.photos/640/360?random=23",
          "https://picsum.photos/640/360?random=24"
        ],
        finalFilm: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80"
      };

      setContent(mockResult);
      setHasData(true);
      setMessages(prev => [...prev, { role: 'ai', text: '已根据您的灵感生成全套动态剧素材，请查看右侧区域。' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoToEdit = () => {
    if (onNavigate && content) {
      // 传递生成的全套数据
      onNavigate(NavId.AUTO_EDIT, {
        videoClips: content.videoClips,
        script: content.script,
        finalFilm: content.finalFilm
      });
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in text-slate-800">
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">一键生成 (One-click Gen)</h1>
          </div>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Info className="w-4 h-4" />
            {moduleInfo.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-white transition-all border border-transparent hover:border-slate-200">
            <History className="w-4 h-4" /> 历史记录
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden pb-4">
        {/* 左侧：灵感输入区域 */}
        <div className="w-[320px] flex flex-col gap-4 shrink-0">
          <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-sm flex flex-col overflow-hidden">
             <div className="p-4 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">灵感对话记录</div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-300 italic text-xs text-center px-4">
                    在此下方输入您的剧本灵感或故事大纲，AI将为您生成完整动态剧...
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-emerald-500" /> 正在编织您的灵感...
                    </div>
                  </div>
                )}
             </div>
          </div>
          <div className="bg-white rounded-[24px] border border-white shadow-lg p-4 flex flex-col gap-3">
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendInspiration(); } }}
              placeholder="输入灵感，开启创作……"
              className="w-full h-24 bg-slate-50 border-none rounded-xl p-3 text-sm outline-none resize-none placeholder:text-slate-300 font-medium focus:ring-2 focus:ring-emerald-100 transition-all"
            />
            <button 
              onClick={handleSendInspiration}
              disabled={isGenerating || !inputValue.trim()}
              className="h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={14} /> 发送灵感
            </button>
          </div>
        </div>

        {/* 右侧：生成结果展示区 */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar rounded-[32px]">
            {/* 1. 人物设定 */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={16} className="text-emerald-500" /> 人物设定
              </h3>
              <div className="min-h-[40px] text-sm text-slate-500 leading-relaxed font-medium">
                {hasData ? content?.characterSettings : isGenerating ? null : <span className="opacity-10 italic">等待生成...</span>}
              </div>
            </section>

            {/* 2. 剧本 */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-emerald-500" /> 剧本
              </h3>
              <div className="min-h-[40px] text-sm text-slate-500 leading-relaxed font-medium">
                {hasData ? content?.script : isGenerating ? null : <span className="opacity-10 italic">等待生成...</span>}
              </div>
            </section>

            {/* 3. 人物三视图 */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-500" /> 人物三视图
              </h3>
              {hasData ? (
                <div className="grid grid-cols-2 gap-4">
                  {content?.threeViews.map((url, i) => (
                    <div key={i} className="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : !isGenerating && <div className="h-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />}
            </section>

            {/* 4. 分镜提示词 */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-emerald-500" /> 分镜提示词
              </h3>
              {hasData ? (
                <div className="grid grid-cols-2 gap-3">
                  {content?.storyboardPrompts.map((text, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100 font-medium">
                      {text}
                    </div>
                  ))}
                </div>
              ) : !isGenerating && <div className="h-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />}
            </section>

            {/* 5. 分镜生成 */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" /> 分镜生成
              </h3>
              {hasData ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {content?.storyboards.map((url, i) => (
                    <div key={i} className="aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : !isGenerating && <div className="h-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />}
            </section>

            {/* 6. AI生成视频片段 */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Video size={16} className="text-emerald-500" /> AI 生成视频片段
              </h3>
              {hasData ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {content?.videoClips.map((url, i) => (
                    <div key={i} className="aspect-video bg-slate-900 rounded-xl overflow-hidden group relative shadow-lg">
                      <img src={url} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Play size={24} className="text-white fill-white cursor-pointer hover:scale-110" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isGenerating && <div className="h-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />}
            </section>

            {/* 7. AI剪辑成片 */}
            <section className="bg-white/90 backdrop-blur-xl rounded-[24px] border border-white shadow-sm p-6 pb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MonitorPlay size={18} className="text-emerald-500" /> AI 剪辑成片
                </h3>
                {hasData && (
                  <button 
                    onClick={handleGoToEdit}
                    className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
                  >
                    <Edit3 size={14} /> 视频编辑
                  </button>
                )}
              </div>
              <div className="max-w-2xl mx-auto aspect-video bg-slate-900 rounded-[32px] overflow-hidden relative shadow-2xl border-[6px] border-white">
                {hasData ? (
                  <>
                    <img src={content?.finalFilm} className="w-full h-full object-cover opacity-80 animate-fade-in" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <button className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95">
                          <Play size={36} className="text-white fill-white ml-1.5" />
                       </button>
                       <p className="mt-4 text-white text-[10px] font-bold tracking-[0.4em] uppercase opacity-60">Ready to Play</p>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700">
                    <MonitorPlay size={64} className="opacity-10 mb-4" />
                    <span className="text-[10px] font-bold opacity-10 uppercase tracking-[0.4em]">Waiting for AI Rendering</span>
                  </div>
                )}
              </div>
            </section>
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
