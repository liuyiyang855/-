
export enum NavId {
  HOME = 'home',
  SCRIPT = 'script',
  STORYBOARD = 'storyboard',
  ASSETS = 'assets',
  VIDEO = 'video',
  AUTO_EDIT = 'auto_edit',
  MANGA_DRAMA = 'manga_drama',
  AUDIO = 'audio',
  COLOR = 'color',
  RENDER = 'render',
  SETTINGS = 'settings',
  LOGOUT = 'logout',
  PROFILE = 'profile',
  
  // New Utility Tools
  AI_ANALYSIS = 'ai_analysis',
  SCRIBBLE_IMAGE = 'scribble_image',
  SCRIBBLE_VIDEO = 'scribble_video',
  POSE_CONTROL = 'pose_control',
  THREE_D_GEN = 'three_d_gen',
  VIDEO_MUSIC = 'video_music',
  HOKKIEN_DUBBING = 'hokkien_dubbing'
}

export interface NavItem {
  id: NavId;
  label: string;
  enLabel: string;
  icon: any;
  description: string;
  color: string;
  category?: 'creation' | 'utility' | 'system';
}

export interface TaskStatus {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  module: NavId;
}

export interface ProjectPreview {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  views: string;
}
