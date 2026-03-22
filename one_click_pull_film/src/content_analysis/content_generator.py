import os
import sys
import json
import math
import numpy as np
import cv2

# 延迟导入以避免环境冲突
from PIL import Image
from typing import List, Dict, Tuple


class ContentAnalyzer:
    def __init__(self, video_path: str, output_dir: str, device: str | None = None, model_name: str = "ViT-L/14", yolo_weights: str | None = None, clip_root: str | None = None, clip_src: str | None = None):
        self.video_path = video_path
        self.output_dir = output_dir
        self.clip_available = True
        self.model_name = model_name
        self.clip_root = clip_root
        self.clip_src = clip_src
        
        print(f"--- 初始化 ContentAnalyzer ---")
        print(f"视频路径: {self.video_path}")
        
        try:
            import torch as _torch
            self.torch = _torch
            self.device = device or ("cuda" if self.torch.cuda.is_available() else "cpu")
            print(f"使用设备: {self.device} (CUDA 可用: {self.torch.cuda.is_available()})")

            # 尝试导入 clip
            _clip = None
            if self.clip_src and os.path.isdir(self.clip_src):
                print(f"尝试从本地源码加载 CLIP: {os.path.abspath(self.clip_src)}")
                if os.path.abspath(self.clip_src) not in sys.path:
                    sys.path.insert(0, os.path.abspath(self.clip_src))
                try:
                    import clip as _clip
                    print("CLIP 源码导入成功")
                except Exception as e:
                    print(f"CLIP 源码导入失败: {e}")
            
            if _clip is None:
                try:
                    import clip as _clip
                    print("从环境导入 CLIP 成功")
                except Exception:
                    pass

            self.clip = _clip
            
            if self.clip:
                def _clip_filename(name: str) -> str:
                    if name == "ViT-L/14": return "ViT-L-14.pt"
                    if name == "ViT-B/32": return "ViT-B-32.pt"
                    return name.replace("/", "-") + ".pt"

                clip_path = self.model_name
                if self.clip_root:
                    local_path = os.path.join(self.clip_root, _clip_filename(self.model_name))
                    if os.path.exists(local_path):
                        clip_path = local_path
                        print(f"加载本地 CLIP 权重: {os.path.abspath(clip_path)}")
                    else:
                        print(f"未找到本地 CLIP 权重 {local_path}，将尝试在线下载/查找缓存")
                
                self.model, self.preprocess = self.clip.load(clip_path, device=self.device, jit=False)
                print("CLIP 模型加载完成")
            else:
                print("警告: 未能找到 CLIP 模块，视觉分析功能将受限")
                self.clip_available = False

        except Exception as e:
            print(f"CLIP 初始化异常: {e}")
            self.clip_available = False
            self.torch = None
            self.clip = None
            self.device = "cpu"
            self.model = None
            self.preprocess = None

        # YOLO 初始化
        self.yolo = None
        self.yolo_weights = yolo_weights
        try:
            from ultralytics import YOLO
            yolo_path = self.yolo_weights or "yolov8s.pt"
            if os.path.exists(yolo_path):
                print(f"加载本地 YOLO 权重: {os.path.abspath(yolo_path)}")
            else:
                print(f"使用 YOLO 权重: {yolo_path}")
            self.yolo = YOLO(yolo_path)
            print("YOLO 模型加载完成")
        except Exception as e:
            print(f"YOLO 初始化异常: {e}")
            self.yolo = None

        self.cap = cv2.VideoCapture(self.video_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 25.0
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.text_bank = self._build_text_bank()
        self.clip_model_name = self.model_name
        self.yolo_active = self.yolo is not None
        self.yolo_weights_used = self.yolo_weights or "yolov8s.pt"
        self.meta_device = getattr(self, 'device', 'cpu')
        print(f"--- ContentAnalyzer 初始化完成 ---\n")

    def _build_text_bank(self) -> Dict[str, Dict[str, List[Tuple[str, str]]]]:
        shot_types = [
            ("extreme close-up (大特写)", "大特写"),
            ("close-up (特写)", "特写"),
            ("medium close shot (近景)", "近景"),
            ("medium shot (中景)", "中景"),
            ("long shot (全景)", "全景"),
            ("distant shot (远景)", "远景"),
            ("extreme long shot (大远景)", "大远景"),
        ]
        subjects = [
            ("man", "男性"),
            ("woman", "女性"),
            ("child", "儿童"),
            ("animal", "动物"),
            ("car", "汽车"),
            ("building", "建筑"),
            ("landscape", "自然景观"),
            ("portrait", "肖像"),
            ("flower", "花"),
            ("tree", "树"),
        ]
        actions = [
            ("standing", "站立"),
            ("sitting", "坐着"),
            ("walking", "行走"),
            ("running", "奔跑"),
            ("eating", "吃东西"),
            ("sleeping", "睡觉"),
            ("playing", "玩耍"),
            ("talking", "交谈"),
            ("looking", "观看"),
            ("working", "工作"),
        ]
        environments = [
            ("indoor (室内)", "室内"),
            ("outdoor (室外)", "室外"),
            ("city street (城市街道)", "城市街道"),
            ("forest (森林)", "森林"),
            ("mountain (山地)", "山地"),
            ("beach (海滩)", "海滩"),
            ("office (办公室)", "办公室"),
            ("classroom (教室)", "教室"),
            ("home (家居)", "家居"),
            ("night scene (夜景)", "夜景"),
            ("daylight (白天)", "白天"),
        ]
        density = [
            ("no people", "0"),
            ("one person", "0.25"),
            ("two people", "0.5"),
            ("crowd", "0.9"),
        ]
        return {
            "shot_type": {"candidates": shot_types},
            "subject": {"candidates": subjects},
            "action": {"candidates": actions},
            "environment": {"candidates": environments},
            "density": {"candidates": density},
        }

    def _read_frame_at(self, t: float) -> np.ndarray | None:
        idx = max(0, min(self.total_frames - 1, int(round(t * self.fps))))
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = self.cap.read()
        if not ok or frame is None:
            return None
        return frame

    def _to_pil(self, frame: np.ndarray) -> Image.Image:
        return Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    def _brightness(self, frame: np.ndarray) -> float:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        return float(np.clip(np.mean(gray) / 255.0, 0.0, 1.0))

    def _entropy(self, frame: np.ndarray) -> float:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
        p = hist / (np.sum(hist) + 1e-8)
        e = -np.sum(p * np.log2(p + 1e-12))
        return float(np.clip(e / 8.0, 0.0, 1.0))

    def _frame_motion_magnitude(self, f1: np.ndarray, f2: np.ndarray) -> float:
        g1 = cv2.cvtColor(f1, cv2.COLOR_BGR2GRAY)
        g2 = cv2.cvtColor(f2, cv2.COLOR_BGR2GRAY)
        flow = cv2.calcOpticalFlowFarneback(g1, g2, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        return float(np.mean(mag))

    def _burst_time(self, start: float, end: float) -> float:
        n = 6
        ts = np.linspace(start, end, n)
        frames = []
        for t in ts:
            fr = self._read_frame_at(t)
            if fr is None:
                continue
            frames.append((t, fr))
        if len(frames) < 2:
            return (start + end) / 2.0
        mags = []
        for i in range(len(frames) - 1):
            m = self._frame_motion_magnitude(frames[i][1], frames[i + 1][1])
            mags.append((frames[i + 1][0], m))
        if not mags:
            return (start + end) / 2.0
        return max(mags, key=lambda x: x[1])[0]

    def _clip_rank(self, frames: List[np.ndarray], texts: List[str]) -> np.ndarray:
        if not self.clip_available or self.model is None or self.preprocess is None:
            return np.zeros(len(texts), dtype=np.float32)
        images = []
        for fr in frames:
            pil = self._to_pil(fr)
            images.append(self.preprocess(pil).unsqueeze(0))
        image_input = self.torch.cat(images).to(self.device)
        with self.torch.no_grad():
            image_features = self.model.encode_image(image_input)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_tokens = self.clip.tokenize(texts).to(self.device)
        with self.torch.no_grad():
            text_features = self.model.encode_text(text_tokens)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
        sims = (image_features @ text_features.T).float().cpu().numpy()
        return sims.mean(axis=0)

    def _select_top(self, frames: List[np.ndarray], pairs: List[Tuple[str, str]], k: int = 3) -> List[Tuple[str, str, float]]:
        texts = [en for en, _ in pairs]
        scores = self._clip_rank(frames, texts)
        idx = np.argsort(scores)[::-1][:k]
        return [(pairs[i][0], pairs[i][1], float(scores[i])) for i in idx]

    def _map_people_density(self, count: int) -> float:
        if count <= 0:
            return 0.0
        if count == 1:
            return 0.25
        if count == 2:
            return 0.5
        if count <= 5:
            return 0.75
        return 0.9

    def _detect_people_count(self, frame: np.ndarray) -> int:
        if self.yolo is None:
            return -1
        try:
            results = self.yolo.predict(frame, imgsz=640, verbose=False)
            if not results:
                return 0
            r = results[0]
            # class 0 is 'person' in COCO
            cls = r.boxes.cls.cpu().numpy() if hasattr(r, "boxes") else np.array([])
            return int((cls == 0).sum())
        except Exception:
            return -1

    def _estimate_motion(self, f_start: np.ndarray, f_end: np.ndarray) -> Tuple[str, float]:
        gray1 = cv2.cvtColor(f_start, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(f_end, cv2.COLOR_BGR2GRAY)
        orb = cv2.ORB_create(1000)
        k1, d1 = orb.detectAndCompute(gray1, None)
        k2, d2 = orb.detectAndCompute(gray2, None)
        
        # 提高静帧（固定）判定的阈值，使其更容易判定为固定
        STATIC_MAG_THRESHOLD = 0.5
        
        if d1 is None or d2 is None:
            mag = self._frame_motion_magnitude(f_start, f_end)
            if mag < STATIC_MAG_THRESHOLD:
                return "固定", 0.95
            return "移", float(np.clip(mag / 3.0, 0.0, 1.0))
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(d1, d2)
        matches = sorted(matches, key=lambda x: x.distance)[:200]
        if len(matches) < 10:
            mag = self._frame_motion_magnitude(f_start, f_end)
            if mag < STATIC_MAG_THRESHOLD:
                return "固定", 0.9
            return "移", float(np.clip(mag / 3.0, 0.0, 1.0))
        src = np.float32([k1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst = np.float32([k2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
        M, inliers = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=3.0)
        if M is None:
            mag = self._frame_motion_magnitude(f_start, f_end)
            if mag < STATIC_MAG_THRESHOLD:
                return "固定", 0.9
            return "移", float(np.clip(mag / 3.0, 0.0, 1.0))
        a, b, tx = M[0, 0], M[0, 1], M[0, 2]
        c, d, ty = M[1, 0], M[1, 1], M[1, 2]
        scale_x = math.sqrt(a * a + b * b)
        scale_y = math.sqrt(c * c + d * d)
        scale = (scale_x + scale_y) / 2.0
        rot = math.degrees(math.atan2(b, a))
        trans = math.sqrt(tx * tx + ty * ty) / max(1.0, float(self.width + self.height))
        
        # 调整推拉摇移的阈值，减少误判
        SCALE_PUSH_THRESHOLD = 1.05
        SCALE_PULL_THRESHOLD = 0.95
        TRANS_THRESHOLD = 0.05
        
        if scale > SCALE_PUSH_THRESHOLD:
            return "推", float(np.clip((scale - 1.0) * 5.0, 0.0, 1.0))
        if scale < SCALE_PULL_THRESHOLD:
            return "拉", float(np.clip((1.0 - scale) * 5.0, 0.0, 1.0))
        if abs(rot) > 2.0 and trans < TRANS_THRESHOLD:
            return "摇", float(np.clip(abs(rot) / 10.0, 0.0, 1.0))
        if trans >= TRANS_THRESHOLD and abs(rot) < 2.0:
            return "移", float(np.clip(trans * 10.0, 0.0, 1.0))
        
        # 如果都不满足，优先判定为固定，否则为跟
        mag = self._frame_motion_magnitude(f_start, f_end)
        if mag < STATIC_MAG_THRESHOLD:
            return "固定", 0.8
            
        return "跟", 0.6

    def _prompt_from(self, shot_label: str, keywords: List[str], env_label: str, brightness: float) -> str:
        adj = "bright" if brightness >= 0.6 else ("dark" if brightness <= 0.4 else "neutral lighting")
        ks = ", ".join(keywords[:3])
        return f"A {shot_label} of {ks} in {env_label}, {adj}, cinematic."

    def _meta(self) -> Dict:
        meta = {
            "clip_model": self.clip_model_name if self.clip_available else "fallback",
            "device": str(self.meta_device),
            "device_requested": str(self.device_requested) if hasattr(self, "device_requested") else "",
            "yolo_active": bool(self.yolo_active),
            "yolo_weights": str(self.yolo_weights_used) if self.yolo_active else "",
            "python_executable": sys.executable,
        }
        if self.clip_root:
            meta["clip_download_root"] = str(self.clip_root)
            try:
                def _clip_filename(name: str) -> str:
                    if name == "ViT-L/14":
                        return "ViT-L-14.pt"
                    if name == "ViT-B/32":
                        return "ViT-B-32.pt"
                    return name.replace("/", "-") + ".pt"
                expected = os.path.join(self.clip_root, _clip_filename(self.model_name))
                meta["clip_weight_file_exists"] = bool(os.path.exists(expected))
                meta["clip_weight_file"] = expected
            except Exception:
                meta["clip_weight_file_exists"] = False
                meta["clip_weight_file"] = ""
        if self.torch is not None:
            try:
                meta["cuda_available"] = bool(self.torch.cuda.is_available())
                meta["cuda_device_count"] = int(self.torch.cuda.device_count())
                meta["cuda_version"] = str(getattr(self.torch.version, "cuda", ""))
                if self.torch.cuda.is_available():
                    meta["cuda_current_device"] = int(self.torch.cuda.current_device())
                    meta["cuda_device_name"] = str(self.torch.cuda.get_device_name(meta["cuda_current_device"]))
            except Exception:
                pass
        try:
            import clip as _clip_mod
            meta["clip_module_file"] = getattr(_clip_mod, "__file__", "")
        except Exception:
            meta["clip_module_file"] = ""
        if self.clip_src:
            meta["clip_src"] = str(self.clip_src)
        return meta

    def analyze_scene(self, scene_index: int, start: float, end: float) -> Dict:
        t_start = start
        t_end = end
        t_burst = self._burst_time(start, end)
        f_start = self._read_frame_at(t_start)
        f_burst = self._read_frame_at(t_burst)
        f_end = self._read_frame_at(t_end)
        frames = [fr for fr in [f_start, f_burst, f_end] if fr is not None]
        if not frames:
            return {
                "scene_index": scene_index,
                "timestamp": [round(start, 1), round(end, 1)],
                "error": "no_frames",
            }
        b_vals = [self._brightness(fr) for fr in frames]
        e_vals = [self._entropy(fr) for fr in frames]
        brightness = float(np.mean(b_vals))
        entropy = float(np.mean(e_vals))
        motion_mag = self._frame_motion_magnitude(frames[0], frames[-1])
        tension = float(np.clip(0.6 * (motion_mag / 3.0) + 0.4 * entropy, 0.0, 1.0))
        
        # 人数检测
        people_counts = [self._detect_people_count(fr) for fr in frames]
        valid_counts = [c for c in people_counts if c >= 0]
        
        count_label = "未知"
        avg_count = 0
        people_density_det = None
        
        if valid_counts:
            avg_count = int(round(np.mean(valid_counts)))
            people_density_det = self._map_people_density(avg_count)
            if avg_count <= 0:
                count_label = "无人"
            elif avg_count == 1:
                count_label = "单人"
            elif avg_count == 2:
                count_label = "双人"
            else:
                count_label = "多人"
        else:
            # 如果YOLO失败，默认逻辑
            if entropy < 0.35:
                count_label = "单人" 
                avg_count = 1
            else:
                count_label = "多人"
                avg_count = 3
        
        subject_labels_zh = []
        action_labels_zh = []
        shot_label_zh = "中景"
        env_label_zh = "室外"
        motion_type = "固定"
        
        if self.clip_available:
            shot_top = self._select_top(frames, self.text_bank["shot_type"]["candidates"], k=1)
            subject_top = self._select_top(frames, self.text_bank["subject"]["candidates"], k=5) # 取前5个主体
            action_top = self._select_top(frames, self.text_bank["action"]["candidates"], k=1)
            env_top = self._select_top(frames, self.text_bank["environment"]["candidates"], k=1)
            density_top = self._select_top(frames, self.text_bank["density"]["candidates"], k=1)
            
            shot_label_en, shot_label_zh, _ = shot_top[0]
            env_label_en, env_label_zh, _ = env_top[0]
            action_label_en, action_label_zh, _ = action_top[0]
            
            # 处理主体逻辑
            raw_subjects = [zh for _, zh, _ in subject_top]
            # 过滤逻辑：
            # 1. 如果 count_label 是 "无人"，过滤掉人相关的 (男性, 女性, 儿童, 肖像)
            
            person_related = {"男性", "女性", "儿童", "肖像"}
            
            final_subjects = []
            
            for s in raw_subjects:
                if count_label == "无人" and s in person_related:
                    continue
                final_subjects.append(s)
            
            # 如果过滤后为空，但count_label不是无人，尝试补回人
            if not final_subjects and count_label != "无人":
                # 找回原本检测到的最高分的人
                for s in raw_subjects:
                    if s in person_related:
                        final_subjects.append(s)
                        break
            
            # 限制数量，比如取前3个
            subject_labels_zh = final_subjects[:3]
            if not subject_labels_zh and count_label != "无人":
                 subject_labels_zh = ["人物"] # 兜底
                 
            action_labels_zh = [action_label_zh]

            try:
                people_density_clip = float(density_top[0][1])
            except Exception:
                people_density_clip = 0.5
            people_density = people_density_det if people_density_det is not None else people_density_clip
            
        else:
            # Fallback logic
            shot_label_en, shot_label_zh = "medium shot", "中景"
            env_label_en, env_label_zh = ("outdoor", "室外") if brightness > 0.55 else ("indoor", "室内")
            people_density = 0.25 if count_label == "单人" else 0.9
            subject_labels_zh = ["人物"] if count_label != "无人" else ["景物"]
            action_labels_zh = []

        motion_type, motion_conf = self._estimate_motion(frames[0], frames[-1])
        
        zh2en = {"无人": "no people", "单人": "one person", "双人": "two people", "多人": "group of people"}
        subj_en = [zh2en.get(s, "subject") for s in subject_labels_zh]
        
        prompt = self._prompt_from(shot_label_en, subj_en, env_label_en, brightness)
        
        # 构造 Summary
        # summary: 景别：中景；主体：男性、女性、儿童；数量：多人；动作：行走；环境：室外；明暗：0.5；张力：0.6；运动：固定
        summary_parts = []
        summary_parts.append(f"景别：{shot_label_zh}")
        summary_parts.append(f"主体：{'、'.join(subject_labels_zh)}")
        summary_parts.append(f"数量：{count_label}")
        if action_labels_zh:
            summary_parts.append(f"动作：{'、'.join(action_labels_zh)}")
        summary_parts.append(f"环境：{env_label_zh}")
        summary_parts.append(f"明暗：{round(brightness,3)}")
        summary_parts.append(f"张力：{round(tension,3)}")
        summary_parts.append(f"运动：{motion_type}")
        
        summary = "；".join(summary_parts)
        
        # 构造返回字典 (移除 title, tags)
        return {
            "scene_index": scene_index,
            "timestamp": [round(start, 1), round(end, 1)],
            "shot_type": shot_label_zh,
            "count": count_label,           # 新增
            "subject": subject_labels_zh,   # 修改为列表
            "action": action_labels_zh,     # 新增
            "keywords": subject_labels_zh + action_labels_zh, # 语义上的 tags
            "people_density": round(float(people_density), 3),
            "environment": env_label_zh,
            "brightness": round(brightness, 3),
            "tension": round(tension, 3),
            "motion_type": motion_type,
            # "title": title, # 移除
            "summary": summary,
            # "tags": tags,   # 移除
            "prompt": prompt,
            "frames": {
                "start_time": round(t_start, 2),
                "burst_time": round(t_burst, 2),
                "end_time": round(t_end, 2),
            }
        }

    def process(self) -> List[Dict]:
        scene_json = os.path.join(self.output_dir, "scene_split.json")
        if not os.path.exists(scene_json):
            return []
        with open(scene_json, "r", encoding="utf-8") as f:
            scenes = json.load(f)
        results = []
        for sc in scenes:
            idx = sc.get("scene_index")
            start = float(sc.get("start", 0.0))
            end = float(sc.get("end", start))
            res = self.analyze_scene(idx, start, end)
            results.append(res)
        out_path = os.path.join(self.output_dir, "content_analysis.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        return results
