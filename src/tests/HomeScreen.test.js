import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { TransactionsContext } from '../context/TransactionsContext';

describe('HomeScreen', () => {
  it('displays total spent based on context transactions', () => {
    const mockState = {
      transactions: [
        { id: '1', description: 'Test1', amount: 10, date: '2023-01-01' },
        { id: '2', description: 'Test2', amount: 15, date: '2023-01-02' },
      ],
    };

    const { getByText } = render(
      <TransactionsContext.Provider value={{ state: mockState, dispatch: jest.fn() }}>
        <HomeScreen />
      </TransactionsContext.Provider>
    );

    // The total should be 25
    expect(getByText('Total Spent: $25.00')).toBeTruthy();
  });
});
