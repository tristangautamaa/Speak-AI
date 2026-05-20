import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- FastAPI app ---
app = FastAPI(title="Speak Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Socket.IO server ---
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Wrap FastAPI with Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


# --- HTTP routes ---

@app.get("/")
async def root():
    return {"message": "Speak backend alive"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "speak-backend"}


# --- Socket.IO events ---

@sio.event
async def connect(sid, environ):
    print(f"[socket] connected: {sid}")
    await sio.emit("connection_ack", {"status": "connected"}, to=sid)


@sio.event
async def disconnect(sid):
    print(f"[socket] disconnected: {sid}")


@sio.event
async def start_listening(sid, data):
    print(f"[socket] start_listening from {sid}: {data}")
    await sio.emit("backend_status", {"status": "listening"}, to=sid)


@sio.event
async def stop_listening(sid, data=None):
    await sio.emit("backend_status", {"status": "stopped"}, to=sid)


@sio.event
async def transcript_chunk(sid, data):
    # data expected: { "text": "..." }
    text = data.get("text", "") if isinstance(data, dict) else str(data)
    print(f"[transcript] {sid}: {text}")
    await sio.emit("transcript_received", {"text": text}, to=sid)
