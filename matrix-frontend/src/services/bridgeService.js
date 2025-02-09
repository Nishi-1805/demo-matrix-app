// bridgeService.js
class BridgeService {
    constructor(matrixService) {
      this.matrixService = matrixService;
      this.baseUrl = 'https://matrix-client.matrix.org/_matrix/client/v3';
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
  
    // Telegram Bridge
    async connectTelegram(telegramUsername) {
      try {
        // Join Telegram bridge bot room
        const bridgeRoom = await this.joinBridgedRoom('#telegram:t2bot.io');
        
        // Send connection command to bridge bot
        await this.matrixService.getClient().sendMessage(bridgeRoom.roomId, {
          msgtype: 'm.text',
          body: `!telegram connect ${telegramUsername}`
        });
  
        return bridgeRoom;
      } catch (error) {
        console.error('Failed to connect Telegram:', error);
        throw error;
      }
    }
  
    // Discord Bridge
    async connectDiscord() {
      try {
        // Join Discord bridge bot room
        const bridgeRoom = await this.joinBridgedRoom('#discord:matrix.org');
        
        // Send connection command
        await this.matrixService.getClient().sendMessage(bridgeRoom.roomId, {
          msgtype: 'm.text',
          body: '!discord link'
        });
  
        return bridgeRoom;
      } catch (error) {
        console.error('Failed to connect Discord:', error);
        throw error;
      }
    }
  
    // WhatsApp Bridge
    async connectWhatsApp() {
      try {
        const bridgeRoom = await this.joinBridgedRoom('#whatsapp:maunium.net');
        
        await this.matrixService.getClient().sendMessage(bridgeRoom.roomId, {
          msgtype: 'm.text',
          body: '!wa link'
        });
  
        return bridgeRoom;
      } catch (error) {
        console.error('Failed to connect WhatsApp:', error);
        throw error;
      }
    }
  
    // Signal Bridge
    async connectSignal(phoneNumber) {
      try {
        const bridgeRoom = await this.joinBridgedRoom('#signal:matrix.org');
        
        await this.matrixService.getClient().sendMessage(bridgeRoom.roomId, {
          msgtype: 'm.text',
          body: `!signal link ${phoneNumber}`
        });
  
        return bridgeRoom;
      } catch (error) {
        console.error('Failed to connect Signal:', error);
        throw error;
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