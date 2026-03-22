
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Scissors, 
  Plus, 
  Download, 
  Film, 
  Play, 
  Pause,
  Maximize2, 
  Layers, 
  Search, 
  Type, 
  Music,
  Smartphone,
  AlignLeft,
  MessageSquareText,
  Volume2,
  Sparkles
} from 'lucide-react';
import { NavId } from '../types';
import { NAV_ITEMS } from '../constants';

interface UploadedFile {
  id: string;
  file?: File;
  preview: string;
  name: string;
  type: 'video' | 'audio';
  duration: number; 
}

interface TimelineClip {
  id: string;
  assetId: string;
  trackIndex: number; // 0: subtitle, 1: video, 2: audio
  startTime: number; // 秒
  duration: number; // 秒
  name: string;
  color: string;
  preview?: string; 
}

interface AutoEditModuleProps {
  initialData?: {
    videoClips: string[];
    script: string;
    finalFilm: string;
  };
}

export const AutoEditModule: React.FC<AutoEditModuleProps> = ({ initialData }) => {
  const [uploadedVideos, setUploadedVideos] = useState<UploadedFile[]>([]);
  const [clips, setClips] = useState<TimelineClip[]>([]);
  
  const [playheadPos, setPlayheadPos] = useState(0); // 0-100%
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [zoom, setZoom] = useState(5.5); 
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0); 

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackRef = useRef<number | null>(null);
  
  const TOTAL_DURATION = 120; 
  const moduleInfo = NAV_ITEMS.find(item => item.id === NavId.AUTO_EDIT)!;
  const displayScale = 11 - zoom;

  // 1. 处理初始数据的自动导入
  useEffect(() => {
    if (initialData) {
      // 1.1 导入素材到资产库
      const newAssets: UploadedFile[] = initialData.videoClips.map((url, i) => ({
        id: `ai-asset-${i}`,
        preview: url,
        name: `AI片段_${i + 1}`,
        type: 'video',
        duration: 10 // 模拟每段10秒
      }));
      setUploadedVideos(newAssets);

      // 1.2 自动排布到时间轴
      let currentStartTime = 0;
      const newClips: TimelineClip[] = [];

      // 填充视频轨道 (Track 1)
      newAssets.forEach((asset, i) => {
        newClips.push({
          id: `ai-clip-${i}`,
          assetId: asset.id,
          trackIndex: 1,
          startTime: currentStartTime,
          duration: asset.duration,
          name: asset.name,
          color: 'bg-indigo-500',
          preview: asset.preview
        });
        currentStartTime += asset.duration;
      });

      // 填充字幕轨道 (Track 0)
      // 模拟将剧本拆分成段落填充
      if (initialData.script) {
        const scriptLines = initialData.script.split(/[。！]/).filter(s => s.trim().length > 0);
        scriptLines.slice(0, 4).forEach((line, i) => {
          newClips.push({
            id: `subtitle-${i}`,
            assetId: `sub-asset-${i}`,
            trackIndex: 0,
            startTime: i * 5,
            duration: 4,
            name: line.substring(0, 15) + "...",
            color: 'bg-blue-600/80',
          });
        });
      }

      setClips(newClips);
      setPlayheadPos(0); // 重置播放头
    }
  }, [initialData]);

  const currentTime = useMemo(() => (playheadPos / 100) * TOTAL_DURATION, [playheadPos]);

  const activeClip = useMemo(() => {
    return clips.find(c => 
      c.trackIndex === 1 && 
      currentTime >= c.startTime && 
      currentTime <= (c.startTime + c.duration)
    );
  }, [clips, currentTime]);

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now();
      const startPos = playheadPos;
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newPos = startPos + (elapsed / TOTAL_DURATION) * 100;
        
        if (newPos >= 100) {
          setPlayheadPos(100);
          setIsPlaying(false);
        } else {
          setPlayheadPos(newPos);
          playbackRef.current = requestAnimationFrame(animate);
        }
      };
      
      playbackRef.current = requestAnimationFrame(animate);
    } else if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
    }

    return () => {
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    };
  }, [isPlaying, playheadPos]);

  const togglePlayback = () => {
    if (playheadPos >= 100) setPlayheadPos(0);
    setIsPlaying(!isPlaying);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).slice(0, 10).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      preview: `https://picsum.photos/800/450?random=${Math.random()}`,
      name: file.name,
      type: file.type.includes('audio') ? 'audio' : 'video',
      duration: 8 + Math.random() * 12 
    }));

    setUploadedVideos(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getTimeFromX = useCallback((clientX: number) => {
    if (!timelineContentRef.current) return 0;
    const rect = timelineContentRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return (x / rect.width) * TOTAL_DURATION;
  }, []);

  const updatePlayhead = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!timelineContentRef.current) return;
    const time = getTimeFromX(e.clientX);
    const percentage = Math.max(0, Math.min(100, (time / TOTAL_DURATION) * 100));
    setPlayheadPos(percentage);
  }, [getTimeFromX]);

  const onDragStartAsset = (e: React.DragEvent, asset: UploadedFile) => {
    e.dataTransfer.setData('asset', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropOnTimeline = (e: React.DragEvent, trackIndex: number) => {
    e.preventDefault();
    const assetData = e.dataTransfer.getData('asset');
    if (!assetData || !timelineContentRef.current) return;

    const asset: UploadedFile = JSON.parse(assetData);
    const startTime = getTimeFromX(e.clientX);

    const newClip: TimelineClip = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: asset.id,
      trackIndex: asset.type === 'video' ? 1 : 2, 
      startTime: Math.max(0, startTime),
      duration: asset.duration,
      name: asset.name,
      color: asset.type === 'video' ? 'bg-indigo-500' : 'bg-emerald-500',
      preview: asset.preview 
    };

    setClips(prev => [...prev, newClip]);
  };

  const handleClipMouseDown = (e: React.MouseEvent, clip: TimelineClip) => {
    e.stopPropagation(); 
    setDraggingClipId(clip.id);
    const timeAtMouse = getTimeFromX(e.clientX);
    setDragOffset(timeAtMouse - clip.startTime);
    setIsPlaying(false); 
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPlayhead(true);
    setIsPlaying(false); 
    updatePlayhead(e);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead) {
        updatePlayhead(e);
      } else if (draggingClipId) {
        const timeAtMouse = getTimeFromX(e.clientX);
        const newStartTime = Math.max(0, timeAtMouse - dragOffset);
        setClips(prev => prev.map(c => 
          c.id === draggingClipId ? { ...c, startTime: newStartTime } : c
        ));
      }
    };

    const onMouseUp = () => {
      setIsDraggingPlayhead(false);
      setDraggingClipId(null);
    };

    if (isDraggingPlayhead || draggingClipId) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingPlayhead, draggingClipId, dragOffset, getTimeFromX, updatePlayhead]);

  const formatTime = (percent: number) => {
    const totalSecs = (percent / 100) * TOTAL_DURATION;
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);
    const ms = Math.floor((totalSecs % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="h-full flex flex-col animate-fade-in -m-8 pt-8 pb-0 text-slate-800 overflow-hidden relative"
      style={{ backgroundColor: '#f8fafc' }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-6 px-8 shrink-0 z-10">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-orange-500">
            <Scissors size={20} />
          </div>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-bold tracking-tight text-slate-800">{moduleInfo.label}</h1>
               <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">PRO EDIT</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold mt-1">厦大智影动力实验室 · 极简专业编辑</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {initialData && (
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 animate-pulse">
               <Sparkles size={14} /> AI 素材已同步
             </div>
           )}
           <button className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95">
             <Download size={18} /> 导出
           </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex flex-col gap-6 min-h-0 px-8 z-10 overflow-hidden mb-6">
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Asset Panel */}
          <div className="w-[300px] bg-white/70 backdrop-blur-2xl rounded-[32px] border border-slate-200 flex flex-col overflow-hidden shrink-0 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/40">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} className="text-orange-500" /> 项目资产
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 custom-scrollbar">
              <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="aspect-video bg-white/40 border-2 border-dashed border-slate-200 rounded-[14px] flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer group"
              >
                 <Plus size={16} />
                 <span className="text-[8px] font-black uppercase tracking-widest">导入</span>
              </div>
              {uploadedVideos.map((item) => (
                <div 
                  key={item.id} 
                  draggable
                  onDragStart={(e) => onDragStartAsset(e, item)}
                  className={`group relative aspect-video bg-slate-100 rounded-[14px] overflow-hidden border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-orange-500/50 transition-all ${item.id.includes('ai') ? 'ring-2 ring-emerald-500/20' : ''}`}
                >
                  <img src={item.preview} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute top-1 right-1 px-1 py-0.5 bg-black/60 text-[8px] text-white font-mono rounded">
                    {Math.floor(item.duration)}s
                  </div>
                  {item.id.includes('ai') && (
                    <div className="absolute bottom-1 left-1 p-0.5 bg-emerald-500 rounded-md">
                      <Sparkles size={8} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Preview Window - Synthetic Result */}
          <div className="flex-1 bg-white/70 backdrop-blur-2xl rounded-[32px] border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 bg-slate-900 flex items-center justify-center relative m-4 rounded-[24px] overflow-hidden">
               {activeClip ? (
                 <img 
                   key={activeClip.id}
                   src={activeClip.preview} 
                   className="w-full h-full object-contain animate-fade-in" 
                   alt="Preview" 
                 />
               ) : (
                 <div className="flex flex-col items-center opacity-20 text-white">
                    <Film size={64} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Canvas</span>
                 </div>
               )}
               {/* 播放状态指示 */}
               {isPlaying && (
                 <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full shadow-lg animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Preview</span>
                 </div>
               )}
            </div>
            {/* Control Bar */}
            <div className="h-16 px-12 flex items-center justify-between bg-white/40 border-t border-slate-100/50">
               <div className="flex-1">
                 <span className="text-xs font-mono text-slate-400 font-bold tracking-tight">
                    {formatTime(playheadPos)}
                 </span>
               </div>
               <div className="flex-1 flex justify-center">
                 <button 
                  onClick={togglePlayback}
                  className={`w-12 h-12 rounded-full border border-slate-100 bg-white flex items-center justify-center shadow-md transition-all active:scale-95 ${isPlaying ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                 >
                   {isPlaying ? (
                     <Pause size={18} className="text-orange-500 fill-orange-500" />
                   ) : (
                     <Play size={18} className="text-slate-400 fill-slate-400 ml-0.5" />
                   )}
                 </button>
               </div>
               <div className="flex-1 flex items-center justify-end gap-5 text-slate-300">
                  <Maximize2 size={16} className="cursor-pointer hover:text-slate-500 transition-colors" />
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-500 transition-colors">
                    <Smartphone size={16} />
                    <span className="text-[10px] font-black font-mono">9:16</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar - Subtitles */}
          <div className="w-[300px] bg-white/70 backdrop-blur-2xl rounded-[32px] border border-slate-200 flex flex-col overflow-hidden shrink-0 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/40 text-slate-400">
               <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                 <MessageSquareText size={14} className="text-blue-500" /> 智能字幕
               </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {clips.filter(c => c.trackIndex === 0).map(sub => (
                 <div key={sub.id} className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium animate-fade-in-up">
                    <div className="text-[9px] text-blue-400 font-black mb-1">ST: {sub.startTime}s - {sub.startTime + sub.duration}s</div>
                    {sub.name}
                 </div>
               ))}
               {clips.filter(c => c.trackIndex === 0).length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-10">
                   <Type size={32} />
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="h-[240px] bg-white border-t border-slate-200 flex flex-col overflow-hidden shrink-0 z-20">
         <div className="flex items-center justify-between h-12 px-10 shrink-0 border-b border-slate-50">
            <div className="text-lg font-mono text-slate-800 font-black tracking-tight">
               {formatTime(playheadPos)}
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Maximize2 size={12} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">轴缩放</span>
                  </div>
                  <div className="w-40 flex items-center">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="0.1" 
                      value={zoom} 
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-full appearance-none accent-orange-500 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 w-8">{displayScale.toFixed(1)}x</span>
               </div>
            </div>
         </div>

         <div 
           ref={timelineContainerRef}
           className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative bg-slate-50/20"
         >
            <div 
              ref={timelineContentRef}
              className="h-full relative min-w-full"
              style={{ width: `${displayScale * 100}%` }}
              onMouseDown={handleTimelineMouseDown}
              onDragOver={(e) => e.preventDefault()}
            >
               {/* Ruler */}
               <div className="h-8 border-b border-slate-100 text-[9px] font-mono flex items-center relative bg-white pointer-events-none">
                  {Array.from({ length: TOTAL_DURATION + 1 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute flex flex-col items-center" 
                      style={{ left: `${(i / TOTAL_DURATION) * 100}%` }}
                    >
                       <div className={`h-${i % 5 === 0 ? '3' : '1'} w-px bg-slate-300 mb-0.5`} />
                       {i % 5 === 0 && <span className="text-slate-400 font-bold whitespace-nowrap">{i}s</span>}
                    </div>
                  ))}
               </div>
               
               {/* Content Tracks */}
               <div className="absolute top-8 bottom-0 left-0 right-0 py-2 space-y-2 flex flex-col select-none overflow-hidden justify-center pointer-events-none">
                  {/* Track 0: Subtitles */}
                  <div onDrop={(e) => onDropOnTimeline(e, 0)} onDragOver={(e) => e.preventDefault()} className="h-6 bg-slate-100/30 border-y border-slate-100 relative pointer-events-auto">
                    <div className="absolute left-2 top-0 bottom-0 flex items-center opacity-10 pointer-events-none"><Type size={10}/></div>
                    {clips.filter(c => c.trackIndex === 0).map(clip => (
                      <div 
                        key={clip.id}
                        onMouseDown={(e) => handleClipMouseDown(e, clip)}
                        className={`absolute inset-y-0 ${clip.color} rounded-sm flex items-center px-1 text-[8px] text-white font-medium border-x border-white/20 transition-all cursor-grab active:cursor-grabbing pointer-events-auto overflow-hidden ${draggingClipId === clip.id ? 'z-40 scale-[1.05] brightness-125' : ''}`}
                        style={{ 
                          left: `${(clip.startTime / TOTAL_DURATION) * 100}%`, 
                          width: `${(clip.duration / TOTAL_DURATION) * 100}%` 
                        }}
                      >
                         <span className="truncate">{clip.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Track 1: Video */}
                  <div onDrop={(e) => onDropOnTimeline(e, 1)} onDragOver={(e) => e.preventDefault()} className="h-20 bg-slate-100/30 border-y border-slate-100 relative pointer-events-auto">
                    <div className="absolute left-2 top-0 bottom-0 flex items-center opacity-10 pointer-events-none"><Film size={14}/></div>
                    {clips.filter(c => c.trackIndex === 1).map(clip => (
                      <div 
                        key={clip.id}
                        onMouseDown={(e) => handleClipMouseDown(e, clip)}
                        className={`absolute inset-y-1 ${clip.color} rounded-lg flex flex-col justify-end text-[10px] text-white font-bold border-2 transition-all cursor-grab active:cursor-grabbing pointer-events-auto overflow-hidden ${draggingClipId === clip.id ? 'border-orange-400 shadow-2xl z-40 scale-[1.01] brightness-110' : 'border-white/20'} ${activeClip?.id === clip.id ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                        style={{ 
                          left: `${(clip.startTime / TOTAL_DURATION) * 100}%`, 
                          width: `${(clip.duration / TOTAL_DURATION) * 100}%` 
                        }}
                      >
                         {/* 视频帧封面 */}
                         {clip.preview && (
                           <div className="absolute inset-0 z-0">
                             <img 
                               src={clip.preview} 
                               className="w-full h-full object-cover opacity-60 pointer-events-none" 
                               alt="Thumbnail" 
                             />
                             <div className="absolute inset-0 bg-black/10" /> 
                           </div>
                         )}
                         <div className="relative z-10 p-2 truncate drop-shadow-sm flex items-center gap-1">
                           {clip.id.includes('ai') && <Sparkles size={10} className="text-white fill-white" />}
                           {clip.name}
                         </div>
                      </div>
                    ))}
                  </div>

                  {/* Track 2: Audio */}
                  <div onDrop={(e) => onDropOnTimeline(e, 2)} onDragOver={(e) => e.preventDefault()} className="h-10 bg-slate-100/30 border-y border-slate-100 relative pointer-events-auto">
                    <div className="absolute left-2 top-0 bottom-0 flex items-center opacity-10 pointer-events-none"><Volume2 size={14}/></div>
                    {clips.filter(c => c.trackIndex === 2).map(clip => (
                      <div 
                        key={clip.id}
                        onMouseDown={(e) => handleClipMouseDown(e, clip)}
                        className={`absolute inset-y-1 ${clip.color} rounded-md flex items-center px-3 text-[9px] text-white font-bold border-2 transition-all cursor-grab active:cursor-grabbing pointer-events-auto overflow-hidden ${draggingClipId === clip.id ? 'border-orange-400 shadow-2xl z-40 scale-[1.01] brightness-110' : 'border-white/20'}`}
                        style={{ 
                          left: `${(clip.startTime / TOTAL_DURATION) * 100}%`, 
                          width: `${(clip.duration / TOTAL_DURATION) * 100}%` 
                        }}
                      >
                         <Music size={10} className="mr-2 opacity-60" />
                         <span className="truncate">{clip.name}</span>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Playhead */}
               <div 
                 className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-50 shadow-[0_0_15px_rgba(249,115,22,0.6)] pointer-events-none"
                 style={{ left: `${playheadPos}%` }}
               >
                  <div className="w-4 h-4 bg-orange-600 rounded-full -ml-1.75 -mt-0.5 border-2 border-white shadow-lg flex items-center justify-center">
                     <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; border: 2px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        input[type=range]::-webkit-slider-runnable-track { background: #f1f5f9; height: 4px; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { margin-top: -8px; height: 20px; width: 20px; border-radius: 99px; background: #f97316; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); appearance: none; }
      `}</style>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="video/*,audio/*,image/*" onChange={handleFileUpload} />
    </div>
  );
};
