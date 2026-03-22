
import React from 'react';
import { NavId } from '../types';
import { APP_SLOGAN_MAIN, APP_SLOGAN_SUB, NAV_ITEMS, MOCK_PROJECTS } from '../constants';
import { Sparkles, PlayCircle, Zap, Wrench } from 'lucide-react';

interface HomeProps {
  onNavigate: (id: NavId) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // 分类过滤
  const creationModules = NAV_ITEMS.filter(item => item.category === 'creation');
  const utilityModules = NAV_ITEMS.filter(item => item.category === 'utility');

  return (
    <div className="w-full pb-20 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-white/50 to-blue-50/30 border border-white/60 shadow-lg backdrop-blur-xl p-8 md:p-12 mb-10 group">
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000 delay-150"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-blue-100 text-blue-600 text-xs font-bold shadow-sm mb-8 backdrop-blur-md animate-float">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>LoopIn 2.0 智能引擎已就绪</span>
          </div>
          
          <div className="mb-6 flex flex-col items-center justify-center">
            <h1 className="text-[6rem] md:text-[9rem] leading-[0.85] font-artistic text-transparent bg-clip-text bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 drop-shadow-2xl select-none py-2 transform -rotate-3 skew-x-[-3deg] hover:rotate-0 hover:skew-x-0 transition-transform duration-700 origin-center filter contrast-125">
              鹭影
            </h1>

            {/* Decorative Underline */}
            <div className="h-1.5 w-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full mt-4 mb-3 opacity-80"></div>

            {/* 副标题 LoopIn */}
            <span className="text-xl md:text-2xl font-black text-blue-200 tracking-[0.8em] uppercase mb-6 select-none">
              LoopIn
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-medium text-slate-700 mb-6 tracking-tight">
            {APP_SLOGAN_MAIN}
          </h2>
          <p className="text-lg text-slate-500 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            {APP_SLOGAN_SUB}
          </p>
          
          <div className="flex justify-center gap-5">
            <button 
              onClick={() => onNavigate(NavId.SCRIPT)}
              className="px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/10 hover:shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 font-semibold text-lg"
            >
              <Sparkles className="w-5 h-5" />
              立即创作
            </button>
            <button className="px-8 py-4 bg-white/80 hover:bg-white text-slate-700 border border-slate-200 hover:border-blue-200 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 flex items-center gap-3 font-semibold text-lg backdrop-blur-sm">
              <PlayCircle className="w-5 h-5" />
              演示视频
            </button>
          </div>
        </div>
      </div>

      {/* 1. Creative Workbench */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="p-2 bg-blue-100 rounded-lg">
           <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">创作工作台</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {creationModules.map((module) => {
          const Icon = module.icon;
          const bgIcon = module.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100');
          const bgDecoration = module.color.replace('text-', 'bg-').replace('600', '50').replace('500', '50');
          
          return (
            <div 
              key={module.id}
              onClick={() => onNavigate(module.id)}
              className="group relative bg-white/40 backdrop-blur-sm hover:bg-white rounded-[24px] p-5 shadow-sm border border-white/60 hover:border-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-row items-center aspect-[4/3]"
            >
              <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${bgDecoration} opacity-40 group-hover:scale-125 transition-transform duration-500 ease-out`} />
              
              <div className={`w-12 h-12 rounded-2xl ${bgIcon} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 relative z-10`}>
                <Icon className={`w-6 h-6 ${module.color}`} />
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col pl-5 h-full justify-center">
                <div className="mb-1">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {module.label}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                    {module.enLabel}
                  </p>
                </div>
                
                <p className="text-sm text-slate-500 leading-snug line-clamp-2 opacity-80 mb-3">
                  {module.description}
                </p>
                
                <div className="mt-auto">
                   <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-widest flex items-center gap-1">
                     ENTER <span className="text-lg leading-none">›</span>
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Utility Tools (New Section) */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="p-2 bg-purple-100 rounded-lg">
           <Wrench className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">实用工具</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {utilityModules.map((module) => {
          const Icon = module.icon;
          // 处理颜色类名转换，增加容错
          const bgIcon = module.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100').replace('400', '100');
          const bgDecoration = module.color.replace('text-', 'bg-').replace('600', '50').replace('500', '50').replace('400', '50');
          
          return (
            <div 
              key={module.id}
              onClick={() => onNavigate(module.id)}
              className="group relative bg-white/40 backdrop-blur-sm hover:bg-white rounded-[24px] p-5 shadow-sm border border-white/60 hover:border-white hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-row items-center aspect-[4/3]"
            >
              <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${bgDecoration} opacity-40 group-hover:scale-125 transition-transform duration-500 ease-out`} />
              
              <div className={`w-12 h-12 rounded-2xl ${bgIcon} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 relative z-10`}>
                <Icon className={`w-6 h-6 ${module.color}`} />
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col pl-5 h-full justify-center">
                <div className="mb-1">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors leading-tight">
                    {module.label}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                    {module.enLabel}
                  </p>
                </div>
                
                <p className="text-sm text-slate-500 leading-snug line-clamp-2 opacity-80 mb-3">
                  {module.description}
                </p>

                <div className="mt-auto">
                   <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-500 transition-colors uppercase tracking-widest flex items-center gap-1">
                     ENTER <span className="text-lg leading-none">›</span>
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discover / Showcase */}
      <div className="flex justify-between items-end mb-8 px-2">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
               <PlayCircle className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">社区佳作</h2>
         </div>
        <a href="#" className="text-sm px-4 py-2 bg-white rounded-full border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all font-medium">浏览更多</a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_PROJECTS.map((project, idx) => (
          <div key={project.id} className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2">
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
               <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                 <h4 className="text-white font-bold text-lg leading-tight mb-2">{project.title}</h4>
                 <div className="flex justify-between items-center text-xs text-white/80 border-t border-white/20 pt-3">
                   <span className="font-medium">@{project.author}</span>
                   <span className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                     <PlayCircle className="w-3 h-3 fill-current"/> {project.views}
                   </span>
                 </div>
               </div>
            </div>
            
            <div className="absolute top-3 left-3">
               <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-bold border border-white/20 uppercase tracking-wide">
                 AI Generated
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
