
import React, { useState, useRef, useEffect } from 'react';
import { Video, Image as ImageIcon, Info, Play, Pause, BarChart2, Check, FileVideo, Upload, ImagePlus, Sliders, Monitor, Cpu, Download, RefreshCw, Loader2, Zap, History, XCircle } from 'lucide-react';
import { NavId } from '../types';
import { NAV_ITEMS } from '../constants';

export const ColorModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'custom'>('gallery');
  const [selectedStyle, setSelectedStyle] = useState('in00');
  const [resolution, setResolution] = useState('512px');
  const [strength, setStrength] = useState(1.0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [useCpu, setUseCpu] = useState(false);
  
  // 视频上传相关状态
  const [uploadedVideo, setUploadedVideo] = useState<{url: string, name: string, size: string} | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取当前模块的配置信息
  const moduleInfo = NAV_ITEMS.find(item => item.id === NavId.COLOR)!;
  
  // 处理状态：'idle' (初始), 'processing' (处理中), 'completed' (已完成)
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 任务计数器
  const taskCounter = useRef(1);

  const filters = [
    { id: 'in00', name: 'in00', url: 'https://picsum.photos/200/120?random=10' },
    { id: 'in02', name: 'in02', url: 'https://picsum.photos/200/120?random=11' },
    { id: 'in03', name: 'in03', url: 'https://picsum.photos/200/120?random=12' },
    { id: 'in14', name: 'in14', url: 'https://picsum.photos/200/120?random=13' },
    { id: 'in17', name: 'in17', url: 'https://picsum.photos/200/120?random=14' },
    { id: 'in34', name: 'in34', url: 'https://picsum.photos/200/120?random=15' },
    { id: 'in58', name: 'in58', url: 'https://picsum.photos/200/120?random=16' },
    { id: 'in64', name: 'in64', url: 'https://picsum.photos/200/120?random=17' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo({
        url,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });

      // 模拟提取视频第一帧图像
      // 在实际应用中，可以通过在后台创建一个隐藏的 video 元素并绘制到 canvas 来获取
      // 这里使用一张有代表性的随机图模拟“视频首帧”
      setVideoPreview(`https://picsum.photos/800/450?random=${Math.floor(Math.random() * 100)}`);
    }
  };

  const clearVideo = () => {
    setUploadedVideo(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartProcessing = () => {
    if (!uploadedVideo) {
      alert("请先上传原始视频");
      return;
    }
    
    const taskNum = taskCounter.current.toString().padStart(2, '0');
    taskCounter.current += 1;

    const event = new CustomEvent('add-task', {
      detail: {
        name: `调色: ${uploadedVideo.name}`,
        module: NavId.COLOR
      }
    });
    window.dispatchEvent(event);
    
    setProcessingStatus('processing');
    setIsPlaying(false);

    setTimeout(() => {
      setProcessingStatus('completed');
    }, 5000);
  };

  const handleRestart = () => {
    setProcessingStatus('idle');
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (processingStatus === 'completed') {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in text-slate-800">
      {/* Page Header - Standard Module Design */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-800 leading-none">
              {moduleInfo.label}
            </h1>
            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-600 text-[13px] font-bold border border-teal-100 flex items-center justify-center">
              {moduleInfo.enLabel}
            </span>
          </div>
          <p className="text-slate-500 mt-3 flex items-center gap-2 text-[14px]">
            <Info className="w-4 h-4 text-slate-400" />
            {moduleInfo.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all text-slate-600 hover:bg-slate-100 active:scale-95 border border-transparent hover:border-slate-200">
             <History className="w-4 h-4" />
             历史记录
           </button>
        </div>
      </header>

      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-20">
        
        {/* Main Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Original Video */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-8 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col group transition-all hover:shadow-blue-500/5 hover:border-blue-100">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-4 text-blue-500 shadow-sm border border-blue-100/50">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">原始视频</h3>
              <p className="text-sm text-slate-400 mt-2">拖放视频文件或点击上传</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">MP4, MOV, AVI, MKV, WebM</p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/*" 
              onChange={handleFileSelect} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto mb-8 px-10 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-2"
            >
              <FileVideo className="w-4 h-4" /> 选择视频
            </button>

            <div className="relative aspect-video bg-slate-100/50 rounded-3xl overflow-hidden border border-slate-200/50 mb-6 shadow-inner flex items-center justify-center">
              {videoPreview ? (
                <>
                  <img 
                    src={videoPreview} 
                    className="w-full h-full object-cover animate-fade-in" 
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center group/play-container">
                    <div className="w-16 h-16 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center cursor-pointer hover:bg-white/80 transition-all border border-white/50 shadow-xl group/play">
                      <Play className="w-6 h-6 fill-blue-600 text-blue-600 group-hover/play:scale-110 transition-transform" />
                    </div>
                  </div>
                  <button 
                    onClick={clearVideo}
                    className="absolute top-4 right-4 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-300 italic">
                  <Video className="w-12 h-12 mb-2 opacity-20" />
                  <span className="text-xs font-bold tracking-widest uppercase opacity-40">等待上传 / Waiting for upload</span>
                </div>
              )}
            </div>

            <div className={`bg-blue-50/50 rounded-[24px] p-5 grid grid-cols-4 gap-4 text-center border border-blue-100/50 shadow-sm transition-all duration-500 ${videoPreview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">文件名</span>
                <span className="text-xs mt-1 truncate font-bold text-slate-600">{uploadedVideo?.name || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">分辨率</span>
                <span className="text-xs mt-1 font-bold text-slate-600">{videoPreview ? '1920 x 1080' : '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">文件大小</span>
                <span className="text-xs mt-1 font-bold text-slate-600">{uploadedVideo?.size || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">时长</span>
                <span className="text-xs mt-1 font-bold text-slate-600">{videoPreview ? '5s (150f)' : '-'}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Reference Style */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-8 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col transition-all hover:shadow-indigo-500/5 hover:border-indigo-100">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mb-4 text-indigo-500 shadow-sm border border-indigo-100/50">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">参考风格</h3>
            </div>

            <div className="bg-slate-100/80 p-1.5 rounded-2xl flex mb-8 border border-slate-200/50">
              <button 
                onClick={() => setActiveTab('gallery')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'gallery' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                滤镜风格库
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                自定义参考图
              </button>
            </div>

            {activeTab === 'gallery' ? (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                  {filters.map((filter) => (
                    <div 
                      key={filter.id}
                      onClick={() => setSelectedStyle(filter.id)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedStyle === filter.id ? 'border-blue-500 shadow-lg shadow-blue-500/10 scale-[0.98]' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                    >
                      <img src={filter.url} alt={filter.name} className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className={`absolute inset-0 bg-blue-600/10 flex items-center justify-center transition-opacity ${selectedStyle === filter.id ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-blue-600 rounded-full p-1.5 shadow-xl scale-110">
                          <Check className="w-3 h-3 text-white" strokeWidth={4} />
                        </div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-md p-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase block text-center">{filter.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-300 group/upload">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-slate-300 group-hover/upload:text-blue-500 transition-colors">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                  <h4 className="text-slate-600 font-bold mb-2">拖放图片文件或点击上传</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">支持: PNG, JPG, JPEG, WebP</p>
                  <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> 选择图片
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Parameters Section */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-10 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
              <Sliders className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">处理参数</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 items-end">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5" /> 处理分辨率
              </label>
              <div className="relative group">
                <select 
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer group-hover:border-blue-300"
                >
                  <option value="256px">256px (快速)</option>
                  <option value="512px">512px (标准)</option>
                  <option value="768px">768px (高质量)</option>
                  <option value="1024px">1024px (超高清)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">风格强度: <span className="text-blue-600 ml-1">{strength.toFixed(1)}</span></label>
              </div>
              <div className="h-14 flex items-center px-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-blue-300 transition-all">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={strength}
                  onChange={(e) => setStrength(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 focus:outline-none" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 py-2 px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${keepAspectRatio ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-slate-200 group-hover:border-blue-300'}`}>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={keepAspectRatio}
                    onChange={() => setKeepAspectRatio(!keepAspectRatio)}
                  />
                  {keepAspectRatio && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">保持原始宽高比</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${useCpu ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-slate-200 group-hover:border-blue-300'}`}>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={useCpu}
                    onChange={() => setUseCpu(!useCpu)}
                  />
                  {useCpu && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  使用 CPU <span className="text-[10px] opacity-60 font-medium">(无GPU时勾选)</span>
                </span>
              </label>
            </div>

            <div className="hidden lg:flex flex-col justify-end items-end pr-2 text-right">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">预估耗时</span>
               <span className="text-lg font-bold text-slate-700">~ {resolution === '256px' ? '30s' : resolution === '512px' ? '1.5m' : '5m+'}</span>
            </div>
          </div>

          <button 
            onClick={handleStartProcessing}
            disabled={processingStatus === 'processing' || !uploadedVideo}
            className={`w-full py-5 rounded-3xl font-bold text-xl shadow-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-4 group ${
              processingStatus === 'processing' || !uploadedVideo
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/20 hover:scale-[1.005]'
            }`}
          >
            {processingStatus === 'processing' ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                正在处理任务...
              </>
            ) : (
              <>
                <Zap className={`w-6 h-6 transition-all ${uploadedVideo ? 'group-hover:fill-current' : ''}`} />
                开始处理
              </>
            )}
          </button>
        </div>

        {/* Processing Result Module (Always Visible) */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-10 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">处理结果</h2>
          </div>

          <div className="relative aspect-video bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200/50 mb-10 shadow-2xl mx-auto max-w-4xl group/result">
            {processingStatus === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                <BarChart2 className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-bold tracking-widest uppercase">暂无结果 / No Result</p>
                <p className="text-[10px] mt-2 opacity-50">点击上方“开始处理”生成渲染预览</p>
              </div>
            )}

            {processingStatus === 'processing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-white text-sm font-bold tracking-widest uppercase">渲染中 / Rendering...</p>
                 </div>
              </div>
            )}

            {processingStatus === 'completed' && (
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" 
                  className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'opacity-0 scale-105' : 'opacity-100'}`}
                  alt="Result Cover"
                />
                {isPlaying && (
                   <div className="w-full h-full flex items-center justify-center bg-black">
                      <p className="text-blue-500 text-sm font-mono animate-pulse">Playing stylised sequence...</p>
                   </div>
                )}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={togglePlay}
                      className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl hover:bg-white/30 hover:scale-110 transition-all group/play"
                    >
                      <Play className="w-8 h-8 text-white fill-white" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Video Controls (Static or Interactive) */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 z-20">
               <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
               </button>
               <div className="flex-1 h-1 bg-white/20 rounded-full relative overflow-hidden">
                  <div 
                    className={`h-full bg-blue-500 transition-all rounded-full ${isPlaying ? 'animate-[playhead_10s_linear_infinite]' : 'w-0'}`}
                  ></div>
               </div>
               <span className="text-[10px] text-white font-mono">0:00 / 0:03</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              disabled={processingStatus !== 'completed'}
              className={`px-10 py-4 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                processingStatus === 'completed' ? 'bg-[#10b981] text-white shadow-[#10b981]/20 hover:bg-[#059669]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" /> 下载 MP4
            </button>
            <button 
              disabled={processingStatus !== 'completed'}
              className={`px-10 py-4 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                processingStatus === 'completed' ? 'bg-slate-800 text-white shadow-slate-900/10 hover:bg-slate-900' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" /> 下载 MOV
            </button>
            <button 
              onClick={handleRestart}
              className="px-10 py-4 bg-transparent border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 重置画布
            </button>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        @keyframes playhead {
          from { width: 0%; }
          to { width: 100%; }
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(37, 99, 235, 0.3);
          border: 3px solid white;
        }
      `}</style>
    </div>
  );
};

// Internal icons
const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
