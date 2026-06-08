"""
JobScope Analytics is a 100% client-side single-page application.

There is no application backend — all data lives in-memory in the browser
(see /app/frontend). This minimal FastAPI app only exists to keep the
platform's supervisor process healthy and to expose a simple health check.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="JobScope Analytics (no-op backend)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "jobscope", "backend": "none — client-side app"}
