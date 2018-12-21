import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Platform } from 'react-native'

// https://ionicons.com/cheatsheet.html

export default (props) =>
    <Ionicons name={Platform.OS === 'ios'
            ? `ios-${props.name}`
            : `md-${props.name}`}
        size={props.size || 32}
        style={props.style}
        color={props.color}
    />