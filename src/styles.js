import { StyleSheet } from 'react-native'

export default (colors) => StyleSheet.create({
    header: {
        backgroundColor: colors.headerBackground,
    },
    headerText: {
        flex: 1,
        fontSize: 20,
        textAlign: 'center',
    },
    text: {
        color: colors.headerText,
        fontFamily: 'open-sans',
    }
})