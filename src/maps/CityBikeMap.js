/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Dimensions
} from 'react-native';
import MapView from 'react-native-maps';
import { customMapStyle } from '../assets/styles/mapstyle';
// import BikeNYCCallout from '../components/BikeNYCCallout';
import dot from '../assets/images/dot.png';

const { width, height } = Dimensions.get('window');


const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.2;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class CityBikeMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      markerPosition: {
        latitude: 0,
        longitude: 0,
      },
      isLoading: true,
      markers: [
        {
          latitude: 0,
          longitude: 0,
        },
      ],
    };
  }

  componentDidMount() {
    this.requestCameraPermission();
    this.fetchMarkerData();
    this.getCurrentLocation();
    this.checkWatchPosition();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = parseFloat(position.coords.latitude);
        const long = parseFloat(position.coords.longitude);

        const initialRegion = {
          latitude: lat,
          longitude: long,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        this.setState({ initialPosition: initialRegion });
        this.setState({ markerPosition: initialRegion });
      }, (error) => {
        alert(JSON.stringify(error));
      }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  fetchMarkerData() {
    fetch('https://feeds.citibikenyc.com/stations/stations.json')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ 
          isLoading: false,
          markers: responseJson.stationBeanList, 
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  checkWatchPosition() {
    this.watchId = navigator.geolocation.watchPosition((position) => {
      const lat = parseFloat(position.coords.latitude);
      const long = parseFloat(position.coords.longitude);

      const lastRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      this.setState({ initialPosition: lastRegion });
      this.setState({ markerPosition: lastRegion });
    });
  }

  watchId = null

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'The App requires your location to funtion properly'
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You got permission');
      } else {
        console.log('You cant use location');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  mapViewRef;

  _renderMarkers(markers) {
    markers.map((marker, index) => {
      const coords = {
        latitude: marker.latitude,
        longitude: marker.longitude,
      };
      return (
        <MapView.Marker
          key={index}
          coordinate={coords}
        />
      );
    });
  }

  render() {
    const manhattan = {
      latitude: 40.76727216,
      longitude: -73.99392888,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
    return (
      <View style={styles.container}>
        <MapView
          provider="google"
          ref={(mapView) => { this.mapViewRef = mapView; }}
          style={styles.map}
          region={manhattan}
          showsUserLocation
          followsUserLocation
          loadingEnabled
          customMapStyle={customMapStyle}
        >
        {this.state.isLoading ? null : this.state.markers.map((marker, index) => {
          const coords = {
            latitude: marker.latitude,
            longitude: marker.longitude,
          };

          const metadata = `Status: ${marker.statusValue}\nAvailable Docks: ${marker.availableDocks}\nAvailable Bikes: ${marker.availableBikes}\nLast Updated: ${marker.lastCommunicationTime}`;

          return (
            <MapView.Marker
              key={index}
              coordinate={coords}
              title={marker.stationName}
              description={metadata}
              image={dot}
              pinColor='#02844e'
              onPress={(e) => {
                console.log(e.nativeEvent);
                const region = {
                  latitude: e.nativeEvent.coordinate.latitude + 0.002,
                  longitude: e.nativeEvent.coordinate.longitude,
                  latitudeDelta: LATITUDE_DELTA / 10,
                  longitudeDelta: LONGITUDE_DELTA / 10,
                };
                this.mapViewRef.animateToRegion(region, 500);
              }}
            >
              {/* <MapView.Callout 
                tooltip
              >
                <BikeNYCCallout 
                  title={marker.stationName}
                  status={marker.statusValue}
                  availableBikes={marker.availableBikes}
                  availableDocks={marker.availableDocks}
                  address={marker.stAddress1}
                  time={marker.lastCommunicationTime}
                />
              </MapView.Callout> */}
            </MapView.Marker>
          );
        })}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStylez: {
    backgroundColor: '#ffffff',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
