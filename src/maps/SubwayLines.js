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

const LATITUDE_DELTA = 0.2;
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
        lines_coords: []
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
        case 'G':
          color = '#c6ff00';
          break;
        case 'N':
          color = '#ffea00';
          break;
        case 'F':
          color = '#ef6c00';
          break;
        case 'E': 
          color = '#f57c00';
          break;
        case 'A':
        case 'C':
          color = '#536dfe';
          break;
        case 'D':
        case 'B':
          color = '#ffb300';
          break;
        case '1':
        case '2':
        case '3':
          color = '#e53935';
          break;
        case '4':
        case '5':
        case '6':
          color = '#4caf50';
          break;
        case 'L':
          color = '#78909c';
          break;
        case 'J':
        case 'Z':
          color = '#795548';
          break;
        case '7':
          color = '#7b1fa2';
          break;
        default:
          color = '#fafafa';
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
          const extradata = [];
          console.log(responseJson[0]);
          /*
          {
            'G': {
              name: 'G',
              stroke: 4,
              line: [
                [{}...]
              ]
            }
          }
          */

        const stations = {};

        const geoms = responseJson.map(data => {
          const { rt_symbol, name, the_geom } = data;
          if (stations[rt_symbol] === undefined) {
            stations[rt_symbol] = {
              color: this.processLineColor(rt_symbol),
              name,
              stroke: 4,
              line: [],
            };
          }
          extradata.push(this.processLineColor(data.rt_symbol));
          const arrs = the_geom.coordinates;
          const linearr = arrs.map(x => (
            { 
              latitude: x[1], 
              longitude: x[0],
            }
          ));
          stations[rt_symbol].line.push(linearr);
          return linearr;
        });

          // console.log(Object.keys(stations));
          // console.log(stations['G'].line[0]);
          this.setState({ 
            isLoading: false,
            geomarr: geoms,
            extra: extradata,
            stations,
            lines: Object.keys(stations),
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

    lineOnPress(event) {
      console.log(event);
      console.log('Line Pressed');
    }
  
    mapViewRef;
  
    render() {
      const manhattan = {
        latitude: 40.76727216,
        longitude: -73.99392888,
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
            {this.state.isLoading ? null : this.state.lines.map((l, index) => {
              const linearr = this.state.stations[l].line;
              // console.log(linearr);
              return linearr.map((arr, indx) => {
                // console.log(arr);
                const key = `${l}${indx}`;
                return ( 
                  <MapView.Polyline
                    key={key}
                    coordinates={arr}
                    strokeColor={this.state.stations[l].color}
                    strokeWidth={this.state.stations[l].stroke}
                    onPress={() => {
                      console.log('Pressed line');
                      this.state.lines.map((lin) => {
                        this.state.stations[lin].stroke = 4;
                        // this.setState({ stations[lin]: {...this.state.stations, this.state.stations[lin].stroke: 4}});
                        return null;
                      });
                      this.state.stations[l].stroke = 8;
                      this.setState({ flag: this.state.flag + 1 });
                    }}
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
