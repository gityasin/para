import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES_STORAGE_KEY = '@categories';
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    // Load categories from storage on mount
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveCategories = async (newCategories) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const addCategory = async (category) => {
    if (!category || categories.includes(category)) return;
    const newCategories = [...categories, category];
    await saveCategories(newCategories);
  };

  const removeCategory = async (category) => {
    const newCategories = categories.filter(c => c !== category);
    await saveCategories(newCategories);
  };

  const updateCategory = async (oldCategory, newCategory) => {
    if (!newCategory || categories.includes(newCategory)) return;
    const newCategories = categories.map(c => 
      c === oldCategory ? newCategory : c
    );
    await saveCategories(newCategories);
  };

  return (
    <CategoriesContext.Provider 
      value={{
        categories,
        addCategory,
        removeCategory,
        updateCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
} 