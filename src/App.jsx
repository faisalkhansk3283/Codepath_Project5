import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [temperatureFilter, setTemperatureFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [totalItems, setTotalItems] = useState(0); // Add state for totalItems
  const [meanTemperature, setMeanTemperature] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.weatherbit.io/v2.0/current?lat=35.7796&lon=-78.6382&key=00d364ab88d647a7b3ab7a5bba620422');
        const result = await response.json();
        setData(result.data);
        setFilteredData(result.data);
        setTotalItems(result.data.length); // Set the total number of items
        setMeanTemperature(
          (
            result.data.reduce((sum, item) => sum + item.temp, 0) / result.data.length
          ).toFixed(2)
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
    const filteredData = data.filter((item) =>
      item.city_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filteredData);
  }

  const handleTemperatureFilter = (event) => {
    const selectedTemperature = event.target.value;
    setTemperatureFilter(selectedTemperature);
    const filteredData = data.filter((item) => {
      if (selectedTemperature === 'cold') {
        return item.temp < 10;
      } else if (selectedTemperature === 'warm') {
        return item.temp >= 10;
      }
      return true;
    });
    setFilteredData(filteredData);
  }

  return (
    <div className="App">
      <h1>Data Dashboard</h1>

      <div className="summary">
        <p>Total Items: {totalItems}</p>
        <p>Mean Temperature: {meanTemperature}°C</p>
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <select value={temperatureFilter} onChange={handleTemperatureFilter}>
        <option value="">Select Temperature</option>
        <option value="cold">Cold</option>
        <option value="warm">Warm</option>
      </select>

      <div className="data-list">
        {filteredData.map((item) => (
          <div key={item.city_name}>
            <h2>{item.city_name}</h2>
            <p>Temperature: {item.temp}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
