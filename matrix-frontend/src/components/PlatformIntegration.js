import React, { useState, useEffect } from 'react';
import matrixService from '../services/matrixService';

const WhatsAppIntegration = () => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const bridgeService = matrixService.getBridgeService();
    
    // Listen for WhatsApp events
    matrixService.on('whatsapp_qr', (qrData) => {
      setQrCode(qrData);
      setLoading(false);
    });

    matrixService.on('whatsapp_connected', async () => {
      setConnected(true);
      setQrCode(null);
      await loadWhatsAppChats();
    });

    return () => {
      matrixService.removeAllListeners('whatsapp_qr');
      matrixService.removeAllListeners('whatsapp_connected');
    };
  }, []);

  const loadWhatsAppChats = async () => {
    try {
      const bridgeService = matrixService.getBridgeService();
      const whatsappChats = await bridgeService.getWhatsAppChats();
      setChats(whatsappChats);
    } catch (error) {
      setError('Failed to load WhatsApp chats');
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const bridgeService = matrixService.getBridgeService();
      await bridgeService.connectWhatsApp();
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">WhatsApp Integration</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!connected && !qrCode && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect WhatsApp'}
        </button>
      )}

      {qrCode && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Scan QR Code with WhatsApp</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            {qrCode}
          </pre>
        </div>
      )}

      {connected && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">WhatsApp Chats</h3>
          <div className="grid gap-4">
            {chats.map((chat) => (
              <div key={chat.id} className="border rounded-lg p-4">
                <h4 className="font-bold">{chat.name}</h4>
                <p className="text-sm text-gray-600">
                  Last message: {chat.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppIntegration;