import AddTransactionScreen from '../src/screens/AddTransactionScreen';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function AddTransaction() {
  const params = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1 }}>
      <AddTransactionScreen 
        isEditing={params.isEditing === 'true'}
        transaction={params.transaction ? JSON.parse(params.transaction) : null}
      />
    </View>
  );
} 