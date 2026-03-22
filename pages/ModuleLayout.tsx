import React, { useState } from 'react';
import { NavItem } from '../types';
import { Info, Plus, History, ChevronRight } from 'lucide-react';

interface ModuleLayoutProps {
  module: NavItem;
}

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({ module }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      {/* Module Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            {module.label}
            <span className={`text-sm px-2 py-1 rounded-md bg-opacity-10 ${module.color.replace('text-', 'bg-')} ${module.color}`}>
              {module.enLabel}
            </span>
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {module.description}
          </p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-slate-200 text-slate-800' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
           >
             <History className="w-4 h-4 inline mr-2" />
             历史记录
           </button>
           <button 
             onClick={() => setActiveTab('create')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
           >
             <Plus className="w-4 h-4 inline mr-2" />
             新建项目
           </button>
        </div>
      </header>

      {/* Main Workspace Area (Placeholder for actual tools) */}
      <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm p-6 relative overflow-hidden flex flex-col">
        
        {activeTab === 'create' ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <div className={`w-20 h-20 mb-6 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center ${module.color.replace('text-', 'text-').replace('500', '300')}`}>
                <module.icon className="w-10 h-10" />
             </div>
             <h3 className="text-lg font-medium text-slate-600 mb-2">准备就绪</h3>
             <p className="max-w-md text-center mb-8">
               在左侧面板配置参数，或直接拖入参考文件以开始 {module.label} 任务。
             </p>
             
             {/* Simulated Controls */}
             <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                <div className="h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center px-4 text-sm text-slate-500 hover:border-blue-400 cursor-pointer transition-colors">
                  上传参考图...
                </div>
                <div className="h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center px-4 text-sm text-slate-500 hover:border-blue-400 cursor-pointer transition-colors">
                   输入提示词...
                </div>
             </div>
             <button className={`mt-8 px-12 py-3 rounded-xl text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-slate-800 to-slate-900`}>
               生成预览
             </button>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto">
             <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">项目名称</th>
                    <th className="px-4 py-3 font-medium">创建时间</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {[1,2,3].map(i => (
                     <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                       <td className="px-4 py-4">#00{i}</td>
                       <td className="px-4 py-4 font-medium text-slate-800">未命名项目_{i}</td>
                       <td className="px-4 py-4">2023-10-2{i}</td>
                       <td className="px-4 py-4">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           完成
                         </span>
                       </td>
                       <td className="px-4 py-4 text-right">
                         <button className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 ml-auto">
                           查看 <ChevronRight className="w-3 h-3" />
                         </button>
                       </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

      </div>
    </div>
  );
};
