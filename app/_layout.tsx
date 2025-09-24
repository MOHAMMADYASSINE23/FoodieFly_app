import {SplashScreen, Stack} from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect} from "react";

import './globals.css';

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,

export default function RootLayout() {

  // const [fontsLoaded, error] = useFonts({
  //   "QuickSand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
  //   "QuickSand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
  //   "QuickSand-Regular": require('../assets/fonts/Quicksand-Regular.ttf'),
  //   "QuickSand-SemiBold": require('../assets/fonts/Quicksand-SemiBold.ttf'),
  //   "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
  // });

  // console.log('fontsLoaded:', fontsLoaded, 'error:', error);
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

   return <Stack screenOptions={{ headerShown: false }} />;
}

