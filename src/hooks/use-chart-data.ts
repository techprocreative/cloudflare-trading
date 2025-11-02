import { useState, useEffect } from 'react';
const generateInitialData = () => {
  const data = [];
  let price = 1.0750;
  const now = new Date();
  for (let i = 59; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 1000);
    price += (Math.random() - 0.5) * 0.0002;
    data.push({
      time: time.toLocaleTimeString([], { second: '2-digit' }),
      price: price,
    });
  }
  return data;
};
export const useChartData = () => {
  const [data, setData] = useState(generateInitialData());
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        const lastDataPoint = newData[newData.length - 1];
        let newPrice = lastDataPoint.price + (Math.random() - 0.5) * 0.0002;
        // Add a slight upward drift
        newPrice += 0.00001;
        if (newPrice < 1.0700) newPrice = 1.0700;
        if (newPrice > 1.0800) newPrice = 1.0800;
        const newTime = new Date().toLocaleTimeString([], { second: '2-digit' });
        // Shift old data and add new data point
        newData.shift();
        newData.push({ time: newTime, price: newPrice });
        return newData;
      });
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);
  return data;
};