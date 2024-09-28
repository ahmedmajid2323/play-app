
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useState } from "react";
import { Alert, Image, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Auth_functions from "./Auth_functions";

export default function Login({navigation}){

    const [email , setEmail] = useState()
    const [password , setPassword] = useState()

    return(
        <LinearGradient colors={['#ffffff', '#e0f7f4', '#c1efea', '#7bdfd4', '#4ECDC4']} style={styles.page}>
            <View style={styles.container}>
                <View style={{flexDirection:'row' , justifyContent:'space-between',gap:20 , alignItems:'center',marginBottom:30}}>
                    <Image style={{width:50 , height:50}}
                    source={require('../../assets/images/streaming.png')} />
                    <Text style={{color:'#292F36',fontSize:40,fontWeight:700,elevation:10}}>Welcome back !</Text>
                    <Image style={{width:50 , height:50}}
                    source={require('../../assets/images/streaming.png')}/>
                </View>
                <View style={{flexDirection:'column',gap:30}}>
                    <View>
                        <Text style={{color:'#292F36',fontWeight:'700'}}>Email</Text>
                        <TextInput style={styles.input}value={email} onChangeText={(text)=>{setEmail(text)}} />
                    </View>
                    <View>
                        <Text style={{color:'#292F36',fontWeight:'700'}}>Password</Text>
                        <TextInput style={styles.input} value={password} onChangeText={(text)=>{setPassword(text)}} />
                    </View>
                </View>
                
                <Pressable onPress={()=>Auth_functions.signIn(email , password)} > 
                    <View style={{padding:15,backgroundColor:'white',borderRadius:15,width:350,alignItems:'center',marginTop:40,elevation:10}} >
                        <Text style={{color:'#292F36' , fontWeight:'700', fontSize:15}}>login <Icon name='login' style={{fontSize:15}} /> </Text>
                    </View>
                </Pressable>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    page:{
        height:'100%',
        alignItems:'center',
        justifyContent:'center',
    },
    container:{
        flexDirection:'column',
        alignItems:'center'
    },
    input:{
        borderRadius:10,
        backgroundColor:'rgba(0,0,0,0.3)',        
        padding:15,
        paddingHorizontal:20,
        borderWidth:1,
        borderColor:'white',
        width:350,
        color:'black'
    }
})