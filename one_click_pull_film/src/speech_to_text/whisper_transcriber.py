import whisper
import os
import json
import torch

class WhisperTranscriber:
    def __init__(self, model_size="base"):
        # 检查设备
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"正在加载 Whisper 模型: {model_size}，使用设备: {device}...")
        self.model = whisper.load_model(model_size, device=device)

    def transcribe(self, video_name, output_base_path="../output"):
        """
        输入: video_name (如 test1.mp4)
        输出: 在 output/test1/ 目录下生成 transcript.json
        """
        # 1. 构建路径
        folder_name = os.path.splitext(video_name)[0]
        target_folder = os.path.join(output_base_path, folder_name)
        
        audio_path = os.path.join(target_folder, "audio.wav")
        output_json_path = os.path.join(target_folder, "transcript.json")

        # 2. 检查音频是否存在
        if not os.path.exists(audio_path):
            print(f"[错误] 找不到音频文件: {audio_path}")
            return

        print(f"开始转录: {audio_path}")
        
        # 3. 运行模型
        result = self.model.transcribe(audio_path)

        # 4. 格式化输出 (PDF要求: 保留1位小数)
        formatted_segments = []
        for segment in result['segments']:
            formatted_segments.append({
                "start": round(segment['start'], 1),
                "end": round(segment['end'], 1),
                "text": segment['text'].strip()
            })

        # 5. 保存结果
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(formatted_segments, f, ensure_ascii=False, indent=4)
        print(f"[成功] 结果已保存至: {output_json_path}")

# --- 测试入口 ---
if __name__ == "__main__":
    # 1. 自动获取当前脚本所在的绝对路径
    # 例如：/workspace/one_click_pull_film/src/speech_to_text/whisper_transcriber.py
    current_script_path = os.path.abspath(__file__)
    
    # 2. 获取项目根目录 (向上退两层：speech_to_text -> src -> 项目根目录)
    # 这样不管你在哪个目录下运行，project_root 永远是 /workspace/one_click_pull_film
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_script_path)))
    
    # 3. 拼接出 output 的绝对路径
    absolute_output_path = os.path.join(project_root, "output")
    
    # 实例化并运行
    transcriber = WhisperTranscriber(model_size="base")
    
    # 使用绝对路径，这样无论在哪运行都不会报错了
    transcriber.transcribe("test1.mp4", output_base_path=absolute_output_path)