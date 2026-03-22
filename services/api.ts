
import { NavId } from '../types';

/**
 * 模拟后端 API 服务层
 */

export interface UserInfo {
  id: string;
  name: string;
  role: string;
  avatar: string;
  credits: number;
}

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthService = {
  /**
   * 模拟登录接口
   */
  async login(username: string, password: string): Promise<{ success: boolean; user?: UserInfo }> {
    console.log('正在请求后端接口: /api/auth/login...', { username });
    await delay(1200); // 模拟网络延迟

    // 这里是模拟逻辑：只要不为空就登录成功
    if (username && password) {
      return {
        success: true,
        user: {
          id: 'u12345',
          name: '厦门大学智影实验室',
          role: 'PRO 账户',
          avatar: '厦',
          credits: 4280
        }
      };
    }
    return { success: false };
  },

  /**
   * 模拟注销接口
   */
  async logout(): Promise<boolean> {
    console.log('正在请求后端接口: /api/auth/logout...');
    await delay(500);
    return true;
  }
};

export interface ShotAnalysis {
  id: number;
  timecode: string;
  shotType: string;
  movement: string;
  description: string;
  audio: string;
  thumbnail: string;
}

export const FilmAnalysisService = {
  /**
   * 模拟视频拉片分析接口
   */
  async analyzeVideo(file: File): Promise<ShotAnalysis[]> {
    console.log('正在请求后端接口: /api/analysis/video...', { fileName: file.name });
    await delay(3000); // 模拟深度学习分析耗时

    // 返回模拟的拉片数据
    return [
      {
        id: 1,
        timecode: '00:00:00 - 00:00:05',
        shotType: '全景 (Wide Shot)',
        movement: '固定 (Static)',
        description: '厦门大学嘉庚建筑群全景，阳光明媚，海风轻拂。',
        audio: '海浪声，轻柔的背景音乐。',
        thumbnail: 'https://picsum.photos/seed/shot1/200/112'
      },
      {
        id: 2,
        timecode: '00:00:05 - 00:00:12',
        shotType: '中景 (Medium Shot)',
        movement: '推 (Dolly In)',
        description: '学生在图书馆前走动，充满活力。',
        audio: '环境人声，脚步声。',
        thumbnail: 'https://picsum.photos/seed/shot2/200/112'
      },
      {
        id: 3,
        timecode: '00:00:12 - 00:00:18',
        shotType: '特写 (Close-up)',
        movement: '移 (Pan)',
        description: '一本翻开的书籍，文字清晰可见。',
        audio: '翻书声。',
        thumbnail: 'https://picsum.photos/seed/shot3/200/112'
      },
      {
        id: 4,
        timecode: '00:00:18 - 00:00:25',
        shotType: '远景 (Extreme Wide)',
        movement: '航拍 (Drone)',
        description: '演武大桥与双子塔，展现城市地标。',
        audio: '城市远处的喧嚣。',
        thumbnail: 'https://picsum.photos/seed/shot4/200/112'
      },
      {
        id: 5,
        timecode: '00:00:25 - 00:00:30',
        shotType: '近景 (Close Shot)',
        movement: '拉 (Dolly Out)',
        description: '一位教授在讲台上授课，神情专注。',
        audio: '教授的讲课声。',
        thumbnail: 'https://picsum.photos/seed/shot5/200/112'
      }
    ];
  }
};
