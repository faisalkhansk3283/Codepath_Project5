import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import CatDetail from './CatDetail';
//import Chart from './Chart'; // Import your Chart component
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

//import { HorizontalBar } from 'react-chartjs-2';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [childFriendlyFilter, setChildFriendlyFilter] = useState(0);
  const [sheddingLevelFilter, setSheddingLevelFilter] = useState('Any');
  const [selectedCat, setSelectedCat] = useState(null);
  // Inside your component
const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds?limit=30');
        const result = await response.json();
        setData(result);
        setFilteredData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
    filterData(searchTerm, childFriendlyFilter, sheddingLevelFilter);
  }

  const handleChildFriendlyFilter = (value) => {
    setChildFriendlyFilter(value);
    filterData(searchTerm, value, sheddingLevelFilter);
  }

  const handleSheddingLevelFilter = (value) => {
    setSheddingLevelFilter(value);
    filterData(searchTerm, childFriendlyFilter, value);
  }

  const filterData = (search, childFriendly, sheddingLevel) => {
    const filteredData = data
      .filter((item) => (
        item.name.toLowerCase().includes(search.toLowerCase()) &&
        item.child_friendly >= childFriendly &&
        (sheddingLevel === 'Any' || item.shedding_level.toString() === sheddingLevel)
      ));

    setFilteredData(filteredData);
  }

  const calculateMean = (attribute) => {
    const total = data.reduce((acc, item) => acc + item[attribute], 0);
    return (total / data.length).toFixed(2);
  }

  const calculateQuartiles = (attribute) => {
    const filteredData = data.filter((item) => item[attribute] !== undefined);

    if (filteredData.length === 0) {
      return ['N/A', 'N/A', 'N/A'];
    }

    const sortedData = [...filteredData].sort((a, b) => a[attribute] - b[attribute]);
    const mid = Math.floor(sortedData.length / 2);

    const lowerHalf = mid % 2 === 0
      ? sortedData.slice(0, mid)
      : sortedData.slice(0, mid + 1);

    const upperHalf = sortedData.slice(mid);

    const lowerQuartile = lowerHalf[Math.floor(lowerHalf.length / 2)][attribute];
    const median = mid % 2 === 0
      ? (lowerHalf[mid - 1][attribute] + upperHalf[0][attribute]) / 2
      : upperHalf[0][attribute];

    const upperQuartile = upperHalf[Math.floor(upperHalf.length / 2)][attribute];

    return [lowerQuartile, median, upperQuartile];
  }

  const totalItems = data.length;
  const meanAffectionLevel = calculateMean('affection_level');
  const meanStrangerFriendly = calculateMean('stranger_friendly');
  const meanChildFriendly = calculateMean('child_friendly');

  const [affectionQuartiles, setAffectionQuartiles] = useState([]);
  const [strangerFriendlyQuartiles, setStrangerFriendlyQuartiles] = useState([]);
  const [childFriendlyQuartiles, setChildFriendlyQuartiles] = useState([]);

  useEffect(() => {
    const affectionQuartiles = calculateQuartiles('affection_level');
    const strangerFriendlyQuartiles = calculateQuartiles('stranger_friendly');
    const childFriendlyQuartiles = calculateQuartiles('child_friendly');

    setAffectionQuartiles(affectionQuartiles);
    setStrangerFriendlyQuartiles(strangerFriendlyQuartiles);
    setChildFriendlyQuartiles(childFriendlyQuartiles);
  }, [data]);

  const chartData = {
    labels: filteredData.map((cat) => cat.name),
    datasets: [
      {
        label: 'Child-Friendly Level',
        data: filteredData.map((cat) => cat.child_friendly),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };
  const renderChart = () => {
    // Increase the key to re-render the chart component and destroy the previous chart
    /*
          <div className="bar-chart-container">
            {filteredData.map((item) => (
              <div key={item.id} className="bar">
                <div className="bar-label">{item.name}</div>
                <div className="bar-value">
                  <div
                    style={{ width: `${item.child_friendly * 20}px` }}
                    className="bar-fill"
                  ></div>
                </div>
              </div>
            ))}
          </div>
*/
    setChartKey(chartKey + 1);
  };

  return (
    <div className="App">
      <h1>Cat Breed Dashboard</h1>
      <Routes>
        <Route path="/cat/:catId" element={<CatDetail setSelectedCat={setSelectedCat} />} />
      </Routes>
      {!selectedCat ? (
        <div>
          <div className="summary">
            <p>Total Items: {totalItems}</p>
            <p>Mean Affection Level: {meanAffectionLevel}</p>
            <p>Mean Stranger-Friendly Level: {meanStrangerFriendly}</p>
            <p>Mean Child-Friendly Level: {meanChildFriendly}</p>
          </div>

          <div className="quartiles">
            <p>Affection Level Quartiles: Q1 = {affectionQuartiles[0]}, Q2 (Median) = {affectionQuartiles[1]}, Q3 = {affectionQuartiles[2]}</p>
            <p>Stranger-Friendly Level Quartiles: Q1 = {strangerFriendlyQuartiles[0]}, Q2 (Median) = {strangerFriendlyQuartiles[1]}, Q3 = {strangerFriendlyQuartiles[2]}</p>
            <p>Child-Friendly Level Quartiles: Q1 = {childFriendlyQuartiles[0]}, Q2 (Median) = {childFriendlyQuartiles[1]}, Q3 = {childFriendlyQuartiles[2]}</p>
          </div>
  
          <div className="filters">
            <input
              type="text"
              placeholder="Search Cat Names..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="filter">
              <label>Child Friendly: </label>
              <select
                value={childFriendlyFilter}
                onChange={(e) => handleChildFriendlyFilter(e.target.value)}
              >
                <option value={0}>Any</option>
                <option value={4}>4 and above</option>
              </select>
            </div>
            <div className="filter">
              <label>Shedding Level: </label>
              <select
                value={sheddingLevelFilter}
                onChange={(e) => handleSheddingLevelFilter(e.target.value)}
              >
                <option value="Any">Any</option>
                <option value="1">Low</option>
                <option value="2">Moderate</option>
                <option value="3">High</option>
                <option value="4">Very High</option>
              </select>
            </div>
          </div>


          
<Bar
  data={{
    labels: filteredData.map((cat) => cat.name),
    datasets: [
      {
        label: 'Child-Friendly Level',
        data: filteredData.map((cat) => cat.child_friendly),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }}
  options={{
    scales: {
      x: {
        type: 'category', // Use 'category' for the X-axis
        position: 'bottom',
        title: {
          display: true,
          text: 'Cat Breed',
        },
      },
      y: {
        type: 'linear', // Use 'linear' for the Y-axis
        position: 'left',
        title: {
          display: true,
          text: 'Child-Friendly Level',
        },
        ticks: {
          min: 1, // Minimum Y-axis value
          max: 5, // Maximum Y-axis value
          stepSize: 1, // Step size between ticks
        },
      },
    },
  }}
/>



          <h1>Cat Names</h1>
          <table className="data-list">
            <thead></thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/cat/${item.id}`} onClick={() => setSelectedCat(item)}>
                      {item.name}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default App;
