import React from 'react'
import Icon from '../icon'

export default (Colors) => (props) => 
	<Icon name={props.name} size={26} style={{ marginBottom: -3 }} color={props.focused ? Colors.iconSelected : Colors.iconDefault} />