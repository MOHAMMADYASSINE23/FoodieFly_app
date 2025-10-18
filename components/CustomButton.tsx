import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React from 'react'
import {CustomButtonProps} from "@/type";
import cn from "classnames";

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title = "Click Me",
  style,
  textStyle,
  leftIcon,
  isLoading = false
}) => {
  return (
    <TouchableOpacity style={[{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }, style]} onPress={onPress}>
      {leftIcon}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={[{ color: 'white', fontSize: 16 }, textStyle]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;