import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import LottieView from 'lottie-react-native';
import Icons from 'react-native-vector-icons/Fontisto'
import { format } from 'date-fns';

const Update_bg = ({ current_day_games }) => {

    const [bgColor , setBgColor] = useState('white')

    useEffect(() => {

        const timer = setInterval(() => {
            const today = new Date()
            const currentHour = today.getHours();
            const currentMinute = today.getMinutes();
            const currentTime = `${currentHour}${currentMinute}`
            const time_to_finish = current_day_games.finish_time.split(' : ').join('')
            if (currentTime >= time_to_finish) {
                setBgColor('#F9C9C9')
            }
        }, 1000); // Update every 1 second
    
        return () => clearInterval(timer);
    }, []);
    
  return (
    <>
    <View style={{alignItems:'flex-end',position:'relative'}}>
        <View style={ 
        {height:25,aspectRatio:1,backgroundColor:bgColor,borderRadius:50,position:'absolute',right:12,top:-7,borderWidth:1,borderColor:'#292F36',zIndex:1}
        }>
            <LottieView style={{flex:2}}
            source={require('../../assets/animations/time.json')} autoPlay loop/>
        </View>
    </View>
    <View style={
    {backgroundColor:bgColor,padding:10,borderRadius:10,borderWidth:1,borderColor:'#292F36',flexDirection:'column',alignItems:'center',width:80,zIndex:-1}
    }>
        <Text style={{color:'#292F36',fontSize:12,fontWeight:'700'}}>{current_day_games.price} DT</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
            <Icons name="hourglass-start" color='green'/> 
            <Text style={{color:'#292F36',fontSize:12,fontWeight:'700'}}> {current_day_games.timeStarted.heure} : {current_day_games.timeStarted.minute.toString().length === 1 ? `0${current_day_games.timeStarted.minute}` : current_day_games.timeStarted.minute }</Text>
        </View>
        <View style={{flexDirection:'row',alignItems:'center'}}>
            <Icons name="hourglass-end" color='red'/>
            <Text style={{color:'#292F36',fontSize:12,textAlign:'center',fontWeight:'700'}}> {current_day_games.finish_time}</Text>
        </View>
    </View>
    </>
  )
}

export default Update_bg