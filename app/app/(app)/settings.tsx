import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6" style={{ direction: 'rtl' }}>
      <TouchableOpacity
        onPress={() => supabase.auth.signOut()}
        className="bg-red-500 rounded-xl px-8 py-3"
      >
        <Text className="text-white font-semibold text-base">تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}
