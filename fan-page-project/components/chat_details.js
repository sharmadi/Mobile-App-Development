import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from '../firebase';
import * as SecureStore from 'expo-secure-store';
import { doc, getDoc, addDoc, getFirestore, collection, query, where, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { StyleSheet, ActivityIndicator, View} from 'react-native';
// const chatsFirebase = firebase.firestore().collection('chats');

export default function ChatDetails({route}) {
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [participantIdsStr, setParticipantIdsStr] = useState(null);
    const [chatUser, setChatUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const {userId} = route.params;

    useEffect(async () => {
        setIsLoading(true)
        setChatUser(userId)

        const currUserId = await SecureStore.getItemAsync("userId");
        setCurrentUser(currUserId);
        
        const participantsIds = [currUserId?.trim().toLowerCase(), userId?.trim().toLowerCase()].sort().join("")
        setParticipantIdsStr(participantsIds)
        
        const q = query(collection(firebase.firestore(), "chats"), where("participantsIds", "==", participantsIds));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chat_data = [];
            querySnapshot.forEach((doc) => {
                chat_data.push({
                    "_id": doc.data()._id,
                    "createdAt": doc.data().createdAt.toDate(),
                    "text": doc.data().text,
                    "user": {
                        "_id": doc.data().user._id,
                        "name": doc.data().name
                    }

                });
            });
            setMessages(chat_data.sort((chat1, chat2)=>chat2.createdAt.getTime() - chat1.createdAt.getTime()))
            setIsLoading(false)
        });
    }, [])
    
    const onSend = (async (messages = [], participantIdsStr, currentUser, chatUser) => {
        const newMsg = {...messages[0], participantsIds:participantIdsStr}
        const chatDocRef = await addDoc(collection(firebase.firestore(), "chats"), newMsg);
        
        const docRef = doc(firebase.firestore(), "chatsTabMeta", currentUser);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const chatsTabMetaRef = firebase.firestore().collection('chatsTabMeta').doc(currentUser);
            const msgKey = `${chatUser.split("@")[0]}.lastMessage`
            const tsKey = `${chatUser.split("@")[0]}.createdAt`
            const res = await chatsTabMetaRef.update({
                [msgKey]:messages[0].text,
                [tsKey]:messages[0].createdAt,
            })
        } else {
            const chatsTabMetadocRef = await setDoc(doc(firebase.firestore(), "chatsTabMeta", currentUser), {
                [chatUser.split("@")[0]]:{
                    "lastMessage":messages[0].text,
                    "createdAt": messages[0].createdAt,
                    "suffix": chatUser.split("@")[1]
                }
            });
        }

        const docRef2 = doc(firebase.firestore(), "chatsTabMeta", chatUser);
        const docSnap2 = await getDoc(docRef2);
        
        if (docSnap2.exists()) {
            const chatsTabMetaRef = firebase.firestore().collection('chatsTabMeta').doc(chatUser);
            const msgKey = `${currentUser.split("@")[0]}.lastMessage`
            const tsKey = `${currentUser.split("@")[0]}.createdAt`
            const res = await chatsTabMetaRef.update({
                [msgKey]:messages[0].text,
                [tsKey]:messages[0].createdAt,
            })
        } else {
            const chatsTabMetadocRef = await setDoc(doc(firebase.firestore(), "chatsTabMeta", chatUser), {
                [currentUser.split("@")[0]]:{
                    "lastMessage":messages[0].text,
                    "createdAt": messages[0].createdAt,
                    "suffix": currentUser.split("@")[1]
                }
            });
        }

        // setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    })

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="red" />
            </View>
        )
    }
    
    return (
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages, participantIdsStr, currentUser, chatUser)}
            user={{
                _id: currentUser,
            }}
        />
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