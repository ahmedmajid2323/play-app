import { Pressable, StyleSheet, Text, View , Image, ScrollView, Animated, Modal, TouchableWithoutFeedback} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { format } from 'date-fns';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/firestore'; 
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import BackgroundTimer from 'react-native-background-timer';
import Icons from 'react-native-vector-icons/Fontisto'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Update_bg from '../home/Update_bg';
import Auth_functions from '../auth/Auth_functions';
import { GlobalStateContext } from '../../globalState';
import auth from '@react-native-firebase/auth';

export default function HomeV2({navigation}) {

    const {user} = useContext(GlobalStateContext)
    
    /************************************************** get date ********************************************/
    const month_tab = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
    const getCurrentDate = () => {
        const today = new Date();
        const date_aujourdhui = format(today, 'yyyy-MM-dd');
        const day = today.getDate(); 
        const month = today.getMonth(); 
        const year = today.getFullYear(); 
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        const currentTime = `${currentHour} : ${currentMinute}`
        return { date_aujourdhui,day, month, year , currentHour , currentMinute , currentTime};
    };
    const { date_aujourdhui,day, month, year , currentHour ,  currentMinute , currentTime} = getCurrentDate();
    /********************************************************************************************************/ 

    /****************************************************timer***********************************************/ 
    const [bgColor, setBgColor] = useState([]);

    const estimated_finish_time = (heure , minute)=>{
        let finish_minute = minute
        let finish_heure = heure
        finish_minute += 12
        if (finish_minute >= 60) {
            finish_heure += 1
            finish_minute -= 60
        }
        if (finish_heure >= 24) {
            finish_heure -= 24
        }
        if(finish_minute.toString().length === 1){
            return `${finish_heure} : 0${finish_minute}`
        }else
        {
            return `${finish_heure} : ${finish_minute}`
        }
    }
    
    /********************************************************************************************************/ 

    /********************************************firebase fetching*******************************************/  
    const [postes , setPostes] = useState([])
    const [current_employee , setCurrent_employee] = useState('')
    const [Recette_du_jour, setRecette_du_jour] = useState(0)
    
    useEffect(() => {
        const loggedIn = firestore()
          .collection('users')
          .onSnapshot(querySnapshot => {
            querySnapshot.forEach(documentSnapshot => {
                if (documentSnapshot.data().email === user.email) {
                    setCurrent_employee(documentSnapshot.data().nom)
                }
            });
        })

        return ()=>loggedIn()
    }, []);

    useEffect( () => {

        const subscriber = firestore()
          .collection('postes')
          .onSnapshot(querySnapshot => {
            const postes_play = [];
            querySnapshot.forEach(documentSnapshot => {
                    postes_play.push({
                        ...documentSnapshot.data(),
                        key: documentSnapshot.id,
                    });
            });
            postes_play.sort((a, b) => a.num_poste - b.num_poste);
            setPostes(postes_play);
            
            const games_paid = postes_play.map(poste=>
                poste.workdays
                    .filter(elt => elt.date === date_aujourdhui && elt.employee === user.email)[0]?.games
                    .filter(game => game.status === 'paid')
            ).filter(games => games && games.length > 0);

            let totalRecette = 0;
            games_paid.forEach(gameList => 
            gameList.forEach(game => {
                if (game?.price) {
                totalRecette += game.price;
                }
            })
            );
            setRecette_du_jour(totalRecette);

        });
      
        return () => subscriber()
    }, []);
    /********************************************************************************************************/ 

    /**************************************************modals************************************************/
    const [modal_seeMore , setModal_seeMore] = useState(false)
    const [modal_updateGame , setModal_updateGame] = useState(false)
    const [poste_seeMore , setPoste_seeMore] = useState()
    const [index_game_update , setIndex_game_update] = useState()
    const [information_selecte_game , setInformation_selecte_game] = useState({})
    const [poste_update , setPoste_update] = useState()
    const [Modal_sucess , setModal_sucess] = useState(false)

    const update_game = (index , selected_game , poste)=>{
        setIndex_game_update(index);
        setInformation_selecte_game(selected_game)
        setModal_updateGame(true)
        setPoste_update(poste)
    }

    const update_deleted = async ()=>{
        const query = await firestore()
            .collection('postes')
            .where('num_poste', '==', poste_update)
            .get();
        
        query.forEach(async (doc)=>{
            const data = doc.data();
            const workdays = data.workdays
            const workdayIndex = data.workdays.findIndex(workday => workday.date === date_aujourdhui);
            const games = data.workdays[workdayIndex].games
            const updated_game = {
                price: information_selecte_game.price , 
                status:'deleted',
                timeStarted: {
                    heure: information_selecte_game.timeStarted.heure , 
                    minute: information_selecte_game.timeStarted.minute  
                },
              };
            const updated_games = [...games] 
            updated_games[index_game_update] = updated_game
            workdays[workdayIndex].games = updated_games;
            
            const fieldPath = `workdays.${workdayIndex}.games`;
            await firestore().collection('postes').doc(doc.id).update({
                workdays : workdays 
            });
            setModal_updateGame(false)
        })
    }

    const update_paid = async ()=>{

        const query = await firestore()
            .collection('postes')
            .where('num_poste', '==', poste_update)
            .get();
        
        query.forEach(async (doc)=>{
            const data = doc.data();
            const workdays = data.workdays
            const workdayIndex = data.workdays.findIndex(workday => workday.date === date_aujourdhui);
            const games = data.workdays[workdayIndex].games
            const updated_game = {
                price: information_selecte_game.price , 
                status:'paid',
                timeStarted: {
                    heure: information_selecte_game.timeStarted.heure , 
                    minute: information_selecte_game.timeStarted.minute  
                },
                finish_time : information_selecte_game.finish_time
              };
            const updated_games = [...games] 
            updated_games[index_game_update] = updated_game
            workdays[workdayIndex].games = updated_games;
            
            const fieldPath = `workdays.${workdayIndex}.games`;
            await firestore().collection('postes').doc(doc.id).update({
                workdays : workdays 
            });
            setModal_updateGame(false)
            setModal_sucess(true)
        })

    }

    const add_recette = async ()=>{

        const update_recette = await firestore()
            .collection('users')
            .get()  

        update_recette.forEach(async(doc)=>{
        const data = doc.data()
        if(data.email === user.email)  {
            let copy_recette = [...data.recette_par_jour]
            const index_existing_day = data.recette_par_jour.findIndex(day => day.date === date_aujourdhui)
            if (index_existing_day !== -1) {
                //if it exists i want to update the recette of the current_day
                copy_recette[index_existing_day].recette = Recette_du_jour
                const recette = copy_recette
            }else{
                copy_recette.push({
                    date: date_aujourdhui,
                    recette: Recette_du_jour,
                });
            }
            await firestore().collection('users').doc(doc.id).update({
                recette_par_jour: copy_recette 
            });
        }          
        }) 

        setModal_sucess(false)
    }

    const seeMore = (poste)=>{
        setPoste_seeMore(poste.num_poste)
        setModal_seeMore(true)
    }
    /********************************************************************************************************/

    /**********************************************swiping events********************************************/  
    const [translateX , setTranslateX] = useState(new Animated.Value(0))

    const ignore_game = ()=>{
        setPoste_clicked()
        setTranslateX(new Animated.Value(0))
        setValeur_heure(currentHour)
        setValeur_minute(currentMinute)
    }

    const add_game_running = async () => {
        setPoste_clicked()
        setTranslateX(new Animated.Value(0))
        try {
          // Fetch the specific document using Firestore
          const querySnapshot = await firestore()
            .collection('postes')
            .where('num_poste', '==', poste_clicked)
            .get();
      
          querySnapshot.forEach( async (doc) => {
            const data = doc.data();
            const workdays = data.workdays ;
            const matchingWorkdayIndex = workdays.findIndex(workday => workday.date === date_aujourdhui && workday.employee === user.email);
            
            if (matchingWorkdayIndex !== -1) { // If today's workday exists
              const newGame = {
                price: valeur_price, 
                status:'running',
                timeStarted: {
                    heure: valeur_heure, 
                    minute: valeur_minute 
                },
                finish_time: estimated_finish_time(valeur_heure , valeur_minute) ,
              };
              const updatedWorkdays = [...workdays];
              updatedWorkdays[matchingWorkdayIndex].games = [
                ...updatedWorkdays[matchingWorkdayIndex].games,
                newGame
              ];

              await firestore().collection('postes').doc(doc.id).update({
                workdays: updatedWorkdays
              });

            } else {
                const newWorkday = {
                    date: date_aujourdhui,
                    employee: user.email,
                    games: [
                        {
                            price: valeur_price, 
                            status:'running',
                            timeStarted: {
                                heure: valeur_heure, 
                                minute: valeur_minute 
                            },
                            finish_time: estimated_finish_time(valeur_heure , valeur_minute) ,
                        }
                    ]
                };
                await firestore().collection('postes').doc(doc.id).update({
                workdays: firebase.firestore.FieldValue.arrayUnion(newWorkday) 
                });
            }
            setValeur_heure(currentHour)
            setValeur_minute(currentMinute)
            setvaleur_price(2000)
          });
        } catch (error) {
          console.error('Error updating workdays:', error);
        }
    };

    const onGestureEvent = () => Animated.event(
        [{ nativeEvent: { translationX: translateX }}],
        { useNativeDriver: true }
      );

    const onHandlerStateChange = (event) => {
        if (event.nativeEvent.translationX > 150) {
          // If swipe passes threshold, delete
          Animated.timing(translateX, {
            toValue: 500, // Move component off-screen
            duration: 300,
            useNativeDriver: true,
          }).start(ignore_game());
        } else if (event.nativeEvent.translationX < -150) {
          // Reset position if swipe is less than threshold
          Animated.spring(translateX, {
            toValue: -1500,
            useNativeDriver: true,
          }).start(()=>{add_game_running()});
        }
      };
    /********************************************************************************************************/  

    /******************************************handle clicking form events***********************************/
    const [poste_clicked , setPoste_clicked] = useState()
    const [clicked_price , setclicked_price] = useState(false)
    const [valeur_price , setvaleur_price] = useState(2000)
    const [clicked_heure , setClicked_heure] = useState(false)
    const [valeur_heure , setValeur_heure] = useState(currentHour)
    const [clicked_minute , setClicked_minute] = useState(false)
    const [valeur_minute , setValeur_minute] = useState(currentMinute)

    const clicking_heure = ()=>{
        setClicked_heure(true)
        setClicked_minute(false)
        setclicked_price(false)
    }

    const clicking_minute = ()=>{
        setClicked_minute(true)
        setclicked_price(false)
        setClicked_heure(false)
    }

    const clicking_ref = ()=>{
        setclicked_price(true)
        setClicked_heure(false)
        setClicked_minute(false)
    }

    const minus = ()=>{
        if(clicked_price){
            setvaleur_price(valeur_price - 500)
        }
        else if (clicked_heure) {
            setValeur_heure(prevValeur_heure => (prevValeur_heure > 0 ? prevValeur_heure - 1 : 23));
        } 
        else if (clicked_minute) {
            setValeur_minute(prevValeur_minute => (prevValeur_minute > 0 ? prevValeur_minute - 1 : 59));
        }
        
    }

    const plus = ()=>{
        if(clicked_price){
            setvaleur_price(valeur_price + 500)
        }
        else if (clicked_heure) {
            setValeur_heure(prevValeur_heure => (prevValeur_heure < 23 ? prevValeur_heure + 1 : 0));
        } 
        else if (clicked_minute) {
            setValeur_minute(prevValeur_minute => (prevValeur_minute < 59 ? prevValeur_minute + 1 : 0));
        }
    }
    /*******************************************************************************************************/

    const signOut = async () => {
        try {

          await auth().signOut(); 
          console.log('User signed out!'); 

        } catch (error) {

          console.error('error signing out: ',error);

        }
    };

  return (
    <LinearGradient colors={['#ffffff', '#e0f7f4', '#c1efea', '#7bdfd4', '#4ECDC4']} style={styles.page}>

          <View style={{alignItems:'center',marginBottom:10,justifyContent:'space-between',flexDirection:'row',paddingHorizontal:25}}>

            <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                <Text style={{fontWeight:'700',fontSize:25,color:'#292F36'}}>{date_aujourdhui}</Text>
                <Text style={{fontSize:20}}>( {Recette_du_jour} DT )</Text>
            </View>

            <Pressable  onPress={()=>{signOut()}}>
                <View style={{backgroundColor:'#4ECDC4', padding:10, borderRadius:10,flexDirection:'row',alignItems:'center',gap:10}}>
                <Text style={{fontWeight:'700',fontSize:25,color:'#292F36'}}>{current_employee}</Text>
                <MaterialCommunityIcons name='logout' color='#292F36' style={{fontSize:40 , fontWeight:'700'}} />
                </View>
            </Pressable>
            
          </View>
          
          {
            poste_clicked ? 
            <GestureHandlerRootView style={{backgroundColor: 'transparent'}}>
                <PanGestureHandler onGestureEvent={onGestureEvent()} 
                onHandlerStateChange={(event)=>onHandlerStateChange(event)}>
                    <Animated.View style={{flexDirection:'row',marginBottom:20, transform: [{ translateX }]}}>
                        <Pressable onPress={minus}    
                        style={{width:'10%',backgroundColor:'#4ECDC4',borderTopLeftRadius:15,borderBottomLeftRadius:15,alignItems:'center',justifyContent:'center'}}>
                            <Image style={{width:60,height:60}}
                            source={require('../../assets/images/minus.png')} />
                        </Pressable>
                        <View style={styles.box}>
                            <View style={{position:'absolute', top: -21,left:20, alignSelf: 'center'}}>
                                <View style={styles.countdown}>
                                    <Text style={{color: '#292F36', fontSize: 15, fontWeight: '700'}}>Poste n°{poste_clicked}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                <Text style={{color:'black',fontSize:20,fontWeight:'700'}}>PRICE:   </Text>
                                <Pressable onPress={clicking_ref}
                                style={clicked_price ? styles.form_ref_clicked : styles.form_ref }>
                                    <Text style={{color:'#292F36',fontWeight:'900',fontSize:25,padding:5,letterSpacing:2}}>{valeur_price.toLocaleString()}</Text>
                                </Pressable>
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                <Text style={{color:'black',fontSize:20,fontWeight:'700'}}>TIME:   </Text>
                                <Pressable onPress={clicking_heure}
                                style={clicked_heure ? styles.form_time_clicked : styles.form_time }>
                                    <Text style={{color:'#292F36',fontWeight:'900',fontSize:25,padding:5,letterSpacing:2}}>{valeur_heure}</Text>
                                </Pressable >
                                    <Text style={{fontSize:20,fontWeight:'700',color:'black'}}> : </Text>
                                <Pressable  onPress={clicking_minute}
                                style={clicked_minute ? styles.form_time_clicked : styles.form_time }>
                                    <Text style={{color:'#292F36',fontWeight:'900',fontSize:25,padding:5,letterSpacing:2}}>{valeur_minute.toString().length === 1  ? `0${valeur_minute}` : valeur_minute}</Text>
                                </Pressable>
                            </View>
                        </View>
                        <Pressable onPress={plus}
                        style={{width:'10%',backgroundColor:'#292F36',borderTopRightRadius:15,borderBottomRightRadius:15,alignItems:'center',justifyContent:'center'}}>
                            <Image style={{width:38,height:38}}
                            source={require('../../assets/images/plus(2).png')} />
                        </Pressable>
                    </Animated.View>
                </PanGestureHandler>
            </GestureHandlerRootView>
                : null
          }
          

        <ScrollView horizontal style={styles.scroll_horizantal}>
            {postes.map((poste,index)=>{
                return(
                    <>
                        <View key={index} style={{flexDirection:'column',justifyContent:'space-between'}}>
                            <Pressable onPress={()=>{setPoste_clicked(poste.num_poste)}}
                            style={poste_clicked == poste.num_poste ? styles.poste_clicked : styles.poste}>
                                <Text style={poste_clicked == poste.num_poste ? {fontWeight:700,fontSize:30,color:'#292F36'} : {fontWeight:700,fontSize:30,color:'#4ECDC4'} }>{poste.num_poste}</Text>
                                {poste_clicked == poste.num_poste ? 
                                <View style={{padding:5,borderRadius:50,backgroundColor:'black'}}></View> :
                                null}
                            </Pressable>

                            <ScrollView >
                            {poste.workdays?.length > 0 && Array.isArray(poste.workdays) ?
                            poste.workdays?.filter(item => item.date === date_aujourdhui && item.employee === user.email).map((workday , i)=>{
                                return workday.games.map((current_day_games , j)=>{
                                    if(current_day_games.status === "running"){
                                        return(
                                            <View key={j} style={{marginTop:10}} > 
                                                <Pressable onPress={()=>{update_game(j , current_day_games , poste.num_poste)}}>
                                                    <Update_bg 
                                                    current_day_games={current_day_games} />
                                                </Pressable>
                                            </View>
                                        )
                                    } 
                                    return null
                                })
                            }): null}
                            </ScrollView>
                            
                            <Pressable onPress={()=>{seeMore(poste)}}
                            style={{marginRight:20 , flexDirection:'column', alignItems:'center',gap:5}} >
                                <Text style={{textAlign:'center',color:'#292F36',fontSize:15,fontWeight:'700'}}>see {'\n'}more</Text>
                                <Image style={{width:30 , height:30}}
                                source={require('../../assets/images/arrow_bottom.png')} />
                            </Pressable>
                        </View>

                        <View style={{borderWidth:1,borderColor:'#292F36',height:'100%',borderStyle:'dotted',marginRight:20,}}></View>
                    </>
                )
            })}

            <View style={styles.poste_add}>
                <Text>+</Text>
            </View>
        </ScrollView>

        <Modal transparent visible={modal_seeMore} animationType='slide'>
            <TouchableWithoutFeedback onPress={() => setModal_seeMore(false)}>
                <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <TouchableWithoutFeedback>
                        <View style={{ height: '75%', width: '50%', backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 10 }}>
                            <View style={{ alignSelf: 'center', marginBottom: 30 }}>
                                <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 25, color: '#292F36' }}>
                                poste n°{poste_seeMore}
                                </Text>
                                <Text style={{ textAlign: 'center' }}>{date_aujourdhui}</Text>
                            </View>
                            <ScrollView>
                                {
                                    postes.filter(elt => elt.num_poste === poste_seeMore)[0]?.workdays
                                    .filter(elt => elt.date === date_aujourdhui && elt.employee === user.email)[0]?.games.map((game , j)=>(
                                            (game.status === 'running' ? 
                                                ( <View style={{ marginBottom: 10, backgroundColor: 'white', justifyContent: 'space-between', flexDirection: 'row', padding: 10, borderRadius: 20, alignItems: 'center', paddingHorizontal: 20, borderWidth: 1 }}>
                                                    <Text style={{color:'black',fontWeight:'700'}}> {game.price}DT , {game.timeStarted.heure}:{game.timeStarted.minute} </Text>
                                                    <Icons name='hourglass-end' color='#292F36' style={{fontSize:30}}/>
                                                </View> )
                                            : game.status === 'paid' ? (
                                                <View style={{ marginBottom: 10, backgroundColor: '#4ECDC4', justifyContent: 'space-between', flexDirection: 'row', padding: 10, borderRadius: 20, alignItems: 'center', paddingHorizontal: 20 }}>
                                                    <Text style={{color:'black',fontWeight:'700'}}> {game.price}DT , {game.timeStarted.heure}:{game.timeStarted.minute} </Text>
                                                    <Image style={{ width: 30, height: 30 }} source={require('../../assets/images/check.png')}/>
                                                </View> )
                                            :
                                            ( <View style={{ marginBottom: 10, backgroundColor: '#FB9797', justifyContent: 'space-between', flexDirection: 'row', padding: 10, borderRadius: 20, alignItems: 'center', paddingHorizontal: 20 }}>
                                                <Text style={{color:'black',fontWeight:'700'}}> {game.price}DT , {game.timeStarted.heure}:{game.timeStarted.minute} </Text>
                                                <Image style={{ width: 30, height: 30 }} source={require('../../assets/images/corbeille.png')}/>
                                            </View> )
                                            )
                                        ))
                                }
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>


        <Modal transparent visible={modal_updateGame} animationType='fade'>
            <TouchableWithoutFeedback onPress={()=>{setModal_updateGame(false)}}>
                <View style={{alignItems:'center',height:'100%',backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'space-around'}}>

                    <TouchableWithoutFeedback>
                        <View style={{flexDirection:'row',justifyContent:'space-evenly',width:'100%',alignItems:"center"}}>
                            <View style={{height:80,aspectRatio:1,backgroundColor:'white',borderRadius:100,borderWidth:1,borderColor:'#292F36'}}>
                                <LottieView style={{flex:2}}
                                source={require('../../assets/animations/time.json')} autoPlay loop/>
                            </View>
                            <View style={{backgroundColor:'white',padding:10,borderRadius:10,borderWidth:1,borderColor:'#292F36',alignItems:'center'}}>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={{color:'#292F36',fontSize:20,fontWeight:'700',textAlign:'center'}}>{information_selecte_game?.price}  </Text>
                                    <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                                        <Icons name="hourglass-end" color='red' style={{fontSize:20}}/>
                                        <Text style={{color:'#292F36',fontSize:20,fontWeight:'700'}}>
                                            {information_selecte_game?.timeStarted?.heure} : {information_selecte_game?.timeStarted?.minute}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                                    <Icons name="hourglass-start" color='green' style={{fontSize:20}}/>
                                    <Text style={{color:'#292F36',fontSize:20,textAlign:'center',fontWeight:'700'}}>
                                        {information_selecte_game?.finish_time}
                                    </Text>
                                </View>
                            </View>
                            <View style={{height:80,aspectRatio:1,backgroundColor:'white',borderRadius:100,borderWidth:1,borderColor:'#292F36'}}>
                                <LottieView style={{flex:2}}
                                source={require('../../assets/animations/time.json')} autoPlay loop/>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={{flexDirection:'row',gap:200}}>
                        <TouchableWithoutFeedback>
                            <Pressable  onPress={update_deleted}
                            style={{height:'50%',width:'20%',padding:20,borderRadius:20,elevation:10,alignItems:'center',justifyContent:'center', backgroundColor: '#FB9797'}}>
                                <Image style={{ width: 70, height: 70 }} source={require('../../assets/images/corbeille.png')} />
                            </Pressable>  
                        </TouchableWithoutFeedback>                      
                        <TouchableWithoutFeedback>                     
                            <Pressable onPress={update_paid}
                            style={{height:'50%',width:'20%',padding:20,borderRadius:20,elevation:10,alignItems:'center',justifyContent:'center', backgroundColor: '#4ECDC4'}}>
                                <Image style={{ width: 70, height: 70 }} source={require('../../assets/images/check.png')} />                    
                            </Pressable>
                        </TouchableWithoutFeedback> 
                    </View>

                </View>
            </TouchableWithoutFeedback>
        </Modal>

        <Modal visible={Modal_sucess} animationType='fade' transparent>
            <TouchableWithoutFeedback onPress={()=>add_recette()}>
                <View style={{height:'100%',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.6)',}} >
                <TouchableWithoutFeedback>
                    <View style={{backgroundColor:'white',alignItems:'center',justifyContent:'center',padding:20,borderRadius:20,elevation:10}} >
                        <View style={{ alignSelf: 'center' ,gap:20}}>
                            <Text style={{ textAlign: 'center', fontWeight: '700',fontSize:20, color: '#292F36' }}>
                                game updated successfully
                            </Text>
                            <Pressable onPress={()=>add_recette()} 
                            style={{backgroundColor:'#4ECDC4',paddingVertical:10,borderRadius:20}}    >
                                <Text style={{color:'#292F36', textAlign: 'center',fontWeight: '700',fontSize:20,}}>Ok</Text>
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>

    </LinearGradient>   
  )
}

