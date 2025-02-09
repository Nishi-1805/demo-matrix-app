import React, { useState, useEffect } from "react";
import  matrixService  from "../services/matrixService";

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [bridges, setBridges] = useState([]);

  useEffect(() => {
    const fetchRoomsAndBridges = async () => {
      try {
        if (!matrixService.client) {
          console.error("Matrix client not initialized!");
          return;
        }

        // Fetch rooms
        const fetchedRooms = await matrixService.getRooms();
        setRooms(fetchedRooms);

        // Fetch bridge links
        const fetchedBridges = await matrixService.getBridgeLinks();
        setBridges(fetchedBridges);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchRoomsAndBridges();
  }, []);

  return (
    <div>
      <h2>Home - Connected Platforms</h2>
      
      <h3>Bridges</h3>
      {bridges.length > 0 ? (
        <ul>
          {bridges.map((bridge, index) => (
            <li key={index}>
              <a href={bridge.link} target="_blank" rel="noopener noreferrer">
                {bridge.name}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bridges available.</p>
      )}

      <h3>Rooms</h3>
      {rooms.length > 0 ? (
        <ul>
          {rooms.map((room) => (
            <li key={room.roomId}>{room.name || room.roomId}</li>
          ))}
        </ul>
      ) : (
        <p>No rooms found.</p>
      )}
    </div>
  );
};

export default Home;
