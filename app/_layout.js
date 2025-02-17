import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { CategoriesProvider } from '../context/CategoriesContext';
import { TransactionsProvider } from '../context/TransactionsContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AppThemeProvider, useAppTheme } from '../theme/theme';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

function RootLayoutContent() {
  const { theme, isDarkMode } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: 'modal',
            headerTitle: 'Add Transaction',
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <PaperProvider>
        <LanguageProvider>
          <TransactionsProvider>
            <CategoriesProvider>
              <RootLayoutContent />
            </CategoriesProvider>
          </TransactionsProvider>
        </LanguageProvider>
      </PaperProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: '100vh',
    backgroundColor: 'transparent',
  },
});
