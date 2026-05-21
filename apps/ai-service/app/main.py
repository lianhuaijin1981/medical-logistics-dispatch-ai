"""医药物流 AI 微服务 — FastAPI 入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Medical Logistics AI Service",
    description="AI引擎：VRP路径规划 / 需求预测 / 异常检测 / 智能调度",
    version="0.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "med-ai-service", "version": "0.0.0"}


@app.get("/api/v1/vrp/solve")
async def vrp_stub():
    """Sprint 0 stub — VRP求解 API"""
    return {
        "algorithm": "ga_vrp",
        "total_distance": 0,
        "total_duration": 0,
        "routes": [],
        "message": "VRP solver stub — implement in Sprint 1",
    }
