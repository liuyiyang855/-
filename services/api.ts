
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
   * 真实的视频拉片分析接口：上传视频 -> 轮询状态 -> 获取结果
   */
  async analyzeVideo(file: File): Promise<ShotAnalysis[]> {
    console.log('正在上传视频并请求后端接口: /api/upload...', { fileName: file.name });
    
    // 1. 上传视频文件
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
        throw new Error(`上传失败: ${uploadRes.statusText}`);
    }
    
    const uploadData = await uploadRes.json();
    if (uploadData.code !== 200) {
        throw new Error(`上传处理失败: ${uploadData.msg}`);
    }
    
    const taskId = uploadData.data.task_id;
    console.log(`上传成功，任务ID: ${taskId}，开始轮询进度...`);
    
    // 2. 轮询状态直到 completed 或 failed
    while (true) {
        await delay(2000); // 每2秒轮询一次
        
        const statusRes = await fetch(`/api/status/${taskId}`);
        if (!statusRes.ok) continue;
        
        const statusData = await statusRes.json();
        const status = statusData.data.status;
        
        console.log(`任务 ${taskId} 当前状态: ${status}`);
        
        if (status === 'failed') {
            throw new Error(`后台处理失败: ${statusData.data.error || '未知错误'}`);
        }
        
        if (status === 'completed') {
            break;
        }
    }
    
    // 3. 任务完成后，获取组装好的结果
    console.log(`任务 ${taskId} 完成，正在获取最终拉片结果...`);
    const resultRes = await fetch(`/api/result/${taskId}`);
    if (!resultRes.ok) {
        throw new Error(`获取结果失败: ${resultRes.statusText}`);
    }
    
    const resultData = await resultRes.json();
    if (resultData.code !== 200) {
        throw new Error(`处理结果返回错误: ${resultData.msg}`);
    }
    
    return resultData.data as ShotAnalysis[];
  }
};