const styles = StyleSheet.create({
    page:{
        padding:20,
        height:'100%'
    },
    form_ref_clicked:{
        borderWidth:3,
        borderRadius:10,
        borderStyle:'solid',
        backgroundColor:'#4ECDC4',
        fontSize:25,
        justifyContent:'center',
        alignItems:'center',
    },
    form_time_clicked:{
        paddingHorizontal:20,
        borderWidth:3,
        borderRadius:10,
        borderStyle:'solid',
        backgroundColor:'#4ECDC4',
        fontSize:25,
        justifyContent:'center',
        alignItems:'center'
    },
    box:{
        backgroundColor:'rgba(0,0,0,0.1)',
        borderRightWidth:0,
        borderLeftWidth:0,
        padding:10,
        width:'80%',
        height:70,
        justifyContent:'space-evenly',
        flexDirection:'row'
    },
    countdown:{
        backgroundColor:'lightgray',
        padding:10,
        borderRadius:40,
        alignItems:'center',
        justifyContent:'center',
        borderColor:'#292F36',
        borderWidth:2
    },
    scroll_horizantal:{
        marginTop:15,
        minHeight:80
    },
    poste:{
        backgroundColor:'#292F36',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:15,
        marginRight:20,
        width:80,
        height:80
    },
    poste_clicked:{
        backgroundColor:'#4ECDC4',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:15,
        marginRight:20,
        width:80,
        borderWidth:5,
        borderColor:'#292F36',
        height:80
    },
    poste_add:{
        backgroundColor:'rgba(0,0,0,0.2)',
        padding:20,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:15,
        height:80,
        marginRight:10,
        borderStyle:'dashed',
        borderWidth:1,
        width:80
    },

})