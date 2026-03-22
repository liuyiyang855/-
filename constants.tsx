
import * as Lucide from 'lucide-react';
import { NavId, NavItem, ProjectPreview } from './types';

export const APP_NAME = "鹭影 LoopIn";
export const APP_SLOGAN_MAIN = "智驭光影，鹭起梦成";
export const APP_SLOGAN_SUB = "厦门大学智影动力实验室 · 电影全流程智能协同创作系统";

export const NAV_ITEMS: NavItem[] = [
  { 
    id: NavId.HOME, 
    label: '主页', 
    enLabel: 'Home',
    icon: Lucide.Home, 
    description: '概览与创作入口',
    color: 'text-blue-600',
    category: 'system'
  },
  
  // --- Creative Modules ---
  { 
    id: NavId.SCRIPT, 
    label: '剧本', 
    enLabel: 'Script',
    icon: Lucide.PenTool, 
    description: 'AI辅助剧本生成与润色',
    color: 'text-indigo-500',
    category: 'creation'
  },
  { 
    id: NavId.STORYBOARD, 
    label: '分镜', 
    enLabel: 'Storyboard',
    icon: Lucide.Image, 
    description: '智能分镜脚本与画面构图',
    color: 'text-purple-500',
    category: 'creation' 
  },
  { 
    id: NavId.ASSETS, 
    label: '资产', 
    enLabel: 'Assets',
    icon: Lucide.Clapperboard, 
    description: '角色、场景、道具模型生成',
    color: 'text-pink-500',
    category: 'creation' 
  },
  { 
    id: NavId.VIDEO, 
    label: '视频', 
    enLabel: 'Video Gen',
    icon: Lucide.Video, 
    description: '文本/图像转高质量视频',
    color: 'text-rose-500',
    category: 'creation' 
  },
  { 
    id: NavId.MANGA_DRAMA, 
    label: '一键生成', 
    enLabel: 'One-click Gen',
    icon: Lucide.Tv, 
    description: '一键生成动态剧',
    color: 'text-emerald-500',
    category: 'creation' 
  },
  { 
    id: NavId.AUTO_EDIT, 
    label: '剪辑', 
    enLabel: 'Auto Edit',
    icon: Lucide.Scissors, 
    description: '智能剪辑与转场',
    color: 'text-orange-500',
    category: 'creation' 
  },
  { 
    id: NavId.AUDIO, 
    label: '音频', 
    enLabel: 'Audio',
    icon: Lucide.Music, 
    description: '配乐生成与音效合成',
    color: 'text-yellow-500',
    category: 'creation' 
  },
  { 
    id: NavId.COLOR, 
    label: '调色', 
    enLabel: 'Color',
    icon: Lucide.Palette, 
    description: '风格化滤镜与AI调色',
    color: 'text-teal-500',
    category: 'creation' 
  },
  { 
    id: NavId.RENDER, 
    label: '出片', 
    enLabel: 'Export',
    icon: Lucide.Film, 
    description: '最终渲染与导出',
    color: 'text-cyan-500',
    category: 'creation' 
  },

  // --- Utility Tools ---
  {
    id: NavId.AI_ANALYSIS,
    label: '一键拉片',
    enLabel: 'AI Analysis',
    icon: Lucide.ScanSearch,
    description: '智能拆解影片结构与镜头',
    color: 'text-red-500',
    category: 'utility'
  },
  {
    id: NavId.SCRIBBLE_IMAGE,
    label: '涂鸦生图',
    enLabel: 'Scribble to Img',
    icon: Lucide.PenLine,
    description: '草图实时转高质量图像',
    color: 'text-pink-400',
    category: 'utility'
  },
  {
    id: NavId.SCRIBBLE_VIDEO,
    label: '涂鸦生视频',
    enLabel: 'Scribble to Vid',
    icon: Lucide.Brush,
    description: '手绘路径生成动态视频',
    color: 'text-fuchsia-500',
    category: 'utility'
  },
  {
    id: NavId.POSE_CONTROL,
    label: '姿态控制',
    enLabel: 'Pose Control',
    icon: Lucide.Accessibility,
    description: '精准控制角色动作与骨骼',
    color: 'text-blue-400',
    category: 'utility'
  },
  {
    id: NavId.THREE_D_GEN,
    label: '3D模型生成',
    enLabel: '3D Gen',
    icon: Lucide.Box,
    description: '文本/图片转3D资产',
    color: 'text-indigo-400',
    category: 'utility'
  },
  {
    id: NavId.VIDEO_MUSIC,
    label: '视频配乐',
    enLabel: 'Video Music',
    icon: Lucide.Music2,
    description: '根据视频内容智能生成配乐',
    color: 'text-amber-500',
    category: 'utility'
  },
  {
    id: NavId.HOKKIEN_DUBBING,
    label: '闽南语配音',
    enLabel: 'Hokkien Dub',
    icon: Lucide.Mic2,
    description: '专业方言语音合成与转换',
    color: 'text-orange-600',
    category: 'utility'
  }
];

export const MOCK_PROJECTS: ProjectPreview[] = [
  { id: '1', title: '赛博朋克：雨夜归人', thumbnail: 'https://picsum.photos/400/225?random=1', author: 'Dr. Zhang', views: '1.2k' },
  { id: '2', title: '古风山水意境', thumbnail: 'https://picsum.photos/400/225?random=2', author: 'ArtLab', views: '856' },
  { id: '3', title: '火星殖民地宣传片', thumbnail: 'https://picsum.photos/400/225?random=3', author: 'SpaceX Fan', views: '3.4k' },
  { id: '4', title: '微观世界：细胞之旅', thumbnail: 'https://picsum.photos/400/225?random=4', author: 'BioMedia', views: '920' },
];
