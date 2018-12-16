import React from 'react'
import { Ionicons } from '@expo/vector-icons'

export default (Colors, Platform) => class TabBarIcon extends React.PureComponent {
	render() {
		return (
			<Ionicons
				name={Platform.OS === 'ios'
					? `ios-${this.props.name}`
					: `md-${this.props.name}`
				}
				size={26}
				style={{ marginBottom: -3 }}
				color={this.props.focused ? Colors.iconSelected : Colors.iconDefault}
			/>
		)
	}
}