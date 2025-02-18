import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, useTheme, SegmentedButtons } from 'react-native-paper';
import { VictoryPie } from 'victory-native';
import { useTransactions } from '../../context/TransactionsContext';
import { formatCurrency } from '../../services/format';
import { useLanguage } from '../../context/LanguageContext';

const CHART_TYPES = [
  { value: 'pie', label: 'pieChart' },
  { value: 'donut', label: 'donutChart' },
];

export default function ChartScreen() {
  const { state, selectedCurrency } = useTransactions();
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useLanguage();
  const [chartType, setChartType] = useState('pie');

  // Calculate total expenses and group by category
  const expensesByCategory = state.transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc, tx) => {
      const category = tx.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {});

  const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    x: category,
    y: amount,
  }));

  const colorScale = [
    colors.primary,
    colors.secondary,
    colors.error,
    colors.success,
    colors.warning,
    colors.info,
  ];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={{ color: colors.textSecondary }}>
        {t('noExpenseData')}
      </Text>
      <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
        {t('addExpensesToSee')}
      </Text>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: colors.text, textAlign: 'center', width: '100%' }]}>
        {t('expenseBreakdown')}
      </Text>
      
      <Surface style={[styles.chartContainer, { backgroundColor: colors.surface, width: '100%' }]} elevation={2}>
        <Text variant="titleLarge" style={[styles.totalAmount, { color: colors.error, textAlign: 'center', width: '100%' }]}>
          {t('totalSpent')}: {formatCurrency(total, selectedCurrency)}
        </Text>

        <SegmentedButtons
          value={chartType}
          onValueChange={setChartType}
          buttons={CHART_TYPES.map(type => ({
            ...type,
            label: t(type.label)
          }))}
          style={styles.segmentedButtons}
        />
        
        {total > 0 ? (
          <>
            <VictoryPie
              data={chartData}
              colorScale={colorScale}
              innerRadius={chartType === 'donut' ? 80 : 0}
              padAngle={2}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              height={300}
              width={Math.min(350, Dimensions.get('window').width - 40)}
              style={{
                data: {
                  stroke: colors.background,
                  strokeWidth: 1,
                },
              }}
            />

            <View style={styles.legendContainer}>
              {chartData.map((item, index) => (
                <View key={item.x} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colorScale[index % colorScale.length] }]} />
                  <View style={styles.legendText}>
                    <Text style={[styles.legendCategory, { color: colors.text }]}>{item.x}</Text>
                    <Text style={[styles.legendAmount, { color: colors.textSecondary }]}>
                      {formatCurrency(item.y, selectedCurrency)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          renderEmptyState()
        )}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 16,
    width: '100%',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 8,
  },
  totalAmount: {
    marginBottom: 16,
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 12,
    marginTop: 2,
  },
});
