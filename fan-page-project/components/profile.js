import React, { useEffect, useState, useCallback } from 'react';
import firebase from '../firebase';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc, addDoc, getFirestore, collection, query, where, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { Text, StyleSheet } from 'react-native';

export default function Profile({userId}) {

    const [ratings, setRatings] = useState(null);
    const [avgRating, setAvgRating] = useState(null);

    useEffect(async () => {
        var userRatings
        const usersRef = collection(firebase.firestore(), "users");
        // Create a query against the collection.
        const q = query(usersRef, where("email", "==", userId.toLowerCase()));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            userRatings = doc.data().ratings;
            setRatings(userRatings)

        })
    }, [])

    useEffect(() => {
        if (ratings !== null && ratings !== undefined){
            const avg = (r) => r.reduce((a, b) => a + b) / r.length;
            setAvgRating(avg(ratings))
        }
    }, [ratings])

    return (
        <>
            <Text style={styles.userId}>{userId.toLowerCase()}</Text>
            <Text style={styles.rating}>Average Rating - <Text>{avgRating ? avgRating : "n/a"}</Text></Text>
        </>
    )
}

const styles = StyleSheet.create({
    userId: {
        paddingTop: 35,
        fontSize: 18,
        fontWeight: "bold",
        paddingLeft: 25,
        paddingBottom: 10
    },
    rating: {
        fontSize: 18,
        paddingLeft: 25,
        fontWeight:"bold"
    }
  });