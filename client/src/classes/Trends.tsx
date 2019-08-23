import NetworkData from "../models/NetworkData";
import Trend from "../models/Trend";
import Node from "../models/Node";
import Link from "../models/Link";
import { differenceInMonths } from "date-fns/esm";

interface TrendMetric {
  value: string;
  metric: number;
}

export default class Metrics {
  private data: NetworkData;
  private trends: Trend[];
  private period: number;
  private calcProperty: "nodes" | "links";
  private excludedTypes: string[];
  private includedTypes: string[];

  //initialize with passed in nodes and trends
  constructor(data: NetworkData, trends: Trend[]) {
    this.data = data;
    this.trends = trends;
    this.period = 0;
    this.calcProperty = "nodes";
    this.excludedTypes = [];
    this.includedTypes = [];
  }
  get getNodes() {
    return this.data.nodes;
  }
  get getLinks() {
    return this.data.links;
  }
  get getData() {
    return this.data;
  }
  get getTrends() {
    return this.trends;
  }
  get getPeriod() {
    return this.period;
  }

  setPeriod(period: number) {
    this.period = period;
    return this;
  }
  
  calculateFrom(property: "nodes" | "links") {
    this.calcProperty = property;
    return this;
  }

  excludeTypes(types: string[]) {
    this.excludedTypes = types;
    this.includedTypes = [];
    return this;
  }

  includeTypes(types: string[]) {
    this.includedTypes = types;
    this.excludedTypes = [];
    return this;
  }

  sumTrend(index: number, addValue: number | string) {
    let tempArr: TrendMetric[] = [];
    let prop: string = "";
    switch (this.calcProperty) {
      case "nodes": prop = "type"; break;
      case "links": prop = "target"; break;
    }
    for (let i = 0; i < this.data[this.calcProperty].length; i++) {
      const item = this.data[this.calcProperty][i];
      let value: string = item[prop] as string;
      if ((this.excludedTypes.length > 0 && this.excludedTypes.indexOf(item.type) < 0) ||
        (this.includedTypes.length > 0 && this.includedTypes.indexOf(item.type) >= 0)) {
        let foundItem = tempArr.find(n => n.value === value)
        let valueAdded = 0;
        switch (typeof addValue) {
          case "string": valueAdded = item[addValue] as number; break;
          case "number": valueAdded = addValue; break;
        }
        if (foundItem === undefined) {
          tempArr.push({value: value, metric: valueAdded});
        }
        else {
          foundItem.metric += valueAdded;
        }
      }
    }

    this.getMetric(index, tempArr);
    return this;
  }

  periodTrend(index: number, endDate: Date, groupProp: string, addProp: string) {
    let thisPeriod: (Node | Link)[] = [];
    let lastPeriod: (Node | Link)[] = [];
    let tempArr: TrendMetric[] = [];
    for (let i = 0; i < this.data[this.calcProperty].length; i++) {
      const item = this.data[this.calcProperty][i];
      const value = item.type;
      if ((this.excludeTypes.length > 0 && this.excludedTypes.indexOf(value) < 0) ||
        (this.includedTypes.length > 0 && this.includedTypes.indexOf(value) >= 0)) {
        const periodDifference = differenceInMonths(endDate, new Date(item.date))
        if (periodDifference <= this.period) {
          thisPeriod.push(item);
        }
        else if (periodDifference >= this.period && periodDifference <= this.period * 2) {
          lastPeriod.push(item);
        }
      }

      const lastPeriodGroup = this.groupByProperty(lastPeriod, groupProp)
      const thisPeriodGroup = this.groupByProperty(thisPeriod, groupProp)
      for (let property in thisPeriodGroup) {
        tempArr.push({
          value: property, 
          metric: this.sumProperty(thisPeriodGroup[property], addProp) - this.sumProperty(lastPeriodGroup[property], addProp)
        });
      }
    }

    this.getMetric(index, tempArr)
    return this;
  }

  private sumProperty = (arr: any[], property: string) => {
    let sum = 0;
    if (arr !== undefined) {
      arr.forEach(item => {
        sum += item[property];
      })
    }
    return sum;
  }

  private groupByProperty = (arr: any[], key: string) => {
    return arr.reduce((rv: any, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  private getMetric = (index: number, values: any[]) => {
    const sorted = values.sort((a, b) => {
      return b.metric - a.metric;
    })[0];
    if (sorted && sorted.metric >= 0) {
      this.trends[index].value = sorted.value;
      this.trends[index].metric = sorted.metric;
    }
    else {
      this.trends[index].value = "None"
      this.trends[index].metric = 0
    }
  }

  reset() {
    this.trends.forEach(trend => {
      trend.metric = 0
    })
    return this;
  }
}