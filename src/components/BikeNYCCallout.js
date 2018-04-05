import React from 'react';
import { View, Platform, Text } from 'react-native';

const BikeNYCCallout = (props) => {
    const { 
        containerStyle, 
        lableStyle, 
        descriptionStyle, 
        timeStyle, 
        descriptionContainerStyle, 
        timeContainerStyle, 
    } = styles; 
    return (
        <View style={containerStyle}>
            <Text style={lableStyle}>{props.title}</Text>
            <View style={descriptionContainerStyle}>
                <Text style={descriptionStyle}>Status : {props.status}</Text>
                <Text style={descriptionStyle}>Available Bikes : {props.availableBikes}</Text>
                <Text style={descriptionStyle}>Available Docks : {props.availableDocks}</Text>
                <Text style={descriptionStyle}>Address : {props.address}</Text>
            </View>
            <View style={timeContainerStyle}>
                <Text style={timeStyle}>Last Updated : {props.time}</Text>
            </View>
        </View>
    );
};

const textColor = '#d6dfff';
const textColorLight = '#d6dfffcc';

export const styles = {
    containerStyle: {
        flex: 1,
        backgroundColor: '#46527a',
        height: 200,
        width: 200,
        borderRadius: 10,
        padding: 12,
    },
    lableStyle: {
        fontSize: 20,
        textAlign: 'center',
        color: textColor,
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
    },
    descriptionStyle: {
        fontSize: 12,
        textAlign: 'left',
        color: textColor,
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
    }, 
    descriptionContainerStyle: {
        flex: 1,
    },
    timeStyle: {
        textAlign: 'right',
        fontSize: 10,
        fontWeight: '100',
        fontStyle: 'italic',
        color: textColorLight,
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'Roboto',
    },
    timeContainerStyle: {
        height: 20,
        alignSelf: 'flex-end',
    }
};

export default BikeNYCCallout;
