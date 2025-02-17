import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal as RNModal } from 'react-native';
import { List, Switch, Divider, Text, Surface, useTheme, Button, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scheduleDailyReminder } from '../notifications/NotificationsService';
import { useAppTheme } from '../../theme';
import { getAvailableCurrencies } from '../services/format';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from '../context/TransactionsContext';
import { useCategories } from '../context/CategoriesContext';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const currencies = getAvailableCurrencies();
  const { selectedCurrency, handleCurrencyChange } = useTransactions();
  const { categories, addCategory, removeCategory, updateCategory } = useCategories();
  
  // Category management state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editedCategory, setEditedCategory] = useState('');

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      await scheduleDailyReminder();
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleCurrencySelect = async (currencyCode) => {
    await handleCurrencyChange(currencyCode);
    setShowCurrencySelector(false);
  };

  const selectedCurrencyDetails = currencies.find(c => c.code === selectedCurrency);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const handleEditCategory = () => {
    if (editedCategory.trim() && selectedCategory) {
      updateCategory(selectedCategory, editedCategory.trim());
      setEditedCategory('');
      setSelectedCategory(null);
      setShowEditCategory(false);
    }
  };

  const handleDeleteCategory = (category) => {
    removeCategory(category);
  };

  const renderDialog = (visible, title, content, onDismiss) => {
    return (
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.modalOverlay}>
          <Surface style={[styles.dialogContainer, { backgroundColor: colors.surface }]} elevation={5}>
            <Text variant="titleLarge" style={[styles.dialogTitle, { color: colors.text }]}>
              {title}
            </Text>
            {content}
          </Surface>
        </View>
      </RNModal>
    );
  };

  const renderAddCategoryDialog = () => {
    return renderDialog(
      showAddCategory,
      t('addNewCategory'),
      <View>
        <TextInput
          label={t('categoryName')}
          value={newCategory}
          onChangeText={setNewCategory}
          mode="outlined"
          style={styles.dialogInput}
        />
        <View style={styles.dialogActions}>
          <Button onPress={() => setShowAddCategory(false)}>{t('cancel')}</Button>
          <Button onPress={handleAddCategory}>{t('add')}</Button>
        </View>
      </View>,
      () => setShowAddCategory(false)
    );
  };

  const renderEditCategoryDialog = () => {
    return renderDialog(
      showEditCategory,
      t('editCategory'),
      <View>
        <TextInput
          label={t('categoryName')}
          value={editedCategory}
          onChangeText={setEditedCategory}
          mode="outlined"
          style={styles.dialogInput}
        />
        <View style={styles.dialogActions}>
          <Button onPress={() => setShowEditCategory(false)}>{t('cancel')}</Button>
          <Button onPress={handleEditCategory}>{t('update')}</Button>
        </View>
      </View>,
      () => setShowEditCategory(false)
    );
  };

  const renderCurrencySelector = () => {
    return renderDialog(
      showCurrencySelector,
      'Select Currency',
      <View>
        <ScrollView style={styles.currencyList}>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyItem,
                selectedCurrency === currency.code && { backgroundColor: colors.primaryContainer }
              ]}
              onPress={() => handleCurrencySelect(currency.code)}
            >
              <Text style={[styles.currencyLabel, { color: colors.text }]}>
                {currency.label}
              </Text>
              {selectedCurrency === currency.code && (
                <MaterialCommunityIcons
                  name="check"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button 
          onPress={() => setShowCurrencySelector(false)}
          style={styles.dialogCloseButton}
        >
          Close
        </Button>
      </View>,
      () => setShowCurrencySelector(false)
    );
  };

  const renderLanguageSelector = () => {
    const languages = [
      { code: 'tr', label: 'Türkçe' },
      { code: 'en', label: 'English' }
    ];

    return renderDialog(
      showLanguageSelector,
      t('language'),
      <View>
        <ScrollView style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                language === lang.code && { backgroundColor: colors.primaryContainer }
              ]}
              onPress={() => {
                changeLanguage(lang.code);
                setShowLanguageSelector(false);
              }}
            >
              <Text style={[styles.languageLabel, { color: colors.text }]}>
                {lang.label}
              </Text>
              {language === lang.code && (
                <MaterialCommunityIcons
                  name="check"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button 
          onPress={() => setShowLanguageSelector(false)}
          style={styles.dialogCloseButton}
        >
          {t('close')}
        </Button>
      </View>,
      () => setShowLanguageSelector(false)
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container}>
        <Surface style={[styles.surface, { backgroundColor: colors.surface }]} elevation={1}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: colors.text }]}>
            {t('appSettings')}
          </Text>
          
          <List.Section>
            <List.Item
              title={t('darkMode')}
              description={t('darkModeDesc')}
              left={props => (
                <MaterialCommunityIcons
                  name="theme-light-dark"
                  size={24}
                  color={props.color}
                  style={props.style}
                />
              )}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title={t('dailyReminders')}
              description={t('dailyRemindersDesc')}
              left={props => (
                <MaterialCommunityIcons
                  name="bell"
                  size={24}
                  color={props.color}
                  style={props.style}
                />
              )}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title={t('currencyFormat')}
              description={`${t('currentCurrency')}${selectedCurrencyDetails?.label || 'USD ($)'}`}
              left={props => (
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={24}
                  color={props.color}
                  style={props.style}
                />
              )}
              onPress={() => setShowCurrencySelector(true)}
            />
            <Divider />

            <List.Item
              title={t('language')}
              description={t('languageDesc')}
              left={props => (
                <MaterialCommunityIcons
                  name="translate"
                  size={24}
                  color={props.color}
                  style={props.style}
                />
              )}
              onPress={() => setShowLanguageSelector(true)}
            />
          </List.Section>

          <Divider style={styles.divider} />

          <List.Section>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
              {t('categories')}
            </Text>
            
            {categories.map((category) => (
              <List.Item
                key={category}
                title={category}
                right={props => (
                  <View style={styles.categoryActions}>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={24}
                      color={colors.primary}
                      onPress={() => {
                        setSelectedCategory(category);
                        setEditedCategory(category);
                        setShowEditCategory(true);
                      }}
                      style={{ padding: 8 }}
                    />
                    <MaterialCommunityIcons
                      name="delete"
                      size={24}
                      color={colors.error}
                      onPress={() => handleDeleteCategory(category)}
                      style={{ padding: 8 }}
                    />
                  </View>
                )}
              />
            ))}
            
            <Button
              mode="outlined"
              onPress={() => setShowAddCategory(true)}
              style={styles.addButton}
            >
              {t('addNewCategory')}
            </Button>
          </List.Section>
        </Surface>

        <Surface style={[styles.surface, styles.aboutSection, { backgroundColor: colors.surface }]} elevation={1}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: colors.text }]}>
            {t('about')}
          </Text>
          
          <List.Section>
            <List.Item
              title={t('version')}
              description="1.0.0"
              left={props => (
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color={props.color}
                  style={props.style}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title={t('helpAndSupport')}
              description={t('helpDesc')}
              left={props => (
                <MaterialCommunityIcons
                  name="help-circle"
                  size={24}
                  color={props.color}
                  style={props.style}
                />
              )}
              onPress={() => {/* TODO: Implement help section */}}
            />
            <Divider />
            
            <List.Item
              title={t('privacyPolicy')}
              description={t('privacyPolicyDesc')}
              left={props => (
                <MaterialCommunityIcons
                  name="shield-account"
                  size={24}
                  color={props.color}
                  style={props.style}
                />
              )}
              onPress={() => {/* TODO: Implement privacy policy */}}
            />
          </List.Section>
        </Surface>
      </ScrollView>

      {renderCurrencySelector()}
      {renderLanguageSelector()}
      {renderAddCategoryDialog()}
      {renderEditCategoryDialog()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  surface: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  aboutSection: {
    marginTop: 8,
  },
  currencySelector: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -200 }],
    width: 300,
    maxHeight: 400,
    borderRadius: 8,
    padding: 16,
  },
  currencySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencySelectorTitle: {
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyList: {
    flexGrow: 0,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
  },
  currencyLabel: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 8,
    padding: 16,
  },
  dialogTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  dialogInput: {
    marginBottom: 16,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  dialogCloseButton: {
    marginTop: 16,
  },
  languageList: {
    maxHeight: 200,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  languageLabel: {
    fontSize: 16,
  },
});
