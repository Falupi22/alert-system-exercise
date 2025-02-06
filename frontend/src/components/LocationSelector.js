
import React from "react";

const LocationSelector = ({ selectedLocations, setSelectedLocations }) => {
  const allLocations = ["Nahariya", "Tel Aviv", "Haifa", "Jerusalem"];

  const toggleLocation = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
  };

  return (
    <div className="location-selector">
      <h2>Select Locations</h2>
      <ul>
        {allLocations.map((location) => (
          <li key={location}>
            <label>
              <input
                type="checkbox"
                checked={selectedLocations.includes(location)}
                onChange={() => toggleLocation(location)}
              />
              {location}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LocationSelector;
            