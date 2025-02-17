import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { VictoryPie, VictoryLabel, VictoryLegend, VictoryAnimation } from 'victory-native';
import { Text, Surface, useTheme, SegmentedButtons } from 'react-native-paper';
import { useTransactions } from '../context/TransactionsContext';
import { formatCurrency } from '../services/format';
import { useLanguage } from '../context/LanguageContext';

const CHART_TYPES = [
  { value: 'pie', label: 'pieChart' },
  { value: 'donut', label: 'donutChart' },
];

export default function ChartScreen() {
  const { state, selectedCurrency } = useTransactions();
  const theme = useTheme();
  const { t } = useLanguage();
  const [chartType, setChartType] = useState('donut');

  // Calculate category totals and percentages for expenses only
  const categorySums = state.transactions
    .filter(tx => tx.amount < 0) // Only include expenses
    .reduce((acc, tx) => {
      const cat = tx.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + Math.abs(tx.amount); // Use absolute value for display
      return acc;
    }, {});

  const total = Object.values(categorySums).reduce((sum, amount) => sum + amount, 0);

  const chartData = Object.entries(categorySums).map(([category, amount]) => ({
    x: category,
    y: amount,
    percentage: ((amount / total) * 100).toFixed(1)
  }));

  const colorScale = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.error,
    theme.colors.success,
    theme.colors.warning,
    '#9333EA',
    '#2563EB',
    '#DC2626',
  ];

  if (chartData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={styles.noDataText}>
          {t('noExpenseData')}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.textSecondary }}>
          {t('addExpensesToSee')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
        {t('expenseBreakdown')}
      </Text>
      
      <Surface style={styles.chartContainer} elevation={2}>
        <Text variant="titleLarge" style={[styles.totalAmount, { color: theme.colors.error }]}>
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
          labels={() => ''}
          labelComponent={<VictoryLabel text={''} />}
          style={{
            data: {
              stroke: theme.colors.background,
              strokeWidth: 1,
            },
            labels: { display: 'none' }
          }}
        />

        <View style={styles.legendContainer}>
          <VictoryLegend
            x={10}
            y={0}
            orientation="horizontal"
            gutter={20}
            rowGutter={10}
            itemsPerRow={2}
            centerTitle
            style={{
              labels: { 
                fill: theme.colors.text,
                fontSize: 12,
              },
              parent: {
                width: '100%',
              }
            }}
            data={chartData.map((d, i) => ({
              name: `${d.x}: ${formatCurrency(d.y, selectedCurrency)} (${d.percentage}%)`,
              symbol: { fill: colorScale[i % colorScale.length] }
            }))}
          />
        </View>
      </Surface>

      <Surface style={styles.summaryContainer} elevation={2}>
        <Text variant="titleMedium" style={{ color: theme.colors.text }}>
          {t('summary')}
        </Text>
        {chartData.map((item, index) => (
          <View key={item.x} style={styles.summaryRow}>
            <View style={styles.categoryInfo}>
              <View 
                style={[
                  styles.colorIndicator, 
                  { backgroundColor: colorScale[index % colorScale.length] }
                ]} 
              />
              <Text variant="bodyMedium">{item.x}</Text>
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
              {formatCurrency(item.y, selectedCurrency)}
            </Text>
          </View>
        ))}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text variant="titleMedium">{t('total')}</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {formatCurrency(total, selectedCurrency)}
          </Text>
        </View>
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
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  segmentedButtons: {
    marginBottom: 16,
    width: '100%',
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 150,
    marginRight: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    flexShrink: 0,
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 16,
  },
  noDataText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  totalAmount: {
    textAlign: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
});
