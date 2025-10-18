import {SplashScreen, Stack} from "expo-router";
import { useFonts } from 'expo-font';
import { useEffect} from "react";
import useAuthStore from "@/store/auth.store";

// import './globals.css';

export default function RootLayout() {
    const { fetchAuthenticatedUser, isAuthenticated } = useAuthStore();

    const [fontsLoaded, error] = useFonts({
     "QuickSand-Bold": require('../assets/fonts/Quicksand-Bold.ttf'),
     "QuickSand-Medium": require('../assets/fonts/Quicksand-Medium.ttf'),
     "QuickSand-Regular": require('../assets/fonts/Quicksand-Regular.ttf'),
     "QuickSand-SemiBold": require('../assets/fonts/Quicksand-SemiBold.ttf'),
     "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
   });

  // console.log('fontsLoaded:', fontsLoaded, 'error:', error);
  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  useEffect(() => {
      console.log('fetchAuthenticatedUser effect triggered');
      fetchAuthenticatedUser();
  }, []);

  console.log('RootLayout render - isAuthenticated:', isAuthenticated);

  return <Stack screenOptions={{ headerShown: false }} />;
}

