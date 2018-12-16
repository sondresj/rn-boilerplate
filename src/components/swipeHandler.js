import React, { Component } from 'react'
import { PanResponder, Animated, Dimensions } from 'react-native'

export const swipeDirections = {
    SWIPE_LEFT: 'SWIPE_LEFT',
    SWIPE_RIGHT: 'SWIPE_RIGHT'
}

function isValidSwipe(velocity, velocityThreshold, directionalOffset, directionalOffsetThreshold) {
    return Math.abs(velocity) > velocityThreshold && Math.abs(directionalOffset) < directionalOffsetThreshold
}

export default class SwipeHandler extends Component {
    constructor(props, context) {
        super(props, context)
        this.swipeConfig = {
            velocityThreshold: 0.35,
            directionalOffsetThreshold: Dimensions.get('window').width * 0.25
        }
        this.translateX = new Animated.Value(0)
        this.fadeAnim = new Animated.Value(1)
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this._handleShouldSetPanResponder,
            onMoveShouldSetPanResponder: this._handleShouldSetPanResponder,
            onPanResponderRelease: this._handlePanResponderEnd,
            onPanResponderTerminate: this._handlePanResponderEnd,
            onMoveShouldSetResponderCapture: () => true,
            onPanResponderMove: Animated.event([null, { dx: this.translateX }]),
        })
    }

    _handleShouldSetPanResponder = (evt, gestureState) => evt.nativeEvent.touches.length === 1 && !this._gestureIsClick(gestureState)

    _gestureIsClick = (gestureState) => Math.abs(gestureState.dx) < 25 // Increase this value to reduce the chance for swiping when touching at an angle (try touching fast with a a tiny swiping gesture)

    _handlePanResponderEnd = (evt, gestureState) => {
        const screenWidth = Dimensions.get("window").width
        this.fadeAnim.setValue(0)

        const { dx } = gestureState
        if (this._isValidHorizontalSwipe(gestureState)) {
            Animated.sequence([
                Animated.timing(this.translateX, {
                    toValue: dx > 0 ? screenWidth : -screenWidth,
                    duration: 200
                }).start(() => this.translateX.setValue(0)),
                Animated.timing(this.fadeAnim, {
                      toValue: 1,
                      duration: 600,}
                  ).start()
            ])
        } else {
            Animated.spring(this.translateX, {
                toValue: 0,
                bounciness: 10
            }).start()
            this.fadeAnim.setValue(1)
        }
        const swipeDirection = this._getSwipeDirection(gestureState)
        this._triggerSwipeHandlers(swipeDirection, gestureState)
    }

    _triggerSwipeHandlers(swipeDirection, gestureState) {
        const { onSwipe, onSwipeLeft, onSwipeRight } = this.props
        const { SWIPE_LEFT, SWIPE_RIGHT, } = swipeDirections
        onSwipe && onSwipe(swipeDirection, gestureState)
        switch (swipeDirection) {
            case SWIPE_LEFT:
                onSwipeLeft && onSwipeLeft(gestureState)
                break
            case SWIPE_RIGHT:
                onSwipeRight && onSwipeRight(gestureState)
                break
        }
    }

    _getSwipeDirection(gestureState) {
        const { SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections
        const { dx } = gestureState
        if (this._isValidHorizontalSwipe(gestureState)) {
            return (dx > 0)
                ? SWIPE_RIGHT
                : SWIPE_LEFT
        }
        return null
    }

    _isValidHorizontalSwipe(gestureState) {
        const { vx, dy } = gestureState
        const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig
        return isValidSwipe(vx, velocityThreshold, dy, directionalOffsetThreshold)
    }

    _isValidVerticalSwipe(gestureState) {
        const { vy, dx } = gestureState
        const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig
        return isValidSwipe(vy, velocityThreshold, dx, directionalOffsetThreshold)
    }

    render() {
        return (<Animated.View {...this.props} style={[this.props.style, {transform: [{translateX: this.translateX}], height: 75, opacity: this.fadeAnim}]} {...this._panResponder.panHandlers} />)
    }
}