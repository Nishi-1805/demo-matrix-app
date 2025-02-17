// bridgeService.js
class BridgeService {
    constructor(matrixService) {
      this.matrixService = matrixService;
      this.baseUrl = 'https://matrix-client.matrix.org/_matrix/client/v3';
      this.whatsappBridgeUrl = 'http://localhost:29318';
    }
  
    // General method to join a bridged room
    async joinBridgedRoom(roomAlias) {
      try {
        const client = this.matrixService.getClient();
        if (!client) throw new Error('Matrix client not initialized');
        
        const room = await client.joinRoom(roomAlias);
        return room;
      } catch (error) {
        console.error('Failed to join bridged room:', error);
        throw error;
      }
    }

  async connectDiscord() {
    try {
      // Create a room specifically for Discord bridge
      const roomId = await this.matrixService.connectToBridge('discord');
      
      // Send command to bridge bot
      await this.matrixService.getClient().sendTextMessage(roomId, '!discord link');
      
      // Return room ID for further use
      return {
        success: true,
        roomId: roomId,
        message: 'Discord connection initiated. Please check your Discord for authorization.'
      };
    } catch (error) {
      console.error('Failed to connect Discord:', error);
      throw new Error('Discord connection failed. Please try again.');
    }
  }

  async connectWhatsApp() {
    try {
      // Create a dedicated room for WhatsApp bridge
      const roomId = await this.matrixService.connectToBridge('whatsapp');
      
      // Join the WhatsApp control room
      await this.matrixService.getClient().joinRoom('#whatsapp:matrix.org');

      // Send the link command to start WhatsApp connection
      await this.matrixService.getClient().sendEvent(
        roomId,
        'm.room.message',
        {
          msgtype: 'm.text',
          body: '!wa link'
        }
      );

      // Set up event listener for QR code
      this.matrixService.getClient().on("Room.timeline", (event) => {
        if (event.getType() === 'm.room.message') {
          const content = event.getContent();
          if (content.body && content.body.includes('QR code')) {
            // Extract and display QR code
            this.handleWhatsAppQR(content.body);
          }
          if (content.body && content.body.includes('Successfully logged in')) {
            // Handle successful login
            this.handleWhatsAppSuccess();
          }
        }
      });

      return {
        success: true,
        roomId,
        message: 'WhatsApp connection initiated. Please wait for QR code.'
      };
    } catch (error) {
      console.error('Failed to connect WhatsApp:', error);
      throw new Error('WhatsApp connection failed: ' + error.message);
    }
  }

  async handleWhatsAppQR(qrData) {
    // Emit event for QR code display
    this.matrixService.emit('whatsapp_qr', qrData);
  }

  async handleWhatsAppSuccess() {
    // Emit success event
    this.matrixService.emit('whatsapp_connected');
    
    // Start syncing chats
    await this.syncWhatsAppChats();
  }

  async syncWhatsAppChats() {
    try {
      // Send sync command
      await this.matrixService.getClient().sendEvent(
        '#whatsapp:matrix.org',
        'm.room.message',
        {
          msgtype: 'm.text',
          body: '!wa sync'
        }
      );
    } catch (error) {
      console.error('Failed to sync WhatsApp chats:', error);
    }
  }

  async getWhatsAppChats() {
    try {
      const rooms = await this.matrixService.getRooms();
      return rooms.filter(room => {
        const stateEvents = room.currentState?.getStateEvents('m.bridge');
        return stateEvents?.some(event => 
          event.getContent().protocol === 'whatsapp'
        );
      });
    } catch (error) {
      console.error('Failed to get WhatsApp chats:', error);
      return [];
    }
  }
  
    // Get list of connected platforms
    async getConnectedPlatforms() {
      try {
        const client = this.matrixService.getClient();
        if (!client) throw new Error('Matrix client not initialized');
        
        const rooms = await client.getJoinedRooms();
        const platforms = [];
        
        for (const roomId of rooms) {
          const state = await client.getRoomState(roomId);
          // Check room state events for bridge info
          state.forEach(event => {
            if (event.type === 'm.bridge') {
              platforms.push({
                platform: event.content.bridge_name,
                roomId: roomId
              });
            }
          });
        }
        
        return platforms;
      } catch (error) {
        console.error('Failed to get connected platforms:', error);
        throw error;
      }
    }
  }
  
  export default BridgeService;