import React from 'react'
import { createStackNavigator, createSwitchNavigator, createBottomTabNavigator, createAppContainer, NavigationActions } from 'react-navigation'

// Docs on react-navigation: https://reactnavigation.org/docs/en/getting-started.html

export const createNavigator = (styles, TabBarIcon, Entry, Main) => {
    const defaultNavigationOptions = {
        title: 'RN Boilerplate',
        headerTintColor: 'lightcyan',
        headerStyle: styles.header,
        headerTitleStyle: [styles.headerText, styles.text],
        headerBackTitle: null // Removes text for back button, only keeps the arrow back
    }

    const mainStack = createStackNavigator({ Main }, {
        initialRouteName: 'Main',
        defaultNavigationOptions: { ...defaultNavigationOptions, title: 'Home' },
        navigationOptions: {
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
                <TabBarIcon
                    focused={focused}
                    name='home'
                />)
        }})

    return createAppContainer(createSwitchNavigator(
        {
            Entry, // Add other screens that are manually navigated to here 
            Main: createBottomTabNavigator({ mainStack /** add other stacks here */ })
        },
        { initialRouteName: 'Entry', defaultNavigationOptions }))
}

/**
 * This Navigator should be used instead of the react-navigation injected prop 'navigation'. 
 * Inject this class into any component that could do navigation.
 * You should avoid passing params, but use the redux state instead. This navigator still supports passing params, because it may be useful in some scenarions. 
 * This class could also be reduxified to set the current screen and a navigation-stack in the redux state, but I've yet to find a use-case for it. 
 */
export class Navigator {
    constructor() {
        this._navigatorRef = null
    }

    setTopLevelNavigator = (navigator) => {
        this._navigatorRef = navigator
    }

    navigate = (routeName, params) => {
        if (!this._navigatorRef) {
            console.warn('Navigator._navigatorRef is not yet set!')
            return
        }

        this._navigatorRef.dispatch(
            NavigationActions.navigate({
                routeName,
                params
            })
        )
    }
}