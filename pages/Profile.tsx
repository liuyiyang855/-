
import React from 'react';
import { MOCK_PROJECTS } from '../constants';
import { UserInfo } from '../services/api';
import { 
  User, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  BarChart3, 
  ChevronRight,
  PlusCircle
} from 'lucide-react';

interface ProfileProps {
  user: UserInfo | null;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-white border border-slate-100 shadow-sm p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl">
              {user?.avatar || '厦'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 hover:text-blue-600 transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">{user?.name || '厦门大学智影实验室'}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {user?.role || 'PRO 账户'}
              </span>
            </div>
            <p className="text-slate-500 mb-6 font-medium">高级科研合作伙伴 · 智能影像动力实验室</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-600">
                <CreditCard className="w-4 h-4 text-blue-500" />
                算力余额: {user?.credits.toLocaleString() || '4,280'} P-Credits
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                安全状态: 极高
              </div>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-6 text-center border-l border-slate-100 pl-8">
            <div>
              <div className="text-2xl font-bold text-slate-800">128</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">总项目</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">1.2k</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">社区获赞</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">98%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">满意度</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> 最近项目
            </h2>
            <button className="text-sm font-bold text-blue-600 hover:underline">管理全部</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PROJECTS.slice(0, 4).map(project => (
              <div key={project.id} className="group bg-white rounded-3xl p-4 border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-bold border border-white/10 uppercase tracking-wide">
                    2023-10-24
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{project.title}</h4>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>视频生成模块</span>
                  <span className="flex items-center gap-1 text-green-500">已渲染完毕</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <BarChart3 className="w-5 h-5 text-blue-400" /> 算力消耗分析
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>视频生成</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>分镜渲染</span>
                  <span className="text-white">25%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[25%] rounded-full"></div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                  查看详细报告 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">账户中心</h3>
            <div className="space-y-2">
              {['个人设置', '算力充值', '授权管理', '我的收藏'].map(link => (
                <button key={link} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group">
                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">{link}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
