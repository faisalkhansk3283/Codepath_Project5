// CustomChart.js
import { Chart } from 'chart.js'; // Import the Chart class

import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

function CustomChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = chartRef.current;
    if (canvas) {
      const chart = new Chart(canvas, {
        type: 'bar',
        data,
        options: {
          // Add your chart options here
        },
      });

      return () => {
        chart.destroy();
      };
    }
  }, [data]);

  return (
    <div className="chart">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default CustomChart;
