import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Dimensions
} from 'react-native';
import MapView from 'react-native-maps';
import { customMapStyle } from '../assets/styles/mapstyle';

const { width, height } = Dimensions.get('window');


const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.3;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class SubwayLines extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        initialPosition: {
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0,
          longitudeDelta: 0,
        },
        isLoading: true,
      };
    }
  
    componentDidMount() {
      this.requestLocationPermission();
      this.fetchMarkerData();
      this.getCurrentLocation();
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

    processLineColor(lineSymbol) {
      let color = '#000';
      switch (lineSymbol) {
        case 'A':
          color = '#0d47a1';
          break;
        case 'B':
          color = '#fb8c00';
          break;
        case 'C':
          color = '#1e88e5';
          break;
        case 'D':
          color = '#ff9800';
          break;
        case 'E': 
          color = '#29b6f6';
          break;
        case 'F':
          color = '#ff3d00';
          break;
        case 'G':
          color = '#b2ff59';
          break;
        case 'J':
          color = '#4e342e';
          break;
        case 'L':
          color = '#78909c';
          break;
        case 'M':
          color = '#ff6e40';
          break;
        case 'N':
          color = '#26a69a';
          break;
        case 'Q':
          color = '#e040fb';
          break;
        case 'R':
          color = '#5e35b1';
          break;
        case 'S':
          color = '#607d8b';
          break;
        case 'W':
          color = '#eeff41';
          break;
        case 'Z':
          color = '#795548';
          break;
        case '1':
          color = '#f44336';
          break;
        case '2':
          color = '#e53935';
          break;
        case '3':
          color = '#b71c1c';
          break;
        case '4':
          color = '#4caf50';
          break;
        case '5':
          color = '#388e3c';
          break;
        case '6':
          color = '#1b5e20';
          break;
        case '7':
          color = '#ab47bc';
          break;
        default:
          color = '#000';
      }
      return color;
    }
  
    fetchMarkerData() {
      fetch('https://data.cityofnewyork.us/resource/s7zz-qmyz.json', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-App-Token': 'IRdk1CHt8lJWw6j5XpC1BoK0W',
        },
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson[0]);

        const stations = {};

        const geoms = responseJson.map(data => {
          const { name, the_geom } = data;
          const sharedLines = name.split('-');
          sharedLines.forEach((sym) => {
            if (stations[sym] === undefined) {
              stations[sym] = {
                lineColor: this.processLineColor(sym),
                name,
                stroke: 4,
                lineArr: [],
              };
            }
          });

          const arrs = the_geom.coordinates;
          const linearr = arrs.map(x => (
            { 
              latitude: x[1], 
              longitude: x[0],
            }
          ));
          sharedLines.forEach((sym) => {
            stations[sym].lineArr.push(linearr);
          });
          return linearr;
        });

          console.log(Object.keys(stations));
          // console.log(stations['G'].lineArr[0]);
          this.setState({ 
            isLoading: false,
            geomarr: geoms,
            stations,
            lineName: Object.keys(stations),
            flag: 0
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  
    watchId = null
  
    async requestLocationPermission() {
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

    lineOnPress(idxLine, line) {
      const temp = this.state.lineName[this.state.lineName.length - 1];
      this.state.lineName[this.state.lineName.length - 1] = this.state.lineName[idxLine
      ];
      this.state.lineName[idxLine] = temp;
      console.log('Pressed lineArr');
      this.state.lineName.map((lin) => {
        this.state.stations[lin].stroke = 4;
        return null;
      });
      this.state.stations[line].stroke = 8;
      this.setState({ flag: this.state.flag + 1 });
    }
  
    mapViewRef;
  
    render() {
      const manhattan = {
        latitude: 40.729086756382,
        longitude: -73.9291111395031,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      console.log(this.mapViewRef);
      return (
        <View style={styles.container}>
          <MapView
            ref={(mapView) => { this.mapViewRef = mapView; }}
            style={styles.map}
            region={this.mapViewRef === undefined ? manhattan : this.mapViewRef.__lastRegions}
            showsUserLocation
            followsUserLocation
            loadingEnabled
            customMapStyle={customMapStyle}
          >
            {this.state.isLoading ? null : this.state.lineName.map((line, idxLine) => {
              const linearr = this.state.stations[line].lineArr;
              // console.log(linearr);
              return linearr.map((coords, idxCoordinates) => {
                // console.log(coords);
                const key = `${line}${idxCoordinates}${idxLine}`;
                return ( 
                  <MapView.Polyline
                    key={key}
                    coordinates={coords}
                    strokeColor={this.state.stations[line].lineColor}
                    strokeWidth={this.state.stations[line].stroke}
                    onPress={() => this.lineOnPress(idxLine, line)}
                  />
                );
              });
              })
            }
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
