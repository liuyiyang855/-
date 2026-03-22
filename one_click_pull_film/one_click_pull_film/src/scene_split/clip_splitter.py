import torch
import clip
import cv2
from PIL import Image
import numpy as np
import json
import os
from tqdm import tqdm

class ClipSceneSplitter:
    def __init__(self, model_name="ViT-B/32", threshold=0.15):
        """
        初始化
        threshold: 判定切镜头的阈值(0-1)。推荐 0.15-0.2。值越大越难切分。
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"正在加载 CLIP 模型: {model_name}，使用设备: {self.device}...")
        try:
            # 加载 CLIP 模型
            self.model, self.preprocess = clip.load(model_name, device=self.device)
        except Exception as e:
            print(f"模型加载失败，请确保已安装 git+https://github.com/openai/CLIP.git")
            raise e
            
        self.threshold = threshold

    def get_frame_embeddings(self, video_path, sample_rate=5):
        """
        每隔 sample_rate 帧抽取一张，计算 Embedding
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"错误：无法打开视频 {video_path}")
            return None, None

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        embeddings = []
        timestamps = [] 

        print(f"开始提取特征 (Total frames: {total_frames})...")
        pbar = tqdm(total=total_frames)
        
        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # 抽帧处理
            if frame_idx % sample_rate == 0:
                # 转换格式 BGR -> RGB -> PIL
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image = Image.fromarray(image)

                # 预处理并计算特征
                image_input = self.preprocess(image).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    image_features = self.model.encode_image(image_input)
                    image_features /= image_features.norm(dim=-1, keepdim=True)
                
                embeddings.append(image_features.cpu().numpy())
                timestamps.append(frame_idx / fps)

            frame_idx += 1
            pbar.update(1)

        cap.release()
        pbar.close()

        if not embeddings:
            return None, None
            
        return np.vstack(embeddings), timestamps, fps, total_frames/fps

    def detect_scenes(self, video_name, input_base_path="../../input", output_base_path="../../output"):
        # 1. 路径准备
        video_path = os.path.join(input_base_path, video_name)
        folder_name = os.path.splitext(video_name)[0]
        output_folder = os.path.join(output_base_path, folder_name)
        
        # 为了不覆盖队友的结果，我们暂时命名为 scene_split_clip.json，对比完再改名
        json_path = os.path.join(output_folder, "scene_split_clip.json")

        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # 2. 计算特征 (sample_rate=8 兼顾速度和精度)
        embeddings, timestamps, fps, duration = self.get_frame_embeddings(video_path, sample_rate=8)
        
        if embeddings is None:
            return

        print("正在计算相邻帧相似度...")
        
        # 3. 计算余弦距离 (1 - 相似度)
        # 矩阵错位点积：第i帧 * 第i+1帧
        sims = np.sum(embeddings[:-1] * embeddings[1:], axis=1)
        dists = 1.0 - sims 

        # 4. 根据阈值切分
        scene_cuts = [0.0]
        for i, dist in enumerate(dists):
            if dist > self.threshold:
                cut_time = timestamps[i+1]
                # 过滤掉小于 1 秒的极短镜头
                if cut_time - scene_cuts[-1] > 1.0:
                    scene_cuts.append(cut_time)
        
        # 加上结尾
        if duration - scene_cuts[-1] > 0.5:
            scene_cuts.append(duration)
        else:
            scene_cuts[-1] = duration

        # 5. 格式化输出
        scenes_data = []
        for i in range(len(scene_cuts) - 1):
            scenes_data.append({
                "scene_index": i + 1,
                "start": round(scene_cuts[i], 1),
                "end": round(scene_cuts[i+1], 1)
            })

        # 6. 保存
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(scenes_data, f, ensure_ascii=False, indent=4)
        
        print(f"[CLIP Splitter] 完成！共 {len(scenes_data)} 个镜头。")
        print(f"结果已保存至: {json_path}")

# --- 测试入口 ---
if __name__ == "__main__":
    # 自动获取路径
    current_path = os.path.abspath(__file__)
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_path)))
    input_path = os.path.join(project_root, "input")
    output_path = os.path.join(project_root, "output")
    
    # 实例化
    splitter = ClipSceneSplitter(threshold=0.15)
    
    # 确保 input 下有 test1.mp4
    splitter.detect_scenes("test1.mp4", input_base_path=input_path, output_base_path=output_path)