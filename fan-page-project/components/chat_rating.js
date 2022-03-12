import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from '../firebase';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc, addDoc, getFirestore, collection, query, where, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { StyleSheet, ActivityIndicator, View, Text, Button} from 'react-native';
import StarRating from 'react-native-star-rating';
// const chatsFirebase = firebase.firestore().collection('chats');

export default function ChatRating({ params, navigation }) {
    const [chatRating, setChatRating] = useState(3);
    const {userId} = params;

    async function submitReview(p, navigation) {
        // console.log("submittting review")
        // console.log()
        console.log(navigation)
        var docId
        const usersRef = collection(firebase.firestore(), "users");
        // Create a query against the collection.
        const q = query(usersRef, where("email", "==", p.params.userId.params.userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          docId = doc.id;
        });
    
        const userDocRef = doc(firebase.firestore(), "users", docId);
        try {
            console.log("updating doc -- appending chat rating")
          await updateDoc(userDocRef, {
            ratings: arrayUnion(chatRating)
          }).then(()=>{
            // navigation.navigate("AppNav", {
            //   screen: "Chats",
            //   params: { screen: "ChatDetails", params: {userId: p.params.userId.params.userId}},
            // })
            navigation.goBack();
          });
        } catch (error) {
          if (error.code === 5) {
            console.log("updating doc -- adding chat rating")
            await updateDoc(userDocRef, {
              ratings: [chatRating]
            }).then(()=>{
            //   navigation.navigate("AppNav", {
            //     screen: "Chats",
            //     params: { screen: "ChatDetails", params: {userId: p.params.userId.params.userId}},
            //   })
              navigation.goBack();
            });
          }
        }
      }
    
    return (
        <View>
        <Text style={{ fontSize: 30 }}>Review this chat</Text>
        <StarRating
          disabled={false}
          maxStars={5}
          rating={chatRating}
          selectedStar={(rating) => setChatRating(rating)}
        />
        <Button style={styles.submitReviewButton} onPress={()=>submitReview(params, navigation)} title="Submit Review" />
      </View>
    )
}

const styles = StyleSheet.create({
    loader: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }
})