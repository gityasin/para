import React, { useEffect, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';

import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ChartScreen from '../screens/ChartScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

function HomeStack() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'PARA',
        }}
      />
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={({ route }) => ({
          title: route.params?.isEditing ? 'Edit Transaction' : 'Add Transaction',
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
          },
        })}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const screenOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: colors.background,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '600',
    },
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      paddingVertical: 8,
      height: 60,
    },
    tabBarShowLabel: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500',
    },
  };

  return (
    <Tab.Navigator
      initialRouteName="HomeStack"
      screenOptions={screenOptions}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: t('tabHome'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Charts"
        component={ChartScreen}
        options={{
          title: t('tabCharts'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('tabSettings'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [, forceUpdate] = useState({});

  const checkOnboardingStatus = useCallback(async () => {
    try {
      console.log('Checking onboarding status...');
      const status = await AsyncStorage.getItem('hasCompletedOnboarding');
      console.log('Retrieved onboarding status:', status);
      
      const shouldShowMainApp = status === 'true';
      console.log('Should show main app:', shouldShowMainApp);
      
      setHasCompletedOnboarding(shouldShowMainApp);
      forceUpdate({});
    } catch (error) {
      console.error('Error in checkOnboardingStatus:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  // Check on focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, checking onboarding status');
      checkOnboardingStatus();
    }, [checkOnboardingStatus])
  );

  // Add listener for storage changes
  useEffect(() => {
    const checkStorageChanges = async () => {
      try {
        const status = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (status === 'true' && !hasCompletedOnboarding) {
          console.log('Storage changed, updating navigation state');
          setHasCompletedOnboarding(true);
          forceUpdate({});
        }
      } catch (error) {
        console.error('Error checking storage changes:', error);
      }
    };

    const interval = setInterval(checkStorageChanges, 500);
    return () => clearInterval(interval);
  }, [hasCompletedOnboarding]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log('Rendering RootNavigation with hasCompletedOnboarding:', hasCompletedOnboarding);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <RootStack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            animationEnabled: false,
            gestureEnabled: false
          }}
        />
      ) : (
        <RootStack.Screen 
          name="MainApp" 
          component={TabNavigator}
          options={{
            animationEnabled: false
          }}
        />
      )}
    </RootStack.Navigator>
  );
}
