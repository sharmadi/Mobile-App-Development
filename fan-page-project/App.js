import * as React from 'react';
import { Platform, Button } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import SplashScreen from './components/splash_screen';
import MessageList from './components/messages_list';
import Login from './components/login';
import Register from './components/register';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, signOut } from "firebase/auth";

const Stack = createNativeStackNavigator();
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
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            isAdmin: action.isAdmin,
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

  useEffect(() => {
    const fetchUserToken = async () => {
      let userToken;
      let userIsAdmin;
      try {
        userToken = await SecureStore.getItemAsync('userToken');
        userIsAdmin = await SecureStore.getItemAsync('userIsAdmin');
      } catch (e) {
        console.log("failed to get user token from secure store")
        console.log(e)
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken, isAdmin: userIsAdmin });
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
          await SecureStore.setItemAsync("userIsAdmin", data.isAdmin);
        }
        dispatch({ type: 'SIGN_IN', token: data.username, isAdmin: data.isAdmin });
      },
      signOutRedux: async () => {
        if (Platform.OS !== 'web'){
          await SecureStore.setItemAsync("userToken", null);
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
  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {showSplashScreen ? (
            <Stack.Screen name="SplashScreen" component={SplashScreen} options={{headerShown:false}} />
          ) : !state.userToken ? (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register} />
            </>
          ):(
            <Stack.Screen 
              name="Messages" 
              // component={MessageList} 
              options={{
                headerRight: () => (
                  <Button 
                    title={"Logout"} 
                    onPress={logout}
                  />
                ),
              }}
            >
              {props => <MessageList {...props} isAdmin={state.isAdmin} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}