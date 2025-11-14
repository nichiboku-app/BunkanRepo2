import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const TOTAL_ONIGIRIS = 15;

const OnigiriRain = () => {
  const animations = useRef(
    [...Array(TOTAL_ONIGIRIS)].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animatedLoops = animations.map((anim, index) => {
      const duration = 6000 + Math.random() * 3000;

      return Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          delay: index * 300,
        })
      );
    });

    animatedLoops.forEach((loop) => loop.start());

    return () => {
      animatedLoops.forEach((loop) => loop.stop?.());
    };
  }, [animations]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {animations.map((animation, index) => {
        const startX = Math.random() * width;
        const endY = height + 100;

        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, endY],
        });

        const rotate = animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${Math.random() * 360}deg`],
        });

        return (
          <Animated.Image
            key={index}
            source={require('../../assets/visuals/onigiri.webp')}
            style={[
              styles.onigiri,
              {
                left: startX,
                transform: [{ translateY }, { rotate }],
              },
            ]}
            resizeMode="contain"
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  onigiri: {
    position: 'absolute',
    width: 40,
    height: 40,
    opacity: 0.8,
  },
});

export default OnigiriRain;
