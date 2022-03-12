import * as React from 'react';
import { Platform, Button, View, Text, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import SplashScreen from './components/splash_screen';
import MessageList from './components/messages_list';
import Login from './components/login';
import Register from './components/register';
import ChatsTab from './components/chats';
import ChatDetails from './components/chat_details';
import Profile from './components/profile';
import ChatRating from './components/chat_rating';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, signOut } from "firebase/auth";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { doc, getDoc, addDoc, getFirestore, collection, query, where, getDocs, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';

const RootStack = createStackNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
export const AuthContext = React.createContext();

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isAdmin: action.isAdmin,
            userId: action.username,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            isAdmin: action.isAdmin,
            userId: action.username
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            isAdmin: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      isAdmin: null,
    }
  );

  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [chatRating, setChatRating] = useState(3);
  
  useEffect(() => {
    const fetchUserToken = async () => {
      let userToken;
      let userIsAdmin;
      let userId;
      try {
        userToken = await SecureStore.getItemAsync("userToken");
        userIsAdmin = await SecureStore.getItemAsync("userIsAdmin");
        userId = await SecureStore.getItemAsync("userId");
      } catch (e) {
        console.log("failed to get user token from secure store")
        console.log(e)
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken, isAdmin: (userIsAdmin==="true"), username: userId });
    };

    setTimeout(() => {
      fetchUserToken();
      setShowSplashScreen(false)
    }, 3000)
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        if (Platform.OS !== 'web'){
          await SecureStore.setItemAsync("userToken", data.username);
          await SecureStore.setItemAsync("userIsAdmin", data.isAdmin.toString());
          await SecureStore.setItemAsync("userId", data.userId);
        }
        dispatch({ type: 'SIGN_IN', token: data.username, isAdmin: data.isAdmin, username: data.userId });
        // dispatch({ type: 'SIGN_IN', token: data.username, isAdmin: data.isAdmin });
      },
      signOutRedux: async () => {
        if (Platform.OS !== 'web'){
          await SecureStore.deleteItemAsync("userToken");
          await SecureStore.deleteItemAsync("userIsAdmin");
          await SecureStore.deleteItemAsync("userId");
        }
        dispatch({ type: 'SIGN_OUT' })
      },
    }),
    []
  );

  function logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
    // Sign-out successful.
        authContext.signOutRedux()
    }).catch((error) => {
    // An error happened.
        console.log("could not sign out")
        console.log(error)
    });
  }
  


  function Chats({route: {params}, navigation}) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="ChatsRoot" component={ChatsTab} options={{ title: 'Chats' }} />
        <Stack.Screen name="ChatDetails" component={ChatDetails} initialParams={params} options={{
            headerRight: () => (
                <Button 
                  title={"Rate"} 
                  onPress={() => navigation.navigate("AppNav", {
                    screen: "Chats",
                    params: { screen: "ChatRating", params: {userId: params}},
                  })}
                />
              ),
            title:"Chat Details"
            }} />
        <Stack.Screen name="ChatRating" options={{ title: 'Chat Rating' }} >
          {props => <ChatRating {...props} params={params} navigation={navigation} />}
        </Stack.Screen>
    </Stack.Navigator>
    );
  }

  function AppNav(){
    return(
      <>
      {showSplashScreen || !state.userToken && (
        <Stack.Navigator>
          {showSplashScreen ? (
            <Stack.Screen name="SplashScreen" component={SplashScreen} options={{headerShown:false}} />
          ) : !state.userToken ? (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register} />
            </>
          ) : (<></>)}
        </Stack.Navigator>
      )}
      {state.userToken && (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
  
              if (route.name === 'Home') {
                iconName = focused
                  ? 'home'
                  : 'home-outline';
              } else if (route.name === 'Chats') {
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person-circle' : 'person-circle-outline';
              }
              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen 
            name="Home"               
            options={{
              headerRight: () => (
                <Button 
                  title={"Logout"} 
                  onPress={logout}
                />
              ),
            }}>
            {props => <MessageList {...props} isAdmin={state.isAdmin} />}
          </Tab.Screen>
          <Tab.Screen name="Chats" component={Chats} options={{ headerShown: false }} />
          <Tab.Screen name="Profile">
            {props => <Profile {...props} userId={state.userId}/>}
          </Tab.Screen>
        </Tab.Navigator>
      )}
      </>
    )
  }

  // function ModalScreen({ route: {params}, navigation }) {
  //   return (
  //     // <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

  //   );
  // }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Group>
            <RootStack.Screen name="AppNav" component={AppNav} options={{ headerShown: false }}/>
          </RootStack.Group>
          {/* <RootStack.Group screenOptions={{ presentation: 'modal' }}>
            <RootStack.Screen name="MyModal" component={ModalScreen} />
          </RootStack.Group> */}
        </RootStack.Navigator>
        
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  submitReviewButton: {
      marginTop: "5%"
  }
})