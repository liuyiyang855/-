import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Container: Solid Blue Square */}
      <div className="relative w-10 h-10 bg-[#4477CE] rounded-sm flex items-center justify-center overflow-hidden shrink-0">
        
        {/* -----------------------------------------------------------------
           【自定义 Logo 图片修改说明】
           如果您想使用自己的图片 (png/jpg/svg)，请：
           1. 删除或注释掉下方的 <svg> ... </svg> 代码块
           2. 取消注释下方的 <img> 标签，并将 src 修改为您的图片路径
           ------------------------------------------------------------------ */}

        {/* 
        <img 
          src="/path/to/your/logo.png" 
          alt="Logo" 
          className="w-full h-full object-cover" 
        /> 
        */}

        {/* 当前默认：SVG 绘制的白色剪影 */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full absolute inset-0 text-white"
          fill="currentColor" 
          preserveAspectRatio="none"
        >
           <path 
            d="M 15 65 
               C 18 63, 22 68, 25 65 
               C 28 62, 28 58, 30 62 
               C 32 66, 35 70, 45 72 
               C 50 73, 55 75, 40 75 
               L 45 80 
               L 15 80 
               L 12 75 
               C 12 75, 18 70, 15 65 Z" 
           />
           <path 
             d="M 10 70 
                Q 15 65 18 68 
                Q 20 70 22 65 
                Q 24 55 28 60 
                Q 32 65 40 70 
                L 50 78 
                L 10 78 
                Z"
             fill="white"
           />
        </svg>
      </div>
      
      {/* Text Label */}
      <div className="flex flex-col select-none">
        <span className="font-bold text-xl tracking-wider text-slate-800 leading-none font-sans">
          鹭影
        </span>
        <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase leading-none mt-1">
          LoopIn
        </span>
      </div>
    </div>
  );
};