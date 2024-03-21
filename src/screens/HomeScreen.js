/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  StatusBar,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {styles} from './styles';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import {MapPinIcon} from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from '../api/wather';
import * as Progress from 'react-native-progress';
import {getStoredData, storeData} from '../utils/asyncStorage';

const HomeScreen = () => {
  const [showInput, setShowInput] = useState(false);
  const [location, setLocation] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const {location: locationData, current, forecast} = weatherData;
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    fetchInitialCityData();
  }, []);
  const fetchInitialCityData = async () => {
    let myCity = await getStoredData('City');
    let currentCity = 'Bareilly';
    if (myCity) {
      currentCity = myCity;
    }
    fetchWeatherForecast({cityName: currentCity, days: '7'}).then(data => {
      setWeatherData(data);
      setLoader(false);
    });
  };
  const handleSearch = value => {
    if (value.length > 2) {
      fetchLocations({cityName: value}).then(data => {
        setLocation(data);
      });
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  const hanldeLocation = _location => {
    setLocation([]);
    setShowInput(false);
    setLoader(true);
    fetchWeatherForecast({cityName: _location?.name, days: '7'}).then(data => {
      setWeatherData(data);
      setLoader(false);
      storeData('City', _location?.name);
    });
  };
  return (
    <View style={styles.container}>
      <StatusBar style={'light'} />
      <Image source={require('../assets/day.jpg')} style={styles.imageStyle} />
      {loader ? (
        <View style={styles.loaderMainView}>
          <Progress.CircleSnail
            size={100}
            indeterminate={true}
            color={'black'}
            thickness={4}
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <View>
            <View style={styles.header(showInput)}>
              {showInput ? (
                <TextInput
                  placeholder="Search City"
                  placeholderTextColor={'#454545'}
                  style={styles.input}
                  onChangeText={handleTextDebounce}
                />
              ) : null}

              <TouchableOpacity
                style={styles.tchStyle(showInput)}
                onPress={() => setShowInput(!showInput)}>
                <MagnifyingGlassIcon size={25} color={'black'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cityTextView}>
            <Text style={styles.cityText}>
              {locationData?.name + ','}
              {locationData?.region ? (
                <Text style={styles.countryText}> {locationData?.region}</Text>
              ) : (
                <Text style={styles.countryText}> {locationData?.country}</Text>
              )}
            </Text>
            {/** View for showing image */}
            <View style={styles.imgView}>
              <Image
                source={{uri: 'https:' + current?.condition?.icon}}
                style={styles.imgStyle}
              />
            </View>
            {location.length > 0 && showInput ? (
              <View style={styles.searchList}>
                {location.map((loc, index) => {
                  let showBorder = index + 1 !== location.length;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.tchSearch(showBorder)}
                      onPress={() => hanldeLocation(loc)}>
                      <MapPinIcon color={'gray'} size={25} />
                      <Text style={styles.searchText}>
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
            {/** View for showing temprature */}
            <View>
              <Text style={styles.degreeText}>{current?.temp_c}&#176;C</Text>
              <Text style={styles.cloudyText}>{current?.condition?.text}</Text>
            </View>
            <View style={styles.otherItems}>
              <View style={styles.weatherStatus}>
                <Image
                  source={require('../assets/wind.png')}
                  style={styles.windImg2}
                />
                <Text style={styles.km}>{current?.wind_kph}km</Text>
              </View>
              <View style={styles.weatherStatus}>
                <Image
                  source={require('../assets/drop.png')}
                  style={styles.windImg}
                />
                <Text style={styles.km}>{current?.humidity}%</Text>
              </View>
              <View style={styles.weatherStatus}>
                <Image
                  source={require('../assets/sun.png')}
                  style={styles.windImg}
                />
                <Text style={styles.km}>6:05 AM</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      )}
      {/** Foracast for next days */}
      {loader ? null : (
        <View style={styles.forcastViewMain}>
          <View style={styles.forcastView}>
            <CalendarDaysIcon size={25} color={'black'} />
            <Text style={styles.forecastText}>Daily Forecast</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {forecast?.forecastday?.map((item, index) => {
              let date = new Date(item?.date);
              let options = {weekday: 'long'};
              let dayName = date.toLocaleDateString('en-US', options);
              const days = dayName?.split(',')[0];
              return (
                <View style={styles.forcastImageView} key={index}>
                  <Image
                    source={{uri: 'https:' + item?.day?.condition?.icon}}
                    style={styles.forecastImg}
                  />
                  <Text style={styles.days}>{days}</Text>
                  <Text style={styles.celcious}>
                    {item?.day?.avgtemp_c}&#176;
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;
