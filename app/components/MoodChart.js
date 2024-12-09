import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const MoodChart = ({ data }) => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Trends</Text>
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
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#f5f5f5",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#f5f5f5",
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#ffa726" },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>No mood data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
  },
});

export default MoodChart;