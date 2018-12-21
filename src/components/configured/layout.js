import React from 'react'
import { View, StatusBar, StyleSheet, Text } from 'react-native'

export const MainLayout = () => class Main extends React.PureComponent {
    render(){
        return (
            <View style={styles.mainContainer}>
                <StatusBar barStyle={'light-content'} />
                {this.props.children}
            </View>
        )
    }
}

export const MiscLayout = () => class Misc extends React.PureComponent {
    render(){
        return (
            <View style={styles.miscContainer}>
                <StatusBar hidden={true} />
                <Text style={styles.title}>RN Boilerplate</Text>
                {this.props.children}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    miscContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#106A9E',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 50,
        paddingBottom: 40,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22,
        color: 'white',
        fontFamily: 'open-sans'
    }
})