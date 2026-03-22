
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileVideo, 
  Table, 
  Download, 
  Play, 
  Pause, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ScanSearch,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';
import { NavId } from '../types';
import { NAV_ITEMS } from '../constants';
import { FilmAnalysisService, ShotAnalysis } from '../services/api';

export const AIAnalysisModule: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ShotAnalysis[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const moduleInfo = NAV_ITEMS.find(item => item.id === NavId.AI_ANALYSIS)!;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    } else {
      setError('请上传有效的 MP4 视频文件');
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await FilmAnalysisService.analyzeVideo(videoFile);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || '分析失败，请重试');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (!analysisResult) return;
    // 模拟下载逻辑
    const csvContent = "data:text/csv;charset=utf-8," 
      + "镜号,时间码,景别,运镜,画面内容,声音/对白\n"
      + analysisResult.map(r => `${r.id},${r.timecode},${r.shotType},${r.movement},${r.description},${r.audio}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `拉片分析_${videoFile?.name || 'video'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl text-red-500">
              <ScanSearch size={24} />
            </div>
            {moduleInfo.label}
            <span className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-500 font-bold uppercase tracking-wider">
              {moduleInfo.enLabel}
            </span>
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <Info className="w-4 h-4" />
            {moduleInfo.description}
          </p>
        </div>
        
        {analysisResult && (
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            <Download size={18} />
            导出拉片表
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        
        {/* Left: Video Upload & Preview */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileVideo size={14} className="text-red-500" /> 视频预览
              </h3>
              {videoFile && (
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                  {videoFile.name}
                </span>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-slate-900 relative group">
              {videoPreview ? (
                <>
                  <video 
                    ref={videoRef}
                    src={videoPreview} 
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                    <button 
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white pointer-events-auto hover:scale-110 transition-transform"
                    >
                      {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 font-bold text-sm">点击或拖拽上传视频</p>
                    <p className="text-slate-600 text-[10px] uppercase tracking-widest mt-1">Supports MP4, MOV up to 500MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <button
              disabled={!videoFile || isAnalyzing}
              onClick={handleAnalyze}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                !videoFile || isAnalyzing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-red-500/20 active:scale-[0.98]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  正在智能分析中...
                </>
              ) : (
                <>
                  <ScanSearch size={20} />
                  开始一键拉片
                </>
              )}
            </button>
            {error && (
              <p className="mt-2 text-center text-xs text-red-500 flex items-center justify-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>
        </div>

        {/* Right: Analysis Table */}
        <div className="w-1/2 flex flex-col bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Table size={14} className="text-red-500" /> 拉片分析表
            </h3>
            {analysisResult && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={10} /> 分析完成
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!analysisResult && !isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Table size={32} className="opacity-20" />
                </div>
                <h4 className="text-slate-400 font-bold mb-1">暂无分析结果</h4>
                <p className="text-[10px] uppercase tracking-widest">请在左侧上传视频并开始分析</p>
              </div>
            ) : isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-6">
                   <div className="w-20 h-20 rounded-full border-4 border-red-100 border-t-red-500 animate-spin"></div>
                   <ScanSearch size={32} className="absolute inset-0 m-auto text-red-500 animate-pulse" />
                </div>
                <h4 className="text-slate-800 font-bold mb-2">AI 正在深度拆解影片...</h4>
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mx-auto">
                  <div className="h-full bg-red-500 animate-[loading_2s_infinite]"></div>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-4 font-bold">Analyzing shots, movements, and audio...</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {analysisResult?.map((shot) => (
                  <div key={shot.id} className="p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex gap-4">
                      <div className="w-32 shrink-0 aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                        <img src={shot.thumbnail} className="w-full h-full object-cover" alt={`Shot ${shot.id}`} />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-[8px] text-white font-mono rounded">
                          #{shot.id.toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-red-500">{shot.timecode}</span>
                          <div className="flex gap-2">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">{shot.shotType}</span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">{shot.movement}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-800 font-medium mb-1 line-clamp-2">{shot.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
                          <Info size={10} /> {shot.audio}
                        </div>
                      </div>
                      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                           <Eye size={16} />
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="video/mp4,video/x-m4v,video/*" 
        className="hidden" 
      />

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};
