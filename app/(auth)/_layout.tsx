import { View, Text, KeyboardAvoidingView, Dimensions, Platform, ScrollView, ImageBackground, Image } from 'react-native'
import { Slot, Redirect } from 'expo-router'
import { images } from '@/constants';
import useAuthStore from '@/store/auth.store';

export default function AuthLayout() {
    const { isAuthenticated } = useAuthStore()

    if(isAuthenticated) return <Redirect href="/" />

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ backgroundColor: 'white', height: '100%' }} keyboardShouldPersistTaps='handled'>
                <View style={{ width: '100%', position: 'relative', height: Dimensions.get('screen').height /2.25}}>
                    <ImageBackground source={images.loginGraphic} style={{ width: '100%', height: '100%', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} resizeMode='stretch' />
                    <Image source={images.logo} style={{ alignSelf: 'center', width: 192, height: 192, position: 'absolute', bottom: -64, zIndex: 10 }} />
                </View>
                <Slot />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}