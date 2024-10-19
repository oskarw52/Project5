import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [popularCityName, setPopularCityName] = useState(null);
  const [popularCityCount, setPopularCityCount] = useState(0);
  const [averageBreweriesPerCity, setAverageBreweriesPerCity] = useState(0);
  const [totalCities, setTotalCities] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [citySizeFilter, setCitySizeFilter] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('');

  const doCalculations = () => {
    const hashmap = new Map();

    data.forEach(brewery => {
      if (hashmap.has(brewery.city)) {
        hashmap.set(brewery.city, hashmap.get(brewery.city) + 1);
      } else {
        hashmap.set(brewery.city, 1);
      }
    });

    let popularCity = null;
    let maxCount = 0;
    let totalBreweries = 0;

    hashmap.forEach((count, city) => {
      totalBreweries += count;
      if (count > maxCount) {
        maxCount = count;
        popularCity = city;
      }
    });

    const totalCities = hashmap.size;
    const average = totalBreweries / totalCities;

    setPopularCityName(popularCity);
    setPopularCityCount(maxCount);
    setAverageBreweriesPerCity(average);
    setTotalCities(totalCities);
  };

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("https://api.openbrewerydb.org/v1/breweries?by_state=illinois&per_page=200");
      const json = await response.json();
      setData(json);
      console.log(json);
    };
    getData().catch(console.error);
  }, []);

  useEffect(() => {
    if (data) {
      doCalculations();
    }
  }, [data]);

  const filteredBreweries = data?.filter(brewery => {
    const cityBreweryCount = data.filter(b => b.city === brewery.city).length;
    const matchesCitySizeFilter = citySizeFilter === '' ||
      (citySizeFilter === '1' && cityBreweryCount === 1) ||
      (citySizeFilter === '2-10' && cityBreweryCount >= 2 && cityBreweryCount <= 10) ||
      (citySizeFilter === '10+' && cityBreweryCount > 10);

    const matchesWebsiteFilter = websiteFilter === '' ||
      (websiteFilter === 'hasWebsite' && brewery.website_url);

    return (selectedType === '' || brewery.brewery_type === selectedType) &&
      (brewery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brewery.city.toLowerCase().includes(searchQuery.toLowerCase())) &&
      matchesCitySizeFilter &&
      matchesWebsiteFilter;
  });

  return (
    <div className="app-container">
      <h1>Illinois Breweries</h1>
      {data && (
        <h2>Total Cities with Breweries: {totalCities}</h2>
      )}
      {data && (
        <h2>Average Breweries per City: {averageBreweriesPerCity.toFixed(2)}</h2>
      )}
      {data && popularCityName && (
        <h2>Most Popular City in Illinois: {popularCityName} with {popularCityCount} breweries</h2>
      )}
      <div className="filters">
        <label htmlFor="brewery-type">Filter by Brewery Type:</label>
        <select
          id="brewery-type"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">All</option>
          <option value="brewpub">Brewpub</option>
          <option value="micro">Micro</option>
          <option value="contract">Contract</option>
          <option value="planning">Planning</option>
          <option value="large">Large</option>
          <option value="regional">Regional</option>
          <option value="proprietor">Proprietor</option>
        </select>
        <label htmlFor="city-size">Filter by City Size:</label>
        <select
          id="city-size"
          value={citySizeFilter}
          onChange={e => setCitySizeFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="1">1 Brewery</option>
          <option value="2-10">2-10 Breweries</option>
          <option value="10+">More than 10 Breweries</option>
        </select>
        <label htmlFor="website-filter">Filter by Website:</label>
        <select
          id="website-filter"
          value={websiteFilter}
          onChange={e => setWebsiteFilter(e.target.value)}
        >
          <option value="">Any</option>
          <option value="hasWebsite">Has Website</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or city"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      {filteredBreweries && (
        <div className="brewery-list">
          <h2>List of Breweries:</h2>
          <ul>
            {filteredBreweries.map(brewery => (
              <li key={brewery.id} className="brewery-item">
                <strong>Name:</strong> {brewery.name}, <strong>City:</strong> {brewery.city}, <strong>Type:</strong> {brewery.brewery_type}, <strong>Website:</strong> {brewery.website_url ? <a href={brewery.website_url} target="_blank" rel="noopener noreferrer" className="brewery-website">{brewery.website_url}</a> : 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;