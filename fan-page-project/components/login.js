import React, { useState } from 'react';
import { AuthContext } from '../App';
import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { getFirestore, setDoc, doc, getDoc } from 'firebase/firestore';

const fbProvider = new FacebookAuthProvider();
const firestore = getFirestore();

export default function Login({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  
    const { signIn } = React.useContext(AuthContext);

    function initLogin() {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, username, password)
        .then(async (userCredential) => {
            const accessToken = userCredential.user.uid;
            const docSnap = await getDoc(doc(firestore, "users", accessToken))
            if (docSnap.exists()) {
                signIn({ username: accessToken, userId: username, password, isAdmin:docSnap.data().isAdmin })
            } else {
                console.log("could not find user post login")
            }
            
        })
        .catch((error) => {
            console.log("failed to login")
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    }

    function initLoginWithFB() {
        const auth = getAuth();
        signInWithPopup(auth, fbProvider)
        .then(async (result) => {
            const user = result.user;
            const credential = FacebookAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;

            await setDoc(doc(firestore, "users", accessToken), {
                email: accessToken,
                password: "fb",
                isAdmin: false
            });
            signIn({ username: accessToken, password:"fb" })
            // ...
        })
        .catch((error) => {
            console.log("error while logging in from FB")
            console.log(error)
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = FacebookAuthProvider.credentialFromError(error);
            console.log(credential)

            Alert.alert('Error while logging in with facebook', errorMessage, [
                { text: 'Dismiss', onPress: () => {} },
              ]);
            // ...
        });
    }
  
    return (
      <View>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize='none'
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize='none'
          secureTextEntry
        />
        <View style={styles.loginButton}>
            <Button title="Login" onPress={initLogin} />
        </View>
        <View style={styles.loginFbButton}>
            <Button title="Login with Facebook" onPress={initLoginWithFB} />
        </View>
        <View style={styles.registerButton}>
            <Button title="Create Account" onPress={() => navigation.navigate("Register")} />
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
    input: {
      height: 40,
      width: "100%",
      marginBottom: 15,
      borderWidth: 1,
      padding: 10,
    },
    loginButton: {
        paddingTop:"3%"
    },
    registerButton: {
        paddingTop:"5%"
    },
    loginFbButton:{
        paddingTop:"5%"
    }
});