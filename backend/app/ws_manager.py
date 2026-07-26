from typing import List, Dict, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # General active connections (e.g. staff dashboards)
        self.active_connections: List[WebSocket] = []
        # Target connections for specific order trackers: {order_id: [WebSocket]}
        self.order_trackers: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        for order_id in list(self.order_trackers.keys()):
            if websocket in self.order_trackers[order_id]:
                self.order_trackers[order_id].remove(websocket)
                if not self.order_trackers[order_id]:
                    del self.order_trackers[order_id]

    async def track_order(self, websocket: WebSocket, order_id: int):
        if order_id not in self.order_trackers:
            self.order_trackers[order_id] = []
        if websocket not in self.order_trackers[order_id]:
            self.order_trackers[order_id].append(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def notify_order_update(self, order_data: Dict[str, Any]):
        # Broadcast to all staff dashboards
        await self.broadcast({
            "type": "ORDER_UPDATED",
            "data": order_data
        })
        # Broadcast to specific customer order tracker
        order_id = order_data.get("id")
        if order_id in self.order_trackers:
            disconnected = []
            for connection in self.order_trackers[order_id]:
                try:
                    await connection.send_json({
                        "type": "ORDER_STATUS_CHANGED",
                        "data": order_data
                    })
                except Exception:
                    disconnected.append(connection)
            for conn in disconnected:
                self.disconnect(conn)

ws_manager = ConnectionManager()
