import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 

function CatDetail({ setSelectedCat }) {
  const { catId } = useParams();
  const [catDetails, setCatDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCatDetails() {
      console.log('catId:', catId);
      try {
        const response = await fetch(`https://api.thecatapi.com/v1/breeds/${catId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch cat details: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        setCatDetails(result);
      } catch (error) {
        console.error('Error fetching cat details:', error);
      }
    }

    fetchCatDetails();
  }, [catId]);

  if (!catDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{catDetails.name}</h2>
      <p>Description: {catDetails.description}</p>
      <Link to="/" onClick={() => { navigate('/'); setSelectedCat(null); }}>
        Back to Stats and Cat Names
      </Link>
    </div>
  );
}

export default CatDetail;
