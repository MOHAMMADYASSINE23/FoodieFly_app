import { View, Text, Alert, TouchableOpacity } from 'react-native'
import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {signIn} from "@/lib/write";
import useAuthStore from "@/store/auth.store";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const { fetchAuthenticatedUser, isAuthenticated } = useAuthStore();

  // Navigate when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  const submit = async () => {
   const { email, password } = form;
   if (!email || !password) return Alert.alert('Error', 'Please fill valid email address and password.');
   setIsSubmitting(true);
   try {
     await signIn({ email, password });
     // Update authentication state - navigation will happen via useEffect
     await fetchAuthenticatedUser();
   } catch (error: any) {
     Alert.alert('Error', error.message);
   } finally {
     setIsSubmitting(false);
   }
 }
  return (
    <View style={{ gap: 40, backgroundColor: 'white', borderRadius: 8, padding: 20, marginTop: 20 }}>
      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        label="Email"
        keyboardType="email-address"
      />

      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
        label="Password"
        secureTextEntry={true}
      />

      <CustomButton
        title="Sign In"
        isLoading={isSubmitting}
        onPress={submit}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 8 }}>
        <Text style={{ fontSize: 16, color: '#gray-100' }}>Don&apos;t have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/sign-up')}>
          <Text style={{ fontWeight: 'bold', color: '#primary' }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignIn;