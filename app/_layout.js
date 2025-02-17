import { useEffect, useState } from 'react';
import { Slot, useRouter, usePathname, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { TransactionsProvider } from '../src/context/TransactionsContext';
import { CategoriesProvider } from '../src/context/CategoriesContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import { ThemeProvider } from '../theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(status === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!isLoading && !hasCompletedOnboarding && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [isLoading, hasCompletedOnboarding, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <CategoriesProvider>
              <TransactionsProvider>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="onboarding"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="add-transaction"
                    options={{
                      presentation: 'modal',
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: colors.background,
                      },
                      headerTintColor: colors.text,
                    }}
                  />
                </Stack>
              </TransactionsProvider>
            </CategoriesProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
} 