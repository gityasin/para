import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Surface, Text, List, useTheme, Button, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { useRouter } from 'expo-router';
import { formatCurrency } from '../services/format';
import { useLanguage } from '../context/LanguageContext';
import { useCategories } from '../context/CategoriesContext';

const CATEGORY_ICONS = {
  Food: 'silverware-fork-knife',
  Transport: 'car',
  Shopping: 'cart',
  Bills: 'file-document',
  Entertainment: 'gamepad-variant',
  Other: 'dots-horizontal',
};

const TransactionItem = ({ transaction }) => {
  const theme = useTheme();
  const { colors } = theme;
  const { dispatch, selectedCurrency } = useTransactions();
  const { getCategoryColor } = useCategories();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const router = useRouter();
  const { t } = useLanguage();

  const isExpense = transaction.amount < 0;
  const amount = Math.abs(transaction.amount);
  const icon = CATEGORY_ICONS[transaction.category] || CATEGORY_ICONS.Other;
  const categoryColor = getCategoryColor(transaction.category);

  const formattedDate = new Date(transaction.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = () => {
    setMenuVisible(false);
    dispatch({
      type: 'DELETE_TRANSACTION',
      payload: transaction.id,
    });
  };

  const handleEdit = () => {
    setMenuVisible(false);
    router.push({
      pathname: '/add-transaction',
      params: {
        isEditing: true,
        transaction: JSON.stringify(transaction),
      },
    });
  };

  const handleMenuPress = (event) => {
    if (Platform.OS === 'web') {
      const rect = event.currentTarget.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      setMenuPosition({
        top: rect.bottom + scrollY,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuVisible(true);
  };

  return (
    <Surface style={styles.surface} elevation={1}>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <List.Item
            title={transaction.description}
            description={`${transaction.category} • ${formattedDate}`}
            left={props => (
              <MaterialCommunityIcons
                name={icon}
                size={24}
                color={categoryColor}
                style={props.style}
              />
            )}
            right={props => (
              <View style={styles.rightContainer}>
                {transaction.isRecurring && (
                  <MaterialCommunityIcons
                    name="refresh"
                    size={16}
                    color={colors.primary}
                    style={styles.recurringIcon}
                  />
                )}
                <Text
                  {...props}
                  variant="titleMedium"
                  style={[
                    styles.amount,
                    { color: isExpense ? colors.error : colors.success }
                  ]}
                >
                  {isExpense ? '-' : '+'}{formatCurrency(amount, selectedCurrency)}
                </Text>
              </View>
            )}
            titleStyle={styles.title}
            descriptionStyle={[styles.description, { color: colors.textSecondary }]}
          />
        </View>

        <TouchableOpacity 
          onPress={handleMenuPress}
          style={styles.menuButton}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <Portal>
        {menuVisible && (
          <>
            <TouchableOpacity 
              style={styles.backdrop} 
              onPress={() => setMenuVisible(false)} 
              activeOpacity={1}
            />
            <View 
              style={[
                styles.dropdown, 
                { 
                  backgroundColor: colors.surface,
                  top: menuPosition.top,
                  right: menuPosition.right,
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  handleEdit();
                  setMenuVisible(false);
                }}
              >
                <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
                <Text style={[styles.dropdownText, { color: colors.text }]}>{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  handleDelete();
                  setMenuVisible(false);
                }}
              >
                <MaterialCommunityIcons name="delete" size={20} color={colors.error} />
                <Text style={[styles.dropdownText, { color: colors.text }]}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    marginBottom: 8,
    borderRadius: 8,
    position: 'relative',
    zIndex: 1, // Add base z-index
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '500',
  },
  description: {
    marginTop: 4,
  },
  amount: {
    fontWeight: '600',
    alignSelf: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuWrapper: {
    position: 'relative',
  },
  menuButton: {
    padding: 8,
    marginRight: 4,
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dropdown: {
    position: 'fixed',
    minWidth: 150,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
    zIndex: 1000,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    } : {}),
  },
  recurringIcon: {
    marginRight: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  dropdownText: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default TransactionItem;