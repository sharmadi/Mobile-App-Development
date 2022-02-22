import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Image
                style={styles.tinyLogo}
                source={require('../images/pp.jpg')}
            />
            <Text style={styles.text}>Initializing fan page app ... </Text>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tinyLogo: {
        width: 500,
        height: 500,
    },
    text:{
        paddingTop: 50,
        fontWeight: "700",
        fontSize: "32"
    }
});