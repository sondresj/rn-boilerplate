import React from 'react'
import { Ionicons } from '@expo/vector-icons';

// https://ionicons.com/cheatsheet.html

export default (Platform) => class Icon extends React.PureComponent {
    render() {
        return (
			<Ionicons
                name={Platform.OS === 'ios'
                    ? `ios-${this.props.name}`
                    : `md-${this.props.name}`
                }				
                size={this.props.size || 32}
                style={this.props.style}
                color={this.props.color}
            />        
        )
    }
}