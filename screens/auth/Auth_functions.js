import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

const signIn = async (email, password) => {
  try {
    if(!email || !password){
      Alert.alert('Warning','all fields are required !')
    }else{
      console.log('waiting...');
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      if(userCredential){
        console.log('User signed in!', userCredential.user);
      }
    }
  } catch (error) {
    if(error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email'){
      Alert.alert('wrong credentials',`${error.code}`)
    }
  }
};

const Auth_functions = {
    signIn 
}

export default Auth_functions