import React, { useState, useEffect } from "react";
import matrixService from "../services/matrixService";
import { DiscordBridgeSetup, WhatsAppBridgeSetup } from '../services/bridgeHandlers';

const Home = () => {
  const [bridges, setBridges] = useState([]);
  const [bridgedChats, setBridgedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [showSetupInstructions, setShowSetupInstructions] = useState({});
  const bridgeService = matrixService.getBridgeService();
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedBridges, fetchedChats] = await Promise.all([
        matrixService.getBridgeLinks(),
        matrixService.getBridgedChats()
      ]);
      setBridges(fetchedBridges);
      setBridgedChats(fetchedChats);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeConnect = async (bridge) => {
    try {
      if (!bridge.isAvailable) {
        setShowSetupInstructions({
          ...showSetupInstructions,
          [bridge.protocol]: true
        });
        return;
      }

      setLoading(true);
      switch (bridge.protocol) {
        case 'discord':
          const discordResult = await bridgeService.connectDiscord();
          setSuccess(discordResult.message);
          break;
          
        case 'whatsapp':
          const whatsappResult = await bridgeService.connectWhatsApp();
          setSuccess(whatsappResult.message);
          break;
          
        default:
          if (bridge.networkList?.length > 0 && !selectedNetwork) {
            setError(`Please select a network for ${bridge.name}`);
            return;
          }
          await matrixService.connectToBridge(bridge.protocol, selectedNetwork);
      }
      await fetchData();
      setSelectedNetwork('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Connected Platforms</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Available Bridges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bridges.map((bridge) => (
            <div key={bridge.protocol} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">{bridge.name}</h4>
                {!bridge.isAvailable && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Setup Required
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{bridge.description}</p>
              
              {bridge.networkList?.length > 0 && bridge.isAvailable && (
                <select
                  className="block w-full mb-2 p-2 border rounded"
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                >
                  <option value="">Select Network</option>
                  {bridge.networkList.map(network => (
                    <option key={network} value={network}>{network}</option>
                  ))}
                </select>
              )}

              <button
                onClick={() => handleBridgeConnect(bridge)}
                className={`px-4 py-2 rounded ${
                  bridge.isAvailable 
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bridge.isAvailable ? 'Connect' : 'Setup Instructions'}
              </button>

              {showSetupInstructions[bridge.protocol] && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <p>{bridge.setupInstructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Connected Chats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bridgedChats.map((chat) => (
            <div key={chat.id} className="border rounded-lg p-4">
              <h4 className="font-bold">{chat.name}</h4>
              <p className="text-gray-600">Via {chat.protocol}</p>
              
              {chat.lastMessage && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">{chat.lastMessage.sender}:</p>
                  <p>{chat.lastMessage.content}</p>
                </div>
              )}

              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {chat.participants.length} participants
                </p>
              </div>
            </div>
          ))}
          
          {bridgedChats.length === 0 && (
            <p className="text-gray-600">No connected chats yet. Connect to a bridge to start chatting!</p>
          )}
        </div>
        {success && (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
    {success}
  </div>
)}
      </div>
    </div>
  );
};

export default Home;