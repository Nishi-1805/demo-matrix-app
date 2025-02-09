import os
import asyncio
from dotenv import load_dotenv
from nio import AsyncClient, MatrixRoom, RoomMessageText
from flask import Flask, jsonify, request, send_from_directory
from flask_socketio import SocketIO
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app and configure static folder path
app = Flask(__name__, static_folder='./matrix-frontend/build', static_url_path='')
  # Ensure this points correctly
CORS(app)
socketio = SocketIO(app)

class MatrixIntegration:
    def __init__(self):
        self.homeserver = os.getenv('MATRIX_HOMESERVER')
        self.username = os.getenv('MATRIX_USERNAME')
        self.password = os.getenv('MATRIX_PASSWORD')
        self.client = None

    async def connect(self):
        self.client = AsyncClient(self.homeserver, self.username)
        await self.client.login(self.password)

    async def join_room(self, room_id):
        await self.client.join(room_id)

    async def send_message(self, room_id, message):
        await self.client.room_send(
            room_id,
            message_type="m.room.message",
            content={
                "msgtype": "m.text", 
                "body": message
            }
        )

    async def listen_messages(self):
        async def message_callback(room: MatrixRoom, event: RoomMessageText):
            print(f"Message in {room.display_name}: {event.body}")

        self.client.add_event_callback(message_callback, RoomMessageText)
        await self.client.sync_forever(timeout=30000)

# Initialize Matrix Integration
matrix_integration = MatrixIntegration()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Serve the index.html for root and any non-existent path
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    asyncio.run(matrix_integration.send_message(
        data['room_id'], 
        data['message']
    ))
    return jsonify({"status": "success"})

@app.route('/join_room', methods=['POST'])
def join_room():
    data = request.json
    asyncio.run(matrix_integration.join_room(data['room_id']))
    return jsonify({"status": "success"})

if __name__ == '__main__':
    asyncio.run(matrix_integration.connect())
    socketio.run(app, debug=True)
