import React, { useState, useEffect, useCallback, useMemo } from 'react';
import matrixService from '../services/matrixService';
import BridgeService from '../services/bridgeService';

const PlatformIntegration = () => {
    const [connectedPlatforms, setConnectedPlatforms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [telegramUsername, setTelegramUsername] = useState('');
    const [signalPhone, setSignalPhone] = useState('');
    
    // Memoize bridgeService initialization
    const bridgeService = useMemo(() => new BridgeService(matrixService), []);
  
    const loadConnectedPlatforms = useCallback(async () => {
      try {
        const platforms = await bridgeService.getConnectedPlatforms();
        setConnectedPlatforms(platforms);
      } catch (error) {
        setError('Failed to load connected platforms');
        console.error(error);
      }
    }, [bridgeService]);
  
    useEffect(() => {
      loadConnectedPlatforms();
      return () => {
        setConnectedPlatforms([]);
        setError('');
      };
    }, [loadConnectedPlatforms]);

  const handleTelegramConnect = async () => {
    try {
      setLoading(true);
      setError('');
      await bridgeService.connectTelegram(telegramUsername);
      await loadConnectedPlatforms();
      setTelegramUsername('');
    } catch (error) {
      setError('Failed to connect Telegram: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordConnect = async () => {
    try {
      setLoading(true);
      setError('');
      await bridgeService.connectDiscord();
      await loadConnectedPlatforms();
    } catch (error) {
      setError('Failed to connect Discord: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppConnect = async () => {
    try {
      setLoading(true);
      setError('');
      await bridgeService.connectWhatsApp();
      await loadConnectedPlatforms();
    } catch (error) {
      setError('Failed to connect WhatsApp: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignalConnect = async () => {
    try {
      setLoading(true);
      setError('');
      await bridgeService.connectSignal(signalPhone);
      await loadConnectedPlatforms();
      setSignalPhone('');
    } catch (error) {
      setError('Failed to connect Signal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Connect Platforms</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Telegram */}
        <div className="p-4 border rounded">
          <h3 className="font-bold">Telegram</h3>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="Telegram Username"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleTelegramConnect}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Discord */}
        <div className="p-4 border rounded">
          <h3 className="font-bold">Discord</h3>
          <button
            onClick={handleDiscordConnect}
            disabled={loading}
            className="bg-indigo-500 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect Discord'}
          </button>
        </div>

        {/* WhatsApp */}
        <div className="p-4 border rounded">
          <h3 className="font-bold">WhatsApp</h3>
          <button
            onClick={handleWhatsAppConnect}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect WhatsApp'}
          </button>
        </div>

        {/* Signal */}
        <div className="p-4 border rounded">
          <h3 className="font-bold">Signal</h3>
          <div className="flex gap-2 mt-2">
            <input
              type="tel"
              value={signalPhone}
              onChange={(e) => setSignalPhone(e.target.value)}
              placeholder="Phone Number"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSignalConnect}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Connected Platforms List */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Connected Platforms</h3>
          {connectedPlatforms.length > 0 ? (
            <ul className="space-y-2">
              {connectedPlatforms.map((platform, index) => (
                <li 
                  key={index} 
                  className="p-2 bg-gray-50 rounded flex justify-between items-center"
                >
                  <span>{platform.platform}</span>
                  <span className="text-sm text-green-600">Connected</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No platforms connected yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformIntegration;