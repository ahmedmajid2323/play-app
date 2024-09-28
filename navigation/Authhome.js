/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeV2 from '../screens/home/homeV2';
import { ContextProvider } from '../globalState';
import Login from '../screens/auth/login';

const Stack = createNativeStackNavigator();

function Authhome() {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}} >
        <Stack.Screen name="home" component={HomeV2} />
      </Stack.Navigator>
  );
}

export default Authhome;