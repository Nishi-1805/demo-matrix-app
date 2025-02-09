// import * as sdk from '@matrix-org/sdk';

// class MatrixService {
//   constructor() {
//     this.client = null;
//   }

//   async initClient(baseUrl, accessToken) {
//     this.client = sdk.createClient({
//       baseUrl,
//       accessToken,
//       userId: await this.getUserId()
//     });
//     await this.client.startClient();
//   }

//   async login(username, password) {
//     try {
//       const response = await this.client.login('m.login.password', {
//         user: username,
//         password: password
//       });
//       return response;
//     } catch (error) {
//       throw new Error('Login failed: ' + error.message);
//     }
//   }

//   async getUserId() {
//     if (!this.client) throw new Error('Client not initialized');
//     return await this.client.getUserId();
//   }

//   async sendMessage(roomId, content) {
//     try {
//       return await this.client.sendMessage(roomId, {
//         msgtype: 'm.text',
//         body: content
//       });
//     } catch (error) {
//       throw new Error('Failed to send message: ' + error.message);
//     }
//   }
// }

// export const matrixService = new MatrixService();


// matrixService.js
import { createClient } from "matrix-js-sdk";

class MatrixService {
  constructor() {
    this.baseUrl = 'https://matrix-client.matrix.org';
    this.accessToken = localStorage.getItem('matrix_access_token');
    this.userId = localStorage.getItem('matrix_user_id');
    this.client = null;
    
    if (this.accessToken) {
      this.initClient();
    }
  }

  initClient() {
    if (this.accessToken) {
      this.client = createClient({
        baseUrl: this.baseUrl,
        accessToken: this.accessToken,
        userId: this.userId
      });
    }
  }

  async login(username, password) {
    try {
      console.log('🔑 Attempting login...', { username });
      
      const response = await fetch(`${this.baseUrl}/_matrix/client/v3/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'm.login.password',
          identifier: {
            type: 'm.id.user',
            user: username,
          },
          password: password,
          initial_device_display_name: "Demo Matrix App"
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Login failed with status: ${response.status}`);
      }

      this.accessToken = data.access_token;
      this.userId = data.user_id;
      
      localStorage.setItem('matrix_access_token', data.access_token);
      localStorage.setItem('matrix_user_id', data.user_id);
      
      this.initClient();
      console.log('✅ Login successful!');
      return data;
    } catch (error) {
      console.error('❌ Login failed!', error);
      throw error;
    }
  }

  async register(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          auth: {
            type: 'm.login.dummy'
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Registration failed with status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

 async logout() {
    try {
      if (!this.accessToken) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${this.baseUrl}/_matrix/client/v3/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Logout failed with status: ${response.status}`);
      }

      this.accessToken = null;
      this.userId = null;
      this.client = null;
      localStorage.removeItem('matrix_access_token');
      localStorage.removeItem('matrix_user_id');
      
      console.log('✅ Logout successful!');
    } catch (error) {
      console.error('❌ Logout failed!', error);
      throw error;
    }
  }

  async getRooms() {
    try {
      if (!this.client) {
        throw new Error('Matrix client not initialized');
      }

      // Start the client if it hasn't been started
      if (!this.client.isInitialSyncComplete()) {
        await this.client.startClient({ initialSyncLimit: 10 });
      }

      // Get joined rooms
      const response = await fetch(`${this.baseUrl}/_matrix/client/v3/joined_rooms`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get rooms: ${response.status}`);
      }

      const { joined_rooms } = await response.json();
      const rooms = [];

      // Fetch details for each room
      for (const roomId of joined_rooms) {
        const roomResponse = await fetch(`${this.baseUrl}/_matrix/client/v3/rooms/${roomId}/state`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (roomResponse.ok) {
          const roomState = await roomResponse.json();
          const nameEvent = roomState.find(event => event.type === 'm.room.name');
          
          rooms.push({
            id: roomId,
            name: nameEvent ? nameEvent.content.name : roomId,
            type: 'regular'
          });
        }
      }
      
      return rooms;
    } catch (error) {
      console.error('Failed to get rooms:', error);
      throw error;
    }
  }

  getLastMessage(room) {
    const events = room.timeline;
    if (events && events.length > 0) {
      const lastEvent = events[events.length - 1];
      return lastEvent.getContent().body || '';
    }
    return '';
  }

  getRoomType(room) {
    const stateEvents = room.currentState.getStateEvents('m.room.type');
    if (stateEvents.length > 0) {
      return stateEvents[0].getContent().type || 'regular';
    }
    return 'regular';
  }

  async getJoinedRooms() {
    try {
      if (!this.client) {
        throw new Error('Not initialized');
      }
      return await this.client.getJoinedRooms();
    } catch (error) {
      console.error('Failed to get joined rooms:', error);
      throw error;
    }
  }

  async getRoomMessages(roomId) {
    try {
      if (!this.client) {
        throw new Error('Not initialized');
      }
      return await this.client.getRoomMessages(roomId, null, 50, 'b');
    } catch (error) {
      console.error('Failed to get room messages:', error);
      throw error;
    }
  }

  isLoggedIn() {
    return !!this.accessToken;
  }

  getUserId() {
    return this.userId;
  }

  getClient() {
    return this.client;
  }
}

// Create a single instance
const matrixService = new MatrixService();

// Export both the class and the instance
export { MatrixService };
export default matrixService;