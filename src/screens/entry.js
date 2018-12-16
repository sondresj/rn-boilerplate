import React from 'react'
import { Text, Button } from 'react-native'

export const EntryScreen = (Layout, navigator, styles) => class Entry extends React.PureComponent{
    render(){
        return(
            <Layout>
                <Text style={styles.text}>Hello</Text>
                <Button
                    title='Go Home'
                    onPress={() => navigator.navigate('Main')} />
            </Layout>
        )
    }
}

export const entryScreenMapper = (state) => ({
    // Anything you want from the redux state to be injected as props to the Main screen
})