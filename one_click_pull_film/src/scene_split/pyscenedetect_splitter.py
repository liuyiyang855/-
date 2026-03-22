import os
import json
from scenedetect import open_video, SceneManager, StatsManager
from scenedetect.detectors import ContentDetector


class PySceneDetectSplitter:
    def __init__(self, video_path, output_dir, threshold=30.0):
        """
        使用PySceneDetect进行镜头切分
        :param video_path: 输入视频路径
        :param output_dir: 输出目录
        :param threshold: 检测阈值，默认为30.0
        """
        self.video_path = video_path
        self.output_dir = output_dir
        self.threshold = threshold

    def detect_scenes(self):
        """检测视频中的场景变化"""
        # 打开视频
        video = open_video(self.video_path)

        # 创建场景管理器
        stats_manager = StatsManager()
        scene_manager = SceneManager(stats_manager)

        # 添加内容检测器
        scene_manager.add_detector(ContentDetector(threshold=self.threshold))

        # 检测场景
        num_scenes = scene_manager.detect_scenes(video)

        # 获取场景列表
        scene_list = scene_manager.get_scene_list()

        # 转换为所需格式并保留1位小数
        scenes = []
        for i, (start_time, end_time) in enumerate(scene_list):
            scene_info = {
                "scene_index": i + 1,
                "start": round(start_time.get_seconds(), 1),  # 保留1位小数
                "end": round(end_time.get_seconds(), 1)      # 保留1位小数
            }
            scenes.append(scene_info)

        # 保存结果到JSON文件
        output_path = os.path.join(self.output_dir, "scene_split.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(scenes, f, ensure_ascii=False, indent=2)

        print(f"镜头切分完成，共检测到 {len(scenes)} 个场景")
        return scenes

    def process(self):
        """执行完整的镜头切分流程"""
        print(f"开始镜头切分: {self.video_path}")
        
        scenes = self.detect_scenes()
        
        print(f"镜头切分完成，结果保存至: {os.path.join(self.output_dir, 'scene_split.json')}")
        return scenes


if __name__ == "__main__":
    # 示例用法
    video_path = "../../input/test1.mp4"  # 示例视频路径
    output_dir = "../../output/test1"    # 输出目录
    
    splitter = PySceneDetectSplitter(video_path, output_dir)
    splitter.process()