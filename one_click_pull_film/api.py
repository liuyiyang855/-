import os
import shutil
import uuid
import traceback
import json
import glob
from typing import Dict
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# 导入现有的视频处理入口
from main import main as process_video

app = FastAPI(title="Video Processing API")

# 配置CORS，允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 线上环境建议改成前端实际域名
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载输出目录，方便前端直接以 URL 方式访问分析产出的图片或文件
os.makedirs("output", exist_ok=True)
app.mount("/output", StaticFiles(directory="output"), name="output")

# 使用一个简单的内存字典来保存任务状态
# 实际生产环境中通常用 Redis 和 MySQL 等数据库来存储
tasks: Dict[str, dict] = {}

def process_video_task(task_id: str, video_name: str, method: str, whisper_model: str):
    """
    后台处理视频的任务封装
    """
    try:
        tasks[task_id]["status"] = "processing"
        
        # 调用 core main 的处理逻辑
        process_video(video_name=video_name, method=method, whisper_model=whisper_model)
        
        # 处理完成，更新任务状态
        tasks[task_id]["status"] = "completed"
        # 你可以根据输出目录的特征，进一步增加具体的产出文件链接给前端
        video_base_name = os.path.splitext(video_name)[0]
        tasks[task_id]["result_dir"] = f"/output/{video_base_name}"
        
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        traceback.print_exc()

@app.post("/api/upload")
async def upload_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    接收前端上传的视频并交由后台任务处理
    """
    try:
        if not file.filename:
            return JSONResponse(status_code=400, content={"msg": "上传文件名为空"})
            
        task_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1]
        if not ext:
            ext = ".mp4" # 默认扩展名
            
        save_filename = f"{task_id}{ext}"
        input_dir = "input"
        os.makedirs(input_dir, exist_ok=True)
        
        input_filepath = os.path.join(input_dir, save_filename)
        
        # 保存上传的文件到 input 目录
        with open(input_filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 初始化任务状态
        tasks[task_id] = {
            "task_id": task_id,
            "filename": file.filename,
            "status": "pending",
            "result_dir": None
        }
        
        # 触发后台处理任务
        # 这里默认采用 fps 方法，可以根据前端传参动态指定
        background_tasks.add_task(
            process_video_task, 
            task_id, 
            save_filename, 
            method="fps", 
            whisper_model="base"
        )
        
        return {
            "code": 200, 
            "msg": "文件上传成功，开始后台处理",
            "data": {
                "task_id": task_id
            }
        }
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"msg": f"上传处理失败: {str(e)}"})

@app.get("/api/status/{task_id}")
async def get_task_status(task_id: str):
    """
    前端定时轮询该接口获取处理进度或结果
    """
    task_info = tasks.get(task_id)
    if not task_info:
        return JSONResponse(status_code=404, content={"msg": "未找到对应的任务信息"})
        
    return {
        "code": 200,
        "msg": "获取状态成功",
        "data": task_info
    }

@app.get("/api/result/{task_id}")
async def get_task_result(task_id: str):
    """
    当任务完成后，前端通过此接口获取组装好的拉片分析结果
    """
    task_info = tasks.get(task_id)
    if not task_info:
        return JSONResponse(status_code=404, content={"msg": "未找到对应的任务信息"})
    if task_info.get("status") != "completed":
        return JSONResponse(status_code=400, content={"msg": "任务尚未完成"})
        
    result_dir = task_info.get("result_dir") # e.g. /output/test1
    if not result_dir:
        return JSONResponse(status_code=500, content={"msg": "无法获取任务结果目录"})
        
    local_dir = result_dir.lstrip("/") 
    content_file = os.path.join(local_dir, "content_analysis.json")
    transcript_file = os.path.join(local_dir, "transcript.json")
    
    if not os.path.exists(content_file):
        return JSONResponse(status_code=500, content={"msg": "分析结果文件不存在"})
        
    with open(content_file, "r", encoding="utf-8") as f:
        try:
            content_data = json.load(f)
        except:
            content_data = []
            
    transcript_data = []
    if os.path.exists(transcript_file):
        with open(transcript_file, "r", encoding="utf-8") as f:
            try:
                transcript_data = json.load(f)
            except:
                pass
                
    shot_analysis = []
    frames_dir = os.path.join(local_dir, "frames")
    has_frames = os.path.exists(frames_dir)
    all_frames = []
    if has_frames:
        all_frames = sorted([f for f in os.listdir(frames_dir) if f.lower().endswith('.jpg')])
    
    for scene in content_data:
        scene_id = scene.get("scene_index", 0)
        timestamps = scene.get("timestamp", [0.0, 0.0])
        start_t = timestamps[0]
        end_t = timestamps[1]
        
        def format_time(seconds):
            m, s = divmod(int(seconds), 60)
            h, m = divmod(m, 60)
            return f"{h:02d}:{m:02d}:{s:02d}"
            
        timecode = f"{format_time(start_t)} - {format_time(end_t)}"
        
        audio_texts = []
        for t in transcript_data:
            t_start = t.get("start", 0)
            t_end = t.get("end", 0)
            if not (t_end <= start_t or t_start >= end_t):
                audio_texts.append(t.get("text", ""))
        audio = " ".join(audio_texts) if audio_texts else "无对白/声音"
        
        thumbnail_url = ""
        burst_time = scene.get("frames", {}).get("burst_time", start_t)
        if all_frames:
            idx = min(int(burst_time), len(all_frames)-1)
            thumbnail_url = f"{result_dir}/frames/{all_frames[idx]}"
        else:
            thumbnail_url = f"https://picsum.photos/seed/shot{scene_id}/200/112"
            
        shot_analysis.append({
            "id": scene_id,
            "timecode": timecode,
            "shotType": scene.get("shot_type", ""),
            "movement": scene.get("motion_type", ""),
            "description": scene.get("summary", ""),
            "audio": audio,
            "thumbnail": thumbnail_url
        })
        
    return {
        "code": 200,
        "msg": "获取结果成功",
        "data": shot_analysis
    }

if __name__ == "__main__":
    import uvicorn
    # 启动 API 服务
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
