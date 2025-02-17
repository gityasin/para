import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Surface, Text, List, useTheme, TouchableRipple, Menu, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../services/format';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_ICONS = {
  Food: 'silverware-fork-knife',
  Transport: 'car',
  Shopping: 'cart',
  Bills: 'file-document',
  Entertainment: 'gamepad-variant',
  Other: 'dots-horizontal',
};

export default function TransactionItem({ transaction, onPress }) {
  const theme = useTheme();
  const { colors } = theme;
  const { dispatch, selectedCurrency } = useTransactions();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const navigation = useNavigation();
  const { t } = useLanguage();

  const isExpense = transaction.amount < 0;
  const amount = Math.abs(transaction.amount);
  const icon = CATEGORY_ICONS[transaction.category] || CATEGORY_ICONS.Other;

  const formattedDate = new Date(transaction.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = () => {
    dispatch({
      type: 'DELETE_TRANSACTION',
      payload: transaction.id,
    });
    setMenuVisible(false);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('AddTransaction', {
      isEditing: true,
      transaction: {
        ...transaction,
        amount: Math.abs(transaction.amount),
      },
    });
  };

  const dynamicStyles = {
    menuContent: {
      backgroundColor: colors.surface,
    }
  };

  return (
    <Surface style={styles.surface} elevation={1}>
      <View style={styles.container}>
        <TouchableRipple
          onPress={(e) => {
            if (!menuVisible) {
              onPress();
            }
          }}
          style={[styles.touchable, { flex: 1 }]}
          disabled={menuVisible}
        >
          <List.Item
            title={transaction.description}
            description={`${transaction.category} • ${formattedDate}`}
            left={props => (
              <MaterialCommunityIcons
                name={icon}
                size={24}
                color={colors.primary}
                style={props.style}
              />
            )}
            right={props => (
              <View style={styles.rightContainer}>
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
        </TouchableRipple>
        
        <View style={styles.menuContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  setMenuVisible(true);
                }}
                style={styles.menuButton}
              >
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            }
            contentStyle={[dynamicStyles.menuContent]}
            anchorPosition="bottom"
            statusBarHeight={0}
          >
            <Menu.Item
              onPress={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              title={t('edit')}
              leadingIcon={props => (
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color={props.color}
                />
              )}
            />
            <Menu.Item
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title={t('delete')}
              leadingIcon={props => (
                <MaterialCommunityIcons
                  name="delete"
                  size={20}
                  color={props.color}
                />
              )}
            />
          </Menu>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchable: {
    flex: 1,
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
  menuContainer: {
    paddingRight: 8,
  },
  menuButton: {
    padding: 8,
  },
  menu: {
    position: 'absolute',
    right: 8,
    zIndex: 3,
  },
});