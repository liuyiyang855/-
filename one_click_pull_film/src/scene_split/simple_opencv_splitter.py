import os
import json
import cv2
import numpy as np


class SimpleOpenCVSplitter:
    def __init__(self, video_path: str, output_dir: str, diff_threshold: float = 0.25, sample_fps: float = 4.0):
        self.video_path = video_path
        self.output_dir = output_dir
        self.diff_threshold = float(diff_threshold)
        self.sample_fps = float(sample_fps)

    def _hist(self, frame: np.ndarray) -> np.ndarray:
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        h_hist = cv2.calcHist([hsv], [0], None, [32], [0, 180])
        s_hist = cv2.calcHist([hsv], [1], None, [32], [0, 256])
        v_hist = cv2.calcHist([hsv], [2], None, [32], [0, 256])
        hist = np.concatenate([h_hist, s_hist, v_hist], axis=0).flatten()
        hist = hist / (np.sum(hist) + 1e-8)
        return hist.astype(np.float32)

    def _diff(self, h1: np.ndarray, h2: np.ndarray) -> float:
        return 1.0 - float(cv2.compareHist(h1, h2, cv2.HISTCMP_CORREL))

    def detect_scenes(self):
        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            return []
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        step = max(1, int(round(fps / self.sample_fps)))
        prev_hist = None
        boundaries = [0]
        diffs = []
        for idx in range(0, total, step):
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ok, frame = cap.read()
            if not ok or frame is None:
                continue
            h = self._hist(frame)
            if prev_hist is not None:
                d = self._diff(prev_hist, h)
                diffs.append(d)
                if d >= self.diff_threshold:
                    boundaries.append(idx)
            prev_hist = h
        cap.release()
        if boundaries[-1] != total - 1:
            boundaries.append(total - 1)
        boundaries = sorted(set(boundaries))
        scenes = []
        for i in range(len(boundaries) - 1):
            start_idx = boundaries[i]
            end_idx = boundaries[i + 1]
            start_t = round(start_idx / fps, 1)
            end_t = round(end_idx / fps, 1)
            if end_t <= start_t:
                continue
            scenes.append({
                "scene_index": i + 1,
                "start": start_t,
                "end": end_t
            })
        out_path = os.path.join(self.output_dir, "scene_split.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(scenes, f, ensure_ascii=False, indent=2)
        return scenes

    def process(self):
        return self.detect_scenes()
