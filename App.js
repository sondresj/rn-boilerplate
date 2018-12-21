import React from 'react'
import { Provider } from 'react-redux'
import { Linking, Font, AppLoading, Updates } from 'expo'
import { AppState, Platform, AsyncStorage } from 'react-native'

import asyncAlert from './src/util/asyncalert'

import Configure from './src/configure'

const appStateForCachingRedux = Platform.OS === 'ios' ? 'inactive' : 'background'

export default class App extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			container: null,
			intentPath: null,
			intentParams: null,
			navigatorReady: false,
		}
	}

	async componentDidMount() {
		AppState.addEventListener('change', this.handleAppStateChange)
		Linking.addEventListener('url', this.handleIntent)
		this._updatesSubscription = Updates.addListener(this.handleUpdate)

		// The property name defined here becomes available for usage as fontFamily (e.g. 'roboto')
		await Font.loadAsync({
			'open-sans-bold': require('./assets/font/OpenSans-Bold.ttf'),
			'open-sans-italic': require('./assets/font/OpenSans-Italic.ttf'),
			'open-sans': require('./assets/font/OpenSans-Regular.ttf'),
		})

		const cachedStateJson = await AsyncStorage.getItem('cachedReduxState')
		const cachedState = cachedStateJson && cachedStateJson.length ? JSON.parse(cachedStateJson) : undefined

		// the styles we configure in the container needs the fonts to be loaded, hence configuring after loading fonts.
		const container = Configure(cachedState)

		// If you need to do more initalizing of or using a service from the container before the app is ready, do that here

		this.setState({ container })

		// After the container is ready, we can do some checks on intents
		let url = await Linking.getInitialURL()
		this.handleIntent(url)
	}

	async componentDidUpdate() {
		const { container, intentParams, intentPath, navigatorReady } = this.state
		if (!container || !navigatorReady)
			return

		if (intentPath) {
			// Handle an intent here, perhaps you want to navigate somewhere?			
			this.setState({ intentParams: null, intentPath: null })
			return
		}
	}

	componentWillUnmount() {
		Linking.removeAllListeners('url')
		AppState.removeEventListener('change', this.handleAppStateChange)
		this._updatesSubscription && this._updatesSubscription.remove()
	}

	componentDidCatch(error, info) {
		// console.warn('Error', error, 'in Component',info.componentStack)
		// you might want to handle it?
	}

	handleIntent = url => {
		if (!url || url.length < 1) return
		const { path, queryParams } = Linking.parse(url)
		if (!path) return

		this.setState({ intentPath: path, intentParams: queryParams })
	}

	handleAppStateChange = (nextAppState) => {
		console.log('NEXT APPSTATE:', nextAppState)
		if(nextAppState === appStateForCachingRedux) // We are going to inactive or background
			AsyncStorage.setItem('cachedReduxState', JSON.stringify(this.state.container.store.getState()))
	}

	handleUpdate = (update) => {
		if(update.type === Updates.EventType.DOWNLOAD_FINISHED){
			asyncAlert.okCancelAlertAsync('New version available', 'Start using the new version now?', 'Heck yes!', 'Later...')
				.then(answer => answer && Updates.reload())
		}
	}

	render() {
		if (!this.state.container)
			return (<AppLoading />)

		const { store, AppNavigator, Navigator } = this.state.container
		return (
			<Provider store={store}>
				<AppNavigator ref={nav => {
					if (!this.state.navigatorReady)
						this.setState({ navigatorReady: true })
					// May have to update the ref, but the navigator is still ready. 
					Navigator.setTopLevelNavigator(nav)
				}} />
			</Provider>
		)
	}
}
