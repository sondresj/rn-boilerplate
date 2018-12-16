import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Provider } from 'react-redux'
import { Linking, Font } from 'expo'

import Container from 'jasc'
import Configure from './src/configure'

export default class App extends React.Component {
	constructor(props){
		super(props)

		this.state = {
			container: null,
			intentPath: null,
			intentParams: null,
			navigatorReady: false,
		}
	}

    async componentDidMount(){
		// The property name defined here becomes available for usage as fontFamily (e.g. 'roboto')
		await Font.loadAsync({
			'open-sans': require('./assets/font/OpenSans-Regular.ttf'),
		})

		// the styles we configure in the container needs the fonts to be loaded, hence configuring after loading fonts.
		const container = Configure(new Container())

		// If you need to do more initalizing of or using a service from the container before the app is ready, do that here
		
		this.setState({container})

		// After the container is ready, we can do some checks on intents, which may result in a new activation. 
		Linking.addEventListener('url', this.handleIntent)
		let url = await Linking.getInitialURL()
		this.handleIntent(url)
	}

	shouldComponentUpdate(nextProps, nextState){
		return this.state.container !== nextState.container 
			|| this.state.navigatorReady !== nextState.navigatorReady
			|| this.state.intentPath !== nextState.intentPath
	}

	async componentDidUpdate(){
		const { container, intentParams, intentPath, navigatorReady } = this.state
		if(!container || !navigatorReady)
			return

		if(intentPath){
			// Handle an intent here, perhaps you want to navigate somewhere?			
			this.setState({intentParams: null, intentPath: null})
			return
		}		
	}

	componentWillUnmount(){
		Linking.removeAllListeners('url')
	}

	componentDidCatch(error, info){
		// console.warn('Error', error, 'in Component',info.componentStack)
		// you might want to handle it?
	}

    handleIntent = url => {
        if(!url || url.length < 1)
            return
        
        const { path, queryParams } = Linking.parse(url)

        if(!path)
			return
			
		this.setState({intentPath: path, intentParams: queryParams})
    }

	render() {
		if(!this.state.container)
			return (
				<View style={{flex: 1, backgroundColor: '#106A9E', justifyContent: 'center', alignItems: 'center'}}>
					<ActivityIndicator color='orange' size='large' />
				</View>)

		const { store, AppNavigator, Navigator } = this.state.container
		return (
			<Provider store={store}>
				<AppNavigator ref={nav => { 
					if(!this.state.navigatorReady)
						this.setState({navigatorReady: true})
					// May have to update the ref, but the navigator is still ready. 
					Navigator.setTopLevelNavigator(nav) }} />
			</Provider>
		)
	}
}
