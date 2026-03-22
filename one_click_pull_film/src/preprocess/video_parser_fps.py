import os
import json
import subprocess
from pathlib import Path


class VideoParserFPS:
    def __init__(self, video_path, output_dir, fps=1):
        """
        视频解析器 - FPS抽帧方法
        :param video_path: 输入视频路径
        :param output_dir: 输出目录
        :param fps: 抽帧率，默认为1fps
        """
        self.video_path = video_path
        self.output_dir = output_dir
        self.fps = fps
        self.frames_dir = os.path.join(output_dir, "frames")
        
        # 创建输出目录
        os.makedirs(self.frames_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

    def extract_frames(self):
        """使用FFmpeg按指定FPS抽帧"""
        frame_pattern = os.path.join(self.frames_dir, "frame_%06d.jpg")
        cmd = [
            "ffmpeg",
            "-i", self.video_path,
            "-vf", f"fps={self.fps}",
            "-q:v", "2",  # 图片质量，数值越小质量越高
            frame_pattern
        ]
        
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"帧抽取完成，FPS: {self.fps}")
        except subprocess.CalledProcessError as e:
            print(f"帧抽取失败: {e}")
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
        """生成时间轴信息"""
        frames = sorted([f for f in os.listdir(self.frames_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        timeline = []
        
        for i, frame in enumerate(frames):
            timestamp = round(i / self.fps, 1)  # 保留1位小数
            timeline.append({
                "frame": frame,
                "timestamp": timestamp
            })
        
        timeline_path = os.path.join(self.output_dir, "timeline.json")
        with open(timeline_path, 'w', encoding='utf-8') as f:
            json.dump(timeline, f, ensure_ascii=False, indent=2)
        
        print(f"时间轴信息生成完成，共 {len(frames)} 帧")
        return timeline

    def process(self):
        """执行完整的预处理流程"""
        print(f"开始处理视频: {self.video_path}")
        
        # 抽帧
        self.extract_frames()
        
        # 提取音频
        self.extract_audio()
        
        # 生成时间轴
        self.generate_timeline()
        
        print(f"预处理完成，输出目录: {self.output_dir}")


if __name__ == "__main__":
    # 示例用法
    video_path = "../input/test1.mp4"  # 示例视频路径
    output_dir = "../output/test1"    # 输出目录
    
    parser = VideoParserFPS(video_path, output_dir, fps=1)  # 可以修改FPS参数
    parser.process()