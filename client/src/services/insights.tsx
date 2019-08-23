import Metrics from "../classes/Metrics";
import Trends from "../classes/Trends";
import BarData from "../classes/BarData";

export const processMetrics = (metrics: any, nodeData: any, reset: boolean) => {
  let metricsProcessor = new Metrics(nodeData, metrics)
  if (reset) {
    metricsProcessor.reset()
  }
  
  return metricsProcessor.calculateMetrics([1, "fa", "in"], ["City", "Terrorist Group"]).getMetrics;
}

export const processTrends = (trends: any, data: any, reset: boolean, period: number) => {
  let trendsProcessor = new Trends(data, trends)
  if (reset) {
    trendsProcessor.reset()
  }

  trendsProcessor
    .calculateFrom("nodes")
      .excludeTypes(["City", "Terrorist Group"])
      .sumTrend(0, "fa")
      .sumTrend(1, 1)
      .setPeriod(period)
      .periodTrend(2, new Date("12/31/2009"), "type", "fa")
    .calculateFrom("links")
      .includeTypes(["target city"])
      .sumTrend(3, 1)
      .periodTrend(4, new Date("12/31/2009"), "target", "fa")
      .includeTypes(["perpetrator"])
      .sumTrend(5, 1)
      .periodTrend(6, new Date("12/31/2009"), "target", "fa");

  return trendsProcessor.getTrends;
}

export const processBarData = (nodeData: any) => {
  const barProcessor = new BarData(nodeData);

  barProcessor
    .rollup("Fatalities", "fa")
    .rollup("Incidents", 1)
    .pushBars("Fatalities")
    .fillEmptyDates()
    .sortData()
    .calculateEMA()

  return barProcessor.getData;
}