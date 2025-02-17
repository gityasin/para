import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Surface, useTheme, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTransactions } from '../context/TransactionsContext';
import { useAppTheme } from '../../theme';
import { CURRENCIES } from '../services/format';
import { useRouter } from 'expo-router';

const LANGUAGES = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { colors } = theme;
  const { changeLanguage, t } = useLanguage();
  const { handleCurrencyChange } = useTransactions();
  const { isDarkMode, toggleTheme } = useAppTheme();

  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    handleLanguageSelect('tr');
  }, []);

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    changeLanguage(lang);
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    handleCurrencyChange(currency);
  };

  const handleThemeSelect = (isDark) => {
    if (isDark !== isDarkMode) {
      toggleTheme();
    }
  };

  const handleComplete = async () => {
    try {
      const preferences = {
        language: selectedLanguage,
        currency: selectedCurrency,
        theme: isDarkMode ? 'dark' : 'light'
      };
      
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error in handleComplete:', error);
      Alert.alert(
        'Error',
        'There was an error saving your preferences. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderLanguageStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        {t('selectLanguage')}
      </Text>
      <Surface style={styles.optionsContainer} elevation={2}>
        {LANGUAGES.map((lang) => (
          <Button
            key={lang.value}
            mode={selectedLanguage === lang.value ? 'contained' : 'outlined'}
            onPress={() => handleLanguageSelect(lang.value)}
            style={styles.optionButton}
          >
            {lang.label}
          </Button>
        ))}
      </Surface>
    </View>
  );

  const renderCurrencyStep = () => {
    const currencyEntries = Object.entries(CURRENCIES);
    const sortedCurrencies = [
      // Put TRY first
      currencyEntries.find(([code]) => code === 'TRY'),
      // Then add all other currencies
      ...currencyEntries.filter(([code]) => code !== 'TRY'),
    ].filter(Boolean); // Remove any undefined entries

    return (
      <View style={styles.stepContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('selectCurrency')}
        </Text>
        <Surface style={styles.optionsContainer} elevation={2}>
          <ScrollView style={styles.currencyList}>
            {sortedCurrencies.map(([code, currency]) => (
              <Button
                key={code}
                mode={selectedCurrency === code ? 'contained' : 'outlined'}
                onPress={() => handleCurrencySelect(code)}
                style={styles.optionButton}
              >
                {`${currency.symbol} ${code}`}
              </Button>
            ))}
          </ScrollView>
        </Surface>
      </View>
    );
  };

  const renderThemeStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        {t('chooseTheme')}
      </Text>
      <Surface style={styles.optionsContainer} elevation={2}>
        <Button
          mode={!isDarkMode ? 'contained' : 'outlined'}
          onPress={() => handleThemeSelect(false)}
          style={styles.optionButton}
          left={(props) => (
            <MaterialCommunityIcons
              name="white-balance-sunny"
              size={24}
              color={props.color}
            />
          )}
        >
          {t('lightTheme')}
        </Button>
        <Button
          mode={isDarkMode ? 'contained' : 'outlined'}
          onPress={() => handleThemeSelect(true)}
          style={styles.optionButton}
          left={(props) => (
            <MaterialCommunityIcons
              name="weather-night"
              size={24}
              color={props.color}
            />
          )}
        >
          {t('darkTheme')}
        </Button>
      </Surface>
    </View>
  );

  const steps = [
    renderLanguageStep,
    renderCurrencyStep,
    renderThemeStep,
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="displaySmall" style={[styles.welcomeTitle, { color: colors.primary }]}>
        {t('welcome')}
      </Text>
      
      {steps[currentStep]()}
      
      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={() => setCurrentStep(prev => prev - 1)}
            style={styles.navButton}
          >
            {t('previous')}
          </Button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <Button
            mode="contained"
            onPress={() => setCurrentStep(prev => prev + 1)}
            style={styles.navButton}
          >
            {t('next')}
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleComplete}
            style={styles.navButton}
          >
            {t('getStarted')}
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  optionButton: {
    marginVertical: 8,
  },
  currencyList: {
    maxHeight: 300,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
}); 