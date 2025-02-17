// bridgeHandlers.js
import { useState } from 'react';
import matrixService from './matrixService';

export const useDiscordBridge = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const bridgeService = matrixService.getBridgeService();

  const connectDiscord = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // First create a bridge-specific room using matrixService
      const roomId = await matrixService.connectToBridge('discord');
      
      // Then use bridgeService to establish the connection
      await bridgeService.connectDiscord();
      
      return roomId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  return { connectDiscord, isConnecting, error };
};

export const useWhatsAppBridge = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const bridgeService = matrixService.getBridgeService();

  const connectWhatsApp = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Create WhatsApp bridge room
      const roomId = await matrixService.connectToBridge('whatsapp');
      
      // Initialize WhatsApp connection
       await bridgeService.connectWhatsApp();
      
      // Listen for QR code or connection status
      const handleWhatsAppEvents = (event) => {
        if (event.getType() === 'm.room.message') {
          const content = event.getContent();
          if (content.msgtype === 'm.text' && content.body.includes('QR code')) {
            // Extract QR code data if present
            setQrCode(content.body);
          }
        }
      };

      matrixService.getClient().on('Room.timeline', handleWhatsAppEvents);
      
      return roomId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  return { connectWhatsApp, isConnecting, error, qrCode };
};

// BridgeComponents.jsx
export const DiscordBridgeSetup = ({ onConnect }) => {
  const { connectDiscord, isConnecting, error } = useDiscordBridge();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Discord Bridge Setup</h3>
      {error && (
        <div className="text-red-600 mb-2">{error}</div>
      )}
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Discord'}
      </button>
    </div>
  );
};

export const WhatsAppBridgeSetup = ({ onConnect }) => {
  const { connectWhatsApp, isConnecting, error, qrCode } = useWhatsAppBridge();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">WhatsApp Bridge Setup</h3>
      {error && (
        <div className="text-red-600 mb-2">{error}</div>
      )}
      {qrCode && (
        <div className="mb-4">
          <p className="mb-2">Scan this QR code with WhatsApp:</p>
          <pre className="bg-gray-100 p-2 rounded">{qrCode}</pre>
        </div>
      )}
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect WhatsApp'}
      </button>
    </div>
  );
};