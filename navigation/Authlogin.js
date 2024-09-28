/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/auth/login';
import { ContextProvider } from '../globalState';

const Stack = createNativeStackNavigator();

function Authlogin() {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}} >
        <Stack.Screen name="login" component={Login} />
      </Stack.Navigator>
  );
}

export default Authlogin;