import React, { useState, useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import Authhome from '../../navigation/Authhome';
import Authlogin from '../../navigation/Authlogin';
import { GlobalStateContext } from '../../globalState';

function Auth_state() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const {user , setUser} = useContext(GlobalStateContext)

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;
  
  return(
    <NavigationContainer>
      {user ? <Authhome/> : <Authlogin/>}
    </NavigationContainer>
  )

}

export default Auth_state
