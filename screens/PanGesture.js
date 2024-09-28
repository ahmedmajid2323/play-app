import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Pressable,
} from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('screen');

export default function App() {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const [targetLayout, setTargetLayout] = useState(null); // Store target component's layout
  const [view_box, setView_box] = useState(true); // Control the visibility of the box

  // Function to run when the box overlaps with the target component
  const handleOverlap = () => {
    Alert.alert('Warning','you want to delete this component ?',
        [
            {text:'delete',onPress : ()=>console.log('deleted')
            },
            {text:'ok'}
        ]
    )
  };

  // Get layout of the target box (drag me here)
  const onTargetLayout = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setTargetLayout({ x, y, width, height });
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      'worklet';
      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

      const maxTranslateX = width / 2 - 50;
      const maxTranslateY = height / 2 - 50;

      translationX.value = clamp(
        prevTranslationX.value + event.translationX,
        -maxTranslateX,
        maxTranslateX
      );
      translationY.value = clamp(
        prevTranslationY.value + event.translationY,
        -maxTranslateY,
        maxTranslateY
      );

      if (targetLayout) {
        const boxX = translationX.value + width / 2 - 50; // Calculate box X position
        const boxY = translationY.value + height / 2 - 50; // Calculate box Y position

        // Check if box is inside the target area
        const isInTarget =
          boxX > targetLayout.x &&
          boxX < targetLayout.x + targetLayout.width &&
          boxY > targetLayout.y &&
          boxY < targetLayout.y + targetLayout.height;

        if (isInTarget) {
          runOnJS(handleOverlap)(); // Run function in JS thread to hide the box
        }
      }
    })
    .onEnd(() => {
      translationX.value = withTiming(0);
      translationY.value = withTiming(0);
    });

  return (
    <>
    <View style={{ flex: 1 }}>
      {/* Target component (drag me here) */}
      <View
        style={styles.target}
        onLayout={onTargetLayout} // Capture layout of the target component
      >
        <Text style={styles.targetText}>drag me here</Text>
      </View>

      {/* Draggable box */}
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={pan}>
            <View>
                {view_box ? (
                <Animated.View style={[animatedStyles, styles.box]}></Animated.View>
                ) : null}
            </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#b58df1',
    borderRadius: 20,
  },
  target: {
    position: 'absolute',
    top: height / 4,
    left: width / 4,
    width: 150,
    height: 150,
    backgroundColor: '#f1c40f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 25,
    color: '#292F36',
  },
});
