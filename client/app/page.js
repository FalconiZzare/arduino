'use client'

import React, { useEffect, useState } from "react";
import socketIOClient from 'socket.io-client';
import axios from 'axios';
import { log } from "next/dist/server/typescript/utils";

const ENDPOINT = 'http://localhost:5000';

export default function Home() {
  const [rfidData, setRfidData] = useState("151");
  const [userInfo, setUserInfo] = useState(null);

  const getData = async (data) => {
    axios.get(`${ENDPOINT}/api/user-info/${data}`)
      .then(response => {
        setUserInfo(response.data);
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  }

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);

    socket.on('rfidData', data => {
      console.log('Received RFID data:', data);
      setRfidData(data);
      // Send the RFID data to the backend to query the database
      getData(data).then(r => console.log(r))
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="App">
        <header className="App-header">
          <h1>RFID Reader</h1>
          <button
            className={"outline-1 border-white border p-2 rounded-xl"}
            onClick={() => getData("151")}
          >
            Manual Fetch
          </button>
          {rfidData && (
            <div>
              <p>RFID Data: {rfidData}</p>
              {userInfo ? (
                <div>
                  <h2>User Info</h2>
                  <pre>{JSON.stringify(userInfo, null, 2)}</pre>
                </div>
              ) : (
                <p>Loading user info...</p>
              )}
            </div>
          )}
        </header>
      </div>
    </main>
  );
}
