import { Alert } from 'react-native'

const infoAlertAsync = (title, message, buttonText) => {
    return new Promise((resolve) => {
        Alert.alert(title, message, [{
            text: buttonText,
            onPress: () => resolve(true)
        }])
    })
}
const okCancelAlertAsync = (title, message, okText, cancelText) => {
    return new Promise((resolve) => {
        Alert.alert(title, message, [{
            text: okText,
            onPress: () => resolve(true)
        },{
            text: cancelText,
            onPress: () => resolve(false)
        }])
    })
}

export default {
    infoAlertAsync,
    okCancelAlertAsync
}