
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import LocationSelector from "./components/LocationSelector";
import AlertListener from "./components/AlertListener";

const App = () => {
  const [selectedLocations, setSelectedLocations] = useState([]);

  return (
    <div className="app">
      <h1>Real-Time Alert System</h1>
      <LocationSelector 
        selectedLocations={selectedLocations} 
        setSelectedLocations={setSelectedLocations} 
      />
      <AlertListener selectedLocations={selectedLocations} />
      <ToastContainer />
    </div>
  );
};

export default App;
        