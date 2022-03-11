import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Button, Modal, TextInput} from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from '../firebase';
import { FloatingAction } from "react-native-floating-action";
import { addDoc, getFirestore, collection } from 'firebase/firestore';

const firestore = getFirestore();
const messagesFirebase = firebase.firestore().collection('messages');

export default function MessageList({isAdmin}) {
    const [messages, setMessages] = useState([]);
    const [messageToPost, setMessageToPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPostMsgInput, setShowPostMsgInput] = useState(false);

    const actions = [
        {
          text: "Post message",
          icon: require("../images/add.png"),
          name: "bt_post_msg",
          position: 1
        },
    ]

    const getMessagesData = (querySnapshot) => {
        const messagesList = [];
        querySnapshot.forEach((res) => {
            const { content, createdAt } = res.data();
            messagesList.push({
                content: content,
                createdAt: createdAt
            });
        });
        setMessages(messagesList)
        setIsLoading(false);
    }

    useEffect(() => {
        const unsubscribe = messagesFirebase.orderBy('createdAt', 'desc').onSnapshot(getMessagesData);
        return () => {
            unsubscribe();
        }
    }, []);


    async function postMessage() {
        await addDoc(collection(firestore, "messages"), {
            content: messageToPost,
            createdAt: Date.now()
        }).then(()=>{
            setShowPostMsgInput(false)
        });
    }

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="red" />
            </View>
        )
    }
    return (

            <>
                {showPostMsgInput && (
                    <Modal
                        presentationStyle="fullScreen"
                        animationType="slide"
                        transparent={true}
                        visible={showPostMsgInput}
                        onRequestClose={() => {
                          setShowPostMsgInput(false);
                        }}
                    > 
                        <TextInput
                            style={styles.input}
                            onChangeText={(val)=>setMessageToPost(val)}
                            placeholder={"Compose to: "}
                        />
                        <View style={styles.button}>
                            <Button
                                title="Enter your message"
                                onPress={postMessage}
                            />
                        </View>
                        <View style={styles.button}>
                            <Button
                                title="Close"
                                onPress={()=>{setShowPostMsgInput(false)}}
                            />
                        </View>
                    </Modal>
                )}
                {!showPostMsgInput && (
                    <>
                        <ScrollView style={styles.wrapper}>
                            {messages.map((res, i) => {
                                return (
                                    <ListItem
                                        key={i}
                                        bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title>{res.content}</ListItem.Title>
                                            <ListItem.Subtitle>{new Date(res.createdAt * 1000).toString()}</ListItem.Subtitle>
                                        </ListItem.Content>
                                        <ListItem.Chevron
                                            color="black" />
                                    </ListItem>

                                );
                            })}
                        </ScrollView>
                        {isAdmin && (
                            <FloatingAction
                                actions={actions}
                                onPressItem={() => {setShowPostMsgInput(true)}}
                            />
                        )}
                    </>
                )}
            </>

    );
}

const styles = StyleSheet.create({
    container:{
        height: "100%"
    },
    wrapper: {
        flex: 1,
        paddingBottom: 22
    },
    loader: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    input: {
        height: 40,
        width: "100%",
        marginTop: 100,
        marginBottom: 15,
        borderWidth: 1,
        padding: 10,
    },
    button: {
        paddingTop: 30
    }
})
