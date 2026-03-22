
import React, { useState } from 'react';
import { NavId } from './types';
import { NAV_ITEMS } from './constants';
import { Home } from './pages/Home';
import { ModuleLayout } from './pages/ModuleLayout';
import { Profile } from './pages/Profile';
import { ColorModule } from './pages/ColorModule'; 
import { AutoEditModule } from './pages/AutoEditModule'; 
import { MangaDramaModule } from './pages/MangaDramaModule';
import { AssetsModule } from './pages/AssetsModule';
import { StoryboardModule } from './pages/StoryboardModule';
import { AIAnalysisModule } from './pages/AIAnalysisModule';
import { Logo } from './components/Logo';
import { TaskMonitor } from './components/TaskMonitor';
import { AuthService, UserInfo } from './services/api';
import { 
  Settings, 
  LogOut, 
  LogIn,
  Bell, 
  Search,
  ChevronRight,
  User,
  Lock,
  Mail,
  X,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [activeNavId, setActiveNavId] = useState<NavId>(NavId.HOME);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // 共享给剪辑模块的初始数据
  const [autoEditInitialData, setAutoEditInitialData] = useState<any>(null);

  const activeModule = NAV_ITEMS.find(item => item.id === activeNavId);
  const homeItem = NAV_ITEMS.find(item => item.id === NavId.HOME);
  
  // 分类模块
  const creationModules = NAV_ITEMS.filter(item => item.category === 'creation');
  const utilityModules = NAV_ITEMS.filter(item => item.category === 'utility');

  const handleNavigate = (id: NavId, data?: any) => {
    if (id !== NavId.HOME && id !== NavId.PROFILE && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (id === NavId.AUTO_EDIT && data) {
      setAutoEditInitialData(data);
    } else if (id !== NavId.AUTO_EDIT) {
      // 切换到非剪辑模块时清空暂存数据（可选）
      // setAutoEditInitialData(null);
    }
    setActiveNavId(id);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    try {
      const response = await AuthService.login(loginForm.username, loginForm.password);
      if (response.success && response.user) {
        setIsLoggedIn(true);
        setCurrentUser(response.user);
        setShowLoginModal(false);
        setLoginForm({ username: '', password: '' });
      } else {
        alert('登录失败，请检查用户名或密码');
      }
    } catch (error) {
      console.error('Login Error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveNavId(NavId.HOME);
  };

  const renderContent = () => {
    switch (activeNavId) {
      case NavId.HOME:
        return <Home onNavigate={handleNavigate} />;
      case NavId.PROFILE:
        return <Profile user={currentUser} />;
      case NavId.COLOR:
        return <ColorModule />;
      case NavId.AUTO_EDIT:
        return <AutoEditModule initialData={autoEditInitialData} />;
      case NavId.MANGA_DRAMA:
        return <MangaDramaModule onNavigate={handleNavigate} />;
      case NavId.ASSETS:
        return <AssetsModule />;
      case NavId.STORYBOARD:
        return <StoryboardModule />;
      case NavId.AI_ANALYSIS:
        return <AIAnalysisModule />;
      default:
        // 对于尚未实现的具体页面（如新增的实用工具），使用通用的 ModuleLayout 渲染
        return activeModule ? <ModuleLayout module={activeModule} /> : null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* Sidebar Navigation */}
      <aside className="w-[280px] h-full flex flex-col bg-white border-r border-slate-100 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="h-24 flex items-center px-8 cursor-pointer group" onClick={() => handleNavigate(NavId.HOME)}>
           <Logo />
        </div>

        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {homeItem && (
            <button
              onClick={() => handleNavigate(NavId.HOME)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 mb-6 ${
                activeNavId === NavId.HOME 
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <homeItem.icon className={`w-5 h-5 ${activeNavId === NavId.HOME ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-sm">{homeItem.label}</span>
                <span className="text-[10px] opacity-80 font-medium uppercase tracking-wider">{homeItem.enLabel}</span>
              </div>
            </button>
          )}

          {/* Creation Modules */}
          <div className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-60">
            创作模块 / Modules
          </div>
          <div className="space-y-1 mb-6">
            {creationModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-white shadow-md shadow-slate-200/50 text-slate-900 border border-slate-100' 
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? item.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100') : 'bg-transparent'}`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? item.color : 'text-slate-400 group-hover:scale-110'}`} />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className={`font-bold text-sm ${isActive ? 'text-slate-900' : ''}`}>{item.label}</span>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">{item.enLabel}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />}
                </button>
              );
            })}
          </div>

          {/* Utility Tools */}
          <div className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-60">
            实用工具 / Utilities
          </div>
          <div className="space-y-1 mb-4">
            {utilityModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive 
                    ? 'bg-white shadow-md shadow-slate-200/50 text-slate-900 border border-slate-100' 
                    : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? item.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100').replace('400', '100') : 'bg-transparent'}`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? item.color : 'text-slate-400 group-hover:scale-110'}`} />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className={`font-bold text-sm ${isActive ? 'text-slate-900' : ''}`}>{item.label}</span>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">{item.enLabel}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-50 space-y-1">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all group">
            <Settings className="w-5 h-5 text-slate-400 group-hover:rotate-45 transition-transform" />
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-sm text-slate-600">全局设置</span>
              <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">Settings</span>
            </div>
          </button>
          
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all group"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-sm">退出登录</span>
                <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">Logout</span>
              </div>
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all group relative overflow-hidden shadow-lg shadow-blue-600/20"
            >
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-sm">登录系统</span>
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Sign In</span>
              </div>
              <div className="absolute inset-y-0 right-0 w-1 bg-white/30 animate-pulse"></div>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <header className="h-20 flex items-center justify-between px-8 bg-white/40 backdrop-blur-xl border-b border-slate-100/50 shrink-0 z-20">
          <div className="flex-1 max-w-xl">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="搜索项目、素材或教程..." 
                  className="w-full bg-slate-100/50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none text-slate-600"
                />
             </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-500 hover:bg-white rounded-full transition-all group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isLoggedIn && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-1 ring-white/50 animate-pulse"></span>
              )}
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            {isLoggedIn ? (
              <div 
                onClick={() => handleNavigate(NavId.PROFILE)}
                className="flex items-center gap-3 pl-2 group cursor-pointer"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-700 leading-none group-hover:text-blue-600 transition-colors">
                    {currentUser?.name || '用户'}
                  </span>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">智影实验室</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                  {currentUser?.avatar || 'U'}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          {renderContent()}
        </div>

        {isLoggedIn && <TaskMonitor />}
      </main>

      {/* Auth Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => !isAuthenticating && setShowLoginModal(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-fade-in-up">
            <button 
              onClick={() => setShowLoginModal(false)}
              disabled={isAuthenticating}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pt-12">
              <div className="flex justify-center mb-8">
                <Logo />
              </div>

              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-slate-800">
                  {authMode === 'login' ? '欢迎回来' : '开启创作之旅'}
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                  {authMode === 'login' ? '登录您的账号以继续创作' : '注册账号，体验AI影视创作的魅力'}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="邮箱地址" 
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                  </div>
                )}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="用户名 / 账号" 
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="密码" 
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 disabled:bg-blue-400"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    authMode === 'login' ? '立即登录' : '注册账号'
                  )}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                <span>{authMode === 'login' ? '还没有账号？' : '已有账号？'}</span>
                <button 
                  onClick={() => !isAuthenticating && setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="font-bold text-blue-600 hover:underline disabled:opacity-50"
                  disabled={isAuthenticating}
                >
                  {authMode === 'login' ? '立即注册' : '登录现有账号'}
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold border-t border-slate-100">
              智驭光影 · 鹭起梦成
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
