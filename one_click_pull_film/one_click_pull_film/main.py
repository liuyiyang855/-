import os
import sys
from src.preprocess.video_parser_fps import VideoParserFPS
from src.preprocess.video_parser_keyframe import VideoParserKeyFrame
from src.content_analysis.content_generator import ContentAnalyzer
from src.scene_split.simple_opencv_splitter import SimpleOpenCVSplitter
import sys

def main(video_name, method="fps", fps=1, threshold=30.0,whisper_model="base"):
    """
    主函数
    :param video_name: 需要处理的视频文件名，如 "test1.mp4"
    :param method: 处理方法，"fps" 或 "keyframe"
    :param fps: FPS抽帧时的帧率
    :param threshold: 场景检测的阈值
    :param whisper_model: whisper模型大小，可选base/small/medium，base轻量速度快
    """
    # 定义输入输出路径
    input_path = os.path.join("input", video_name)
    video_base_name = os.path.splitext(video_name)[0]  # 获取不带扩展名的文件名
    output_dir = os.path.join("output", video_base_name)  # 根据要求：以视频名命名的目录
    
    # 检查输入视频是否存在
    if not os.path.exists(input_path):
        print(f"错误: 输入视频不存在 - {input_path}")
        sys.exit(1)
    
    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"开始处理视频: {video_name}")
    print(f"输出目录: {output_dir}")
    print(f"使用Whisper模型: {whisper_model}")
    
    # 步骤1: 视频预处理
    print("\n步骤1: 视频预处理...")
    
    if method == "fps":
        parser = VideoParserFPS(input_path, output_dir, fps=fps)
    elif method == "keyframe":
        parser = VideoParserKeyFrame(input_path, output_dir)
    else:
        print(f"错误: 不支持的方法 - {method}")
        sys.exit(1)
    
    # 执行预处理
    parser.process()
    
    # 步骤2: 镜头/片段切分
    print("\n步骤2: 镜头/片段切分...")
    
    try:
        from src.scene_split.pyscenedetect_splitter import PySceneDetectSplitter
        splitter = PySceneDetectSplitter(input_path, output_dir, threshold=threshold)
        splitter.process()
    except Exception as e:
        print(f"PySceneDetect失败，启用OpenCV回退: {e}")
        fallback_splitter = SimpleOpenCVSplitter(input_path, output_dir, diff_threshold=0.25, sample_fps=4.0)
        fallback_splitter.process()
    
    print("\n步骤3: 内容理解与标签生成...")
    try:
        sys.path = [p for p in sys.path if "anaconda" not in p.lower()]
        analyzer = ContentAnalyzer(input_path, output_dir)
        analyzer.process()
    except Exception as e:
        print(f"内容分析失败: {e}")
    
    print("步骤4: 音频转文字...")
    try:
        sys.path = [p for p in sys.path if "anaconda" not in p.lower()]
        from src.speech_to_text.whisper_transcriber import WhisperTranscriber
        transcriber = WhisperTranscriber(model_size=whisper_model)
        # 调用转录方法，传入视频名+项目根目录的output绝对路径（避免路径错误）
        # 这里用os.getcwd()获取项目根目录，适配任意运行路径
        transcriber.transcribe(video_name, output_base_path=os.path.join(os.getcwd(), "output"))
    except Exception as e:
        print(f"音频转文字失败: {e}")
        print("跳过音频转写，继续完成其余流程")
    
    print(f"\n处理完成! 结果保存在: {output_dir}")


if __name__ == "__main__":
    # 示例：处理名为 test1.mp4 的视频
    # 可以通过命令行参数传入视频名称，或直接在此处设置
    video_name = "test1.mp4"  # 修改这里来处理不同的视频
    
    # 选择处理方法: "fps" 或 "keyframe"
    method = "fps"  # 可更改为 "keyframe" 来使用关键帧方法
    threshold = 30.0          # 镜头切分阈值
    whisper_model = "base"    # Whisper模型：base(轻量)、small(中等)、medium(精准)，按需选择
    
    # 根据选择的方法设置参数
    if method == "fps":
        main(video_name, method="fps", fps=1,threshold=threshold, whisper_model=whisper_model)  # 可调整fps参数
    elif method == "keyframe":
        main(video_name, method="keyframe",threshold=threshold, whisper_model=whisper_model)  # 使用关键帧方法cd /workspace/one_click_pull_film/input
