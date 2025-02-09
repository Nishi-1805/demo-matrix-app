// components/Sidebar.js
import React, { useState, useEffect, useCallback } from 'react';
import matrixService from '../services/matrixService';

const Sidebar = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoomsAndBridges = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedRooms = await matrixService.getRooms();
      setRooms(fetchedRooms);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomsAndBridges();
  }, [fetchRoomsAndBridges]);

  if (loading) {
    return (
      <div className="h-screen w-64 bg-gray-100 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-64 bg-gray-100 p-4">
        <div className="text-red-500">
          {error}
          <button 
            onClick={fetchRoomsAndBridges}
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-64 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Rooms</h2>
      <div className="space-y-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="p-2 bg-white rounded shadow hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="font-medium">{room.name}</h3>
            {room.lastMessage && (
              <p className="text-sm text-gray-500 truncate">
                {room.lastMessage}
              </p>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {room.type !== 'regular' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {room.type}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;