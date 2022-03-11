import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Button, Modal, TextInput, Pressable, Text} from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from '../firebase';
import { FloatingAction } from "react-native-floating-action";
import { doc, getDoc, addDoc, getFirestore, collection, query, where, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import SearchableDropdown from 'react-native-searchable-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TimeAgo from 'javascript-time-ago'
// English.
import en from 'javascript-time-ago/locale/en.json'
import * as SecureStore from 'expo-secure-store';

TimeAgo.addDefaultLocale(en)

// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

const firestore = getFirestore();
const chatsTabMetaFirebase = firebase.firestore().collection('chatsTabMeta');
const usersFirebase = firebase.firestore().collection('users');

export default function ChatsTab({ navigation }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showChatUserSearch, setShowChatUserSearch] = useState(false);
    const [selectedUser, setSelectedUser] = useState([]);
    const [listOfUsers, setListOfUsers] = useState(null);
    const [chatMeta, setChatMeta] = useState(null)

    const addChatUser = (item) => {
        setSelectedUser(item)
    }

    const actions = [
        {
          text: "New chat",
          icon: require("../images/add.png"),
          name: "bt_post_msg",
          position: 1
        },
    ]

    const getUsersList = (querySnapshot) => {
        const usersList = [];
        querySnapshot.forEach((res) => {
            const {id, email} = res.data();
            usersList.push({
                name: email,
                id: id
            })
        })
        setListOfUsers(usersList);
    }
    
    useEffect(async () => {
        await SecureStore.getItemAsync("userId").then(async (currUserId)=> {

            const unsub = onSnapshot(doc(firebase.firestore(), "chatsTabMeta", currUserId), (doc) => {
                setChatMeta(doc.data())
                setIsLoading(false)
            });

        });
        
    }, []);

    useEffect(() => {
        const unsubscribe = usersFirebase.onSnapshot(getUsersList);
        return () => {
            unsubscribe();
        }
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="red" />
            </View>
        )
    }

    return (
        <>
            {showChatUserSearch && (
                <Modal
                    presentationStyle="formSheet"
                    animationType="slide"
                    visible={showChatUserSearch}
                    onRequestClose={() => {
                        setShowChatUserSearch(false);
                    }}
                >
                    <Pressable
                    style={[styles.button, styles.buttonClose, {paddingLeft: "85%"}]}
                    onPress={() => setShowChatUserSearch(false)}
                    >
                        <Ionicons name={"close-circle"} color="black" size={40} />
                    </Pressable>
                    <SearchableDropdown
                        onItemSelect={addChatUser}
                        selectedItems={selectedUser}
                        containerStyle={{ padding: 5, height: "20%", width: "100%", marginTop: 30 }}
                        onRemoveItem={() => {
                            setSelectedUser(null);
                        }}
                        itemStyle={{
                            padding: 10,
                            backgroundColor: '#ddd',
                            borderColor: '#bbb',
                            borderWidth: 1,
                            borderRadius: 5,
                        }}
                        itemTextStyle={{ color: '#222' }}
                        itemsContainerStyle={{ maxHeight: 140 }}
                        items={listOfUsers}
                        resetValue={false}
                        textInputProps={
                            {
                                placeholder: "search for user",
                                underlineColorAndroid: "transparent",
                                style: {
                                    padding: 12,
                                    borderWidth: 1,
                                    borderColor: '#ccc',
                                    borderRadius: 5,
                                },
                            }
                        }
                    />
                    
                    <Button title="Start Chat" onPress={() => {
                        setShowChatUserSearch(false)
                        navigation.navigate("Chats", {
                            screen: "ChatDetails",
                            params: { userId: selectedUser.name },
                        })
                    }} />
                    
                </Modal>
            )}
            {!showChatUserSearch && (
                <>
                    <ScrollView style={styles.wrapper}>
                        {chatMeta && Object.keys(chatMeta).map((key, i) => {
                            return (
                                <ListItem
                                    key={i}
                                    onPress={() => {
                                        navigation.navigate("Chats", {
                                            screen: "ChatDetails",
                                            params: { userId: `${key}@${chatMeta[key].suffix}`},
                                        })
                                    }}
                                    bottomDivider>
                                    <ListItem.Content>
                                        <ListItem.Title>{key}</ListItem.Title>
                                        <ListItem.Subtitle>{chatMeta[key].lastMessage}</ListItem.Subtitle>
                                        <ListItem.Subtitle>{timeAgo.format(chatMeta[key].createdAt.toDate())}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    <ListItem.Chevron
                                        color="black" />
                                </ListItem>

                            );
                        })}
                        {!chatMeta && (
                            <Text style={styles.emptyText}>No Chats.</Text>
                        )}
                    </ScrollView>
                    
                    <FloatingAction
                        actions={actions}
                        onPressItem={() => {setShowChatUserSearch(true)}}
                    />
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
    },
    emptyText: {
        marginTop: "42%",
        marginLeft: "42%",
        fontSize: 18,
        color: "gray",
        alignItems: "center",
        justifyContent: "center",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }
})
