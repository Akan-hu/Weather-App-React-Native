import axios from 'axios';
import {WEATHER_API_KEY} from '../constants';

const forecastEndPoint = params =>
  `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const searchEndPoint = params =>
  `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${params.cityName}`;

const apiCall = async endpoint => {
  const options = {
    method: 'GET',
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log('error: ', error);
    return null;
  }
};

export const fetchWeatherForecast = params => {
  let forecastUrl = forecastEndPoint(params);
  return apiCall(forecastUrl);
};
export const fetchLocations = params => {
  let forecastUrl = searchEndPoint(params);
  return apiCall(forecastUrl);
};
