
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const AlertListener = ({ selectedLocations }) => {
  useEffect(() => {
    const socket = io("http://localhost:30001"); // Replace with your backend URL

    socket.on("alert", (data) => {
      const { location, eventType, type, sentTime, duration } = data;
      console.log("Alert received", data);
      if (selectedLocations.includes(location)) {
        toast.info(
          `${eventType.toUpperCase()} Alert: ${type} in ${location} 
          (${new Date(sentTime).toLocaleTimeString()} - 
          ${new Date(duration).toLocaleTimeString()})`
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedLocations]);

  return null;
};

export default AlertListener;
            