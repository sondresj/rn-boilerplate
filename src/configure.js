import { combineReducers, createStore, applyMiddleware } from 'redux'
import { connect } from 'react-redux'
import { Platform } from 'react-native'
import { Constants } from 'expo'

import styles from './styles'
import colors from './colors'

import TabBarIcon from './components/tabBarIcon'
import Icon from './components/icon'
import { MainLayout, MiscLayout } from './components/layout'

import { EntryScreen, entryScreenMapper } from './screens/entry'
import { MainScreen, mainScreenMapper } from './screens/main'

import { createNavigator, Navigator } from './navigation'

import { StorageActions, storageReducer } from './actions/storage'

export default container => {
    const isDev = Constants.manifest.packagerOpts && Constants.manifest.packagerOpts.dev

    const rootReducer = combineReducers({
        storage: storageReducer,
    })

    const logger = () => next => action => {
        console.log('Dispatching action: ', action.type)
        return next(action)
    }

    return container
        .serve('DEBUG', () => isDev)
        .serve('appVersion', () => isDev
            ? '9.9.999' // Foo dev version
            : Platform.OS == 'ios'
                ? Constants.manifest.ios.buildNumber
                : Constants.manifest.android.versionCode)
        .serve('store', () => isDev
            ? createStore(rootReducer, applyMiddleware(logger))
            : createStore(rootReducer))
        .serve('run', ioc => {
            const { store } = ioc
            return (type, data = {}) => { store.dispatch({ type, ...data }) }
        })
        .serve('Navigator', () => new Navigator())
        .serve('StorageActions', ioc => new StorageActions(ioc.run))
        .serve('colors', () => colors)
        .serve('styles', ioc => styles(ioc.colors))
        .serve('Icon', () => Icon(Platform))
        .serve('MainLayout', ioc => MainLayout())
        .serve('MiscLayout', ioc => MiscLayout())
        .serve('TabBarIcon', ioc => TabBarIcon(ioc.colors, Platform))
        .serve('EntryScreen', ioc => connect(entryScreenMapper)(EntryScreen(ioc.MiscLayout, ioc.Navigator, ioc.styles)))
        .serve('MainScreen', ioc => connect(mainScreenMapper)(MainScreen(ioc.MainLayout, ioc.Navigator, ioc.styles)))
        .serve('AppNavigator', ioc => createNavigator(ioc.styles, ioc.TabBarIcon, ioc.EntryScreen, ioc.MainScreen))
}