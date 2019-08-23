import Node from "../models/Node";
import Metric from "../models/Metric";

export default class Metrics {
  private nodes: Node[];
  private metrics: Metric[];

  //initialize with passed in nodes and create list of metrics
  constructor(nodes: Node[], metrics: Metric[]) {
    this.nodes = nodes;
    this.metrics = metrics;
  }
  get getNodes() {
    return this.nodes;
  }
  get getMetrics() {
    return this.metrics;
  }
  
  calculateMetrics(addValues: (number | string)[], excludedTypes: string[]) {
    this.nodes.forEach((node: any) => {
      if (excludedTypes.indexOf(node.type) < 0) {
        for(let i = 0; i < this.metrics.length; i++) {
          let value = addValues[i];
          if (typeof value === "string") {
            this.metrics[i].value += node[value]
          }
          else if (typeof value === "number") {
            this.metrics[i].value += value
          }
        }
      }
    })
    return this;
  }

  reset() {
    this.metrics.forEach(metric => {
      metric.value = 0
    })
    return this;
  }
}