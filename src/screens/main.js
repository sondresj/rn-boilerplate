import React from 'react'
import { Text, Button } from 'react-native'

export const MainScreen = (Layout, navigator, styles) => class Main extends React.PureComponent{
    render(){
        return(
            <Layout>
                <Text style={styles.text}>Welcome</Text>
                <Button
                    title='Go Back'
                    onPress={() => navigator.navigate('Entry')} />
            </Layout>
        )
    }
}

export const mainScreenMapper = (state) => ({
    // Anything you want from the redux state to be injected as props to the Main screen
})