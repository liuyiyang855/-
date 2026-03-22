import os
import json
import subprocess
import re
from pathlib import Path


class VideoParserKeyFrame:
    def __init__(self, video_path, output_dir):
        """
        视频解析器 - 关键帧抽帧方法
        :param video_path: 输入视频路径
        :param output_dir: 输出目录
        """
        self.video_path = video_path
        self.output_dir = output_dir
        self.frames_dir = os.path.join(output_dir, "frames")
        
        # 创建输出目录
        os.makedirs(self.frames_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

    def extract_keyframes(self):
        """使用FFmpeg提取关键帧"""
        frame_pattern = os.path.join(self.frames_dir, "keyframe_%06d.jpg")
        cmd = [
            "ffmpeg",
            "-i", self.video_path,
            "-vf", "select='eq(pict_type,I)'",  # 选择I帧（关键帧）
            "-vsync", "vfr",  # 变帧率输出
            frame_pattern
        ]
        
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("关键帧抽取完成")
        except subprocess.CalledProcessError as e:
            print(f"关键帧抽取失败: {e}")
            raise

    def extract_audio(self, audio_format="wav"):
        """提取音频文件"""
        audio_path = os.path.join(self.output_dir, f"audio.{audio_format}")
        cmd = [
            "ffmpeg",
            "-i", self.video_path,
            "-q:a", "0",
            "-map", "a",  # 只映射音频流
            audio_path
        ]
        
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("音频提取完成")
        except subprocess.CalledProcessError as e:
            print(f"音频提取失败: {e}")
            # 如果视频没有音频，创建一个静音音频文件
            self.create_silence_audio(audio_path)

    def create_silence_audio(self, audio_path):
        """如果原视频没有音频，创建静音音频文件"""
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", "anullsrc=r=44100:cl=stereo",
            "-t", "0.1",  # 0.1秒的静音
            "-q:a", "0",
            audio_path
        ]
        
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("创建静音音频文件")
        except subprocess.CalledProcessError as e:
            print(f"创建静音音频失败: {e}")

    def generate_timeline(self):
        """生成时间轴信息，通过ffprobe获取关键帧时间戳"""
        # 使用ffprobe获取关键帧的时间信息
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-show_entries", "packet=pts_time,flags",
            "-select_streams", "v",
            "-of", "csv=p=0",
            self.video_path
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            lines = result.stdout.strip().split('\n')
            
            keyframes_data = []
            for line in lines:
                if line:
                    parts = line.split(',')
                    if len(parts) >= 2:
                        pts_time_str, flags = parts[0].strip(), parts[1].strip()
                        if 'K_' in flags:  # 关键帧标记
                            try:
                                timestamp = round(float(pts_time_str), 1)  # 保留1位小数
                                keyframes_data.append(timestamp)
                            except ValueError:
                                continue
            
            # 获取实际生成的关键帧文件列表
            frames = sorted([f for f in os.listdir(self.frames_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            
            # 将时间戳与帧文件关联
            timeline = []
            for i, frame in enumerate(frames):
                if i < len(keyframes_data):
                    timestamp = keyframes_data[i]
                else:
                    # 如果无法获取精确时间戳，使用估算值
                    timestamp = round(i * 2.0, 1)  # 假设关键帧平均间隔为2秒
                
                timeline.append({
                    "frame": frame,
                    "timestamp": timestamp
                })
            
            timeline_path = os.path.join(self.output_dir, "timeline.json")
            with open(timeline_path, 'w', encoding='utf-8') as f:
                json.dump(timeline, f, ensure_ascii=False, indent=2)
            
            print(f"时间轴信息生成完成，共 {len(frames)} 帧")
            return timeline
            
        except subprocess.CalledProcessError as e:
            print(f"获取关键帧时间戳失败: {e}")
            # 如果无法获取准确时间戳，使用替代方案
            return self._generate_approximate_timeline()

    def _generate_approximate_timeline(self):
        """当无法获取准确关键帧时间戳时，生成近似时间轴"""
        frames = sorted([f for f in os.listdir(self.frames_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        timeline = []
        
        # 使用视频总长度估算关键帧分布
        duration = self._get_video_duration()
        if duration > 0 and len(frames) > 1:
            avg_interval = duration / len(frames)
        else:
            avg_interval = 2.0  # 默认2秒间隔
        
        for i, frame in enumerate(frames):
            timestamp = round(i * avg_interval, 1)  # 保留1位小数
            timeline.append({
                "frame": frame,
                "timestamp": timestamp
            })
        
        timeline_path = os.path.join(self.output_dir, "timeline.json")
        with open(timeline_path, 'w', encoding='utf-8') as f:
            json.dump(timeline, f, ensure_ascii=False, indent=2)
        
        print(f"近似时间轴信息生成完成，共 {len(frames)} 帧")
        return timeline

    def _get_video_duration(self):
        """获取视频总时长"""
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-show_entries", "format=duration",
            "-of", "csv=p=0",
            self.video_path
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            duration_str = result.stdout.strip()
            return float(duration_str) if duration_str != 'N/A' else 0
        except (subprocess.CalledProcessError, ValueError):
            return 0

    def process(self):
        """执行完整的预处理流程"""
        print(f"开始处理视频: {self.video_path}")
        
        # 抽取关键帧
        self.extract_keyframes()
        
        # 提取音频
        self.extract_audio()
        
        # 生成时间轴
        self.generate_timeline()
        
        print(f"预处理完成，输出目录: {self.output_dir}")


if __name__ == "__main__":
    # 示例用法
    video_path = "../input/test1.mp4"  # 示例视频路径
    output_dir = "../output/test1"    # 输出目录
    
    parser = VideoParserKeyFrame(video_path, output_dir)
    parser.process()