import React, { useContext } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ThemeContext } from "../config/ThemeContext";

const MoodChart = ({ data }) => {
  const screenWidth = Dimensions.get("window").width;
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground, borderColor: theme.primary },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>Mood Trends</Text>
      {data.values.length > 0 ? (
        <LineChart
          data={{
            labels: data.labels,
            datasets: [
              {
                data: data.values,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 46}
          height={240}
          chartConfig={{
            backgroundGradientFrom: theme.background,
            backgroundGradientTo: theme.background,
            color: (opacity = 1) => theme.primary,
            labelColor: (opacity = 1) => theme.text,
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: theme.primary,
            },
            propsForBackgroundLines: {
              stroke: theme.secondary,
              strokeDasharray: "4",
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={[styles.noDataText, { color: theme.text }]}>
          No mood data available.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  chart: {
    marginVertical: 20,
    borderRadius: 10,
  },
  noDataText: {
    fontSize: 16,
  },
});

export default MoodChart;