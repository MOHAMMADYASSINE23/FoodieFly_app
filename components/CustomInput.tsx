import {View, Text, TextInput} from 'react-native'
import {CustomInputProps} from "@/type";
import {useState} from "react";
import cn from "classnames";

const CustomInput = ({
    placeholder = 'Enter text',
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType="default"
}: CustomInputProps) => {
    const [isFocused, setIsFocused] = useState(false);


    return (
        <View style={{ width: '100%' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{label}</Text>

            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor="#888"
                style={{ borderWidth: 1, borderColor: isFocused ? '#primary' : '#gray-300', padding: 10, borderRadius: 5 }}
            />
        </View>
    )
}
export default CustomInput