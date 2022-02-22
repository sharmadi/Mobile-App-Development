import React, { useState } from 'react';
import { StyleSheet, Button, View, TextInput, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firestore = getFirestore();

export default function Register({navigation}) {

    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);

    const auth = getAuth();

    function registerUser() {
        createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Signed in
            const accessToken = userCredential.user.uid;

            await setDoc(doc(firestore, "users", accessToken), {
                email: email,
                password: password,
                isAdmin: false
            });

            navigation.navigate("Login")
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        // ..
        });
    }

    return (
        <View>
            <TextInput
                style={styles.input}
                onChangeText={(val)=>setEmail(val)}
                placeholder={"Enter email"}
            />
            <TextInput
                style={styles.input}
                onChangeText={(val)=>setPassword(val)}
                placeholder={"Enter password"}
                secureTextEntry
            />
            <Button
                title="Register"
                onPress={registerUser}
            />
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
});
