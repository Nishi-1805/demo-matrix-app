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
import BridgeService from './bridgeService';

class MatrixService {
  constructor() {
    this.baseUrl = 'https://matrix-client.matrix.org';
    this.accessToken = localStorage.getItem('matrix_access_token');
    this.userId = localStorage.getItem('matrix_user_id');
    this.client = null;
    this.bridgeService = null;
    
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
      this.bridgeService = new BridgeService(this);
    }
  }

  getBridgeService() {
    return this.bridgeService;
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

  async getBridgeLinks() {
    try {
      if (!this.client) {
        throw new Error('Matrix client not initialized');
      }

      // First check which bridges are actually available
      const response = await fetch(`${this.baseUrl}/_matrix/client/v3/thirdparty/protocols`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get bridge protocols: ${response.status}`);
      }

      const protocols = await response.json();
      
      // Define all potential platforms
const platformConfigs = {
  irc: {
    name: 'IRC',
    networkList: ['libera', 'OFTC', 'freenode'],
    description: 'Connect to IRC networks',
    setupInstructions: 'IRC bridge is available by default on matrix.org',
    isAvailable: true  // Add this line
  },
  discord: {
    name: 'Discord',
    description: 'Connect to Discord servers',
    setupInstructions: 'Connect your Discord account',
    isAvailable: true  // Change this to true
  },
  whatsapp: {
    name: 'WhatsApp',
    description: 'Connect to WhatsApp',
    setupInstructions: 'Scan QR code with WhatsApp',
    isAvailable: true  // Change this to true
  },
  // ... other platforms ...
};

      // Transform available protocols into bridge information
      const bridges = Object.entries(protocols).map(([protocol, info]) => {
        const configuredPlatform = platformConfigs[protocol] || {};
        return {
          name: configuredPlatform.name || info.fields?.friendly_name || protocol,
          protocol: protocol,
          description: configuredPlatform.description || info.desc || `Connect to ${protocol}`,
          networkList: configuredPlatform.networkList || [],
          isAvailable: true,
          setupInstructions: configuredPlatform.setupInstructions
        };
      });

      // Add unavailable bridges with setup instructions
      Object.entries(platformConfigs)
        .filter(([protocol]) => !protocols[protocol])
        .forEach(([protocol, config]) => {
          bridges.push({
            name: config.name,
            protocol: protocol,
            description: config.description,
            networkList: config.networkList || [],
            isAvailable: false,
            setupInstructions: config.setupInstructions
          });
        });

      return bridges;
    } catch (error) {
      console.error('Failed to get bridge links:', error);
      return [];
    }
  }

  async connectToBridge(protocol, networkName = null) {
    try {
      if (!this.client) {
        throw new Error('Matrix client not initialized');
      }

      // Create a bridge-specific room
      const roomResponse = await this.client.createRoom({
        visibility: 'private',
        name: `${protocol} Bridge`,
        topic: `Bridge to ${protocol}${networkName ? ` (${networkName})` : ''}`,
        initial_state: [
          {
            type: 'm.room.bridging',
            state_key: protocol,
            content: {
              protocol,
              network: networkName
            }
          }
        ]
      });

      return roomResponse.room_id;
    } catch (error) {
      console.error(`Failed to connect to ${protocol} bridge:`, error);
      throw error;
    }
  }

  async getBridgedChats() {
    try {
      if (!this.client) {
        throw new Error('Matrix client not initialized');
      }

      const rooms = await this.getRooms();
      
      // Filter and format bridged rooms
      const bridgedChats = rooms
        .filter(room => {
          const roomObj = this.client.getRoom(room.id);
          const bridgeState = roomObj?.currentState.getStateEvents('m.room.bridging');
          return bridgeState && bridgeState.length > 0;
        })
        .map(room => {
          const roomObj = this.client.getRoom(room.id);
          const bridgeState = roomObj.currentState.getStateEvents('m.room.bridging')[0];
          const protocol = bridgeState?.getContent().protocol;
          
          return {
            id: room.id,
            name: room.name,
            protocol: protocol,
            lastMessage: this.getLastMessage(roomObj),
            participants: this.getRoomParticipants(room.id)
          };
        });

      return bridgedChats;
    } catch (error) {
      console.error('Failed to get bridged chats:', error);
      return [];
    }
  }

  async getRoomParticipants(roomId) {
    try {
      const response = await fetch(`${this.baseUrl}/_matrix/client/v3/rooms/${roomId}/members`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get room members: ${response.status}`);
      }

      const { chunk } = await response.json();
      return chunk
        .filter(event => event.content.membership === 'join')
        .map(event => ({
          userId: event.state_key,
          displayName: event.content.displayname || event.state_key
        }));
    } catch (error) {
      console.error('Failed to get room participants:', error);
      return [];
    }
  }

  getLastMessage(room) {
    try {
      const timeline = room.timeline;
      const messages = timeline
        .filter(event => event.getType() === 'm.room.message')
        .map(event => ({
          content: event.getContent().body,
          sender: event.getSender(),
          timestamp: event.getTs()
        }));
      
      return messages[messages.length - 1] || null;
    } catch (error) {
      console.error('Failed to get last message:', error);
      return null;
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