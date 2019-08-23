import { dateRange } from "../services/dates";
import Node from "../models/Node";
import Bar from "../models/Bar";
import RollupValues from "../models/RollupValues";
import { startOfQuarter } from "date-fns/esm";
import { startOfYear } from "date-fns";
import * as d3 from "d3";
import RollupValue from "../models/RollupValue";
import TypeValue from "../models/TypeValue";

export default class BarData {
  private nodes: Node[];
  private values: RollupValues;
  private data: Bar[];
  private allMonths: Date[] | undefined;
  private allQuarters: Date[] | undefined;
  private allYears: Date[] | undefined;
  private interval: "month" | "quarter" | "year";

  constructor(nodes: Node[]) {
    //sort the nodes in ascending order by date
    this.nodes = nodes.sort((a: any, b: any) => {
      return new Date(a.date).valueOf() - new Date(b.date).valueOf()
    });
    this.data = [];
    this.values = {};

    //set all months
    this.allMonths = dateRange(this.nodes[0].date, this.nodes[this.nodes.length - 1].date, "month")

    //determine type
    if (this.allMonths !== undefined && this.allMonths.length > 60) {
      this.interval = "quarter"
      this.allQuarters = dateRange(this.nodes[0].date, this.nodes[this.nodes.length - 1].date, "quarter");
      if (this.allQuarters !== undefined && this.allQuarters.length > 60) {
        this.interval = "year"
        this.allYears = dateRange(this.nodes[0].date, this.nodes[this.nodes.length - 1].date, "year");
      }
    }
    else {
      this.interval = "month"
    }
  }

  get getNodes() {
    return this.nodes;
  }
  
  get getData() {
    return this.data;
  }

  rollup(label: string, addValue: string | number) {
    //TODO: remove d3 dependency
    this.values[label] = d3.nest<any, number>()
      .key((d: Node) => {
        let date = new Date(d.date);
        if (this.interval === "quarter") { date = startOfQuarter(date) }
        else if (this.interval === "year") { date = startOfYear(date) }
        return `${date.getMonth()+1}/1/${date.getFullYear()}` 
      })
      .rollup((d: any) => {
        console.log(d)
        return d3.sum(d, (g: any) => {
          switch(typeof addValue) {
            case "string": return g[addValue]
            case "number": return addValue;
          }
        });
      }).entries(this.nodes);
    return this;
  }

  pushBars(primaryKey: string) {
    let secondaryKeys = Object.keys(this.values);
    if (secondaryKeys.length > 0) {
      secondaryKeys.slice(1, secondaryKeys.length - 1)
    }
    this.values[primaryKey].forEach((f: any) => {
      if (f.key !== "NaN/1/NaN") {
        let values: TypeValue[] = [];
        secondaryKeys.forEach(key => {
          let value = this.values[key].find((i: RollupValue) => {
            return i.key === f.key
          })
          if (value !== undefined) {
            values.push({
              type: key,
              value: value.value as number
            });
          }
        })
        this.data.push({
          date: f.key,
          type: this.interval,
          values: [
            ...[{
              type: "Fatalities",
              value: f.value
            }],
            ...values
          ],
          emaValues: []
        })
      }
    })
    return this;
  }

  fillEmptyDates() {
    if (this.allMonths !== undefined && this.interval === "month") {
      this.allMonths.forEach(month => {
        this.findAndFill(month, "month", month.getTime())
      })
    }
    else if (this.allQuarters !== undefined && this.interval === "quarter") {
      this.allQuarters.forEach(quarter => {
        this.findAndFill(quarter, "quarter", startOfQuarter(quarter).getTime())
      })
    }
    else if (this.allYears !== undefined && this.interval === "year") {
      this.allYears.forEach(year => {
        this.findAndFill(year, "year", startOfYear(year).getTime())
      })
    }
    return this;
  }

  sortData() {
    this.data.sort((a: any, b: any) => {
      return new Date(a.date).valueOf() - new Date(b.date).valueOf()
    })
    return this;
  }

  private findAndFill(date: Date, type: string, comparisonTime: number) {
    const exists = this.data.findIndex(d => new Date(d.date).getTime() === comparisonTime) > -1;
    if (!exists) {
      this.data.push({
        date: `${date.getMonth()+1}/1/${date.getFullYear()}`,
        type: type,
        values: [
          {
            type: "Fatalities",
            value: 0
          },
          {
            type: "Incidents",
            value: 0
          }
        ],
        emaValues: [0, 0]
      })
    }
  }

  calculateEMA() {
    let fatalitiesEMAy = 0;
    let fatalitiesEMAt = 0;
    let incidentsEMAy = 0;
    let incidentsEMAt = 0;
    this.data.forEach((d) => {
      const fatalities = d.values[0].value
      const incidents = d.values[1].value
      const timePeriod = 2
      const smoothing = 2
      fatalitiesEMAy = fatalitiesEMAt
      fatalitiesEMAt = (fatalities * (smoothing / (1 + timePeriod)) + fatalitiesEMAy * (1 - (smoothing / (1 + timePeriod))))
      incidentsEMAy = incidentsEMAt
      incidentsEMAt = (incidents * (smoothing / (1 + timePeriod)) + incidentsEMAy * (1 - (smoothing / (1 + timePeriod))))
      d.emaValues = [ fatalitiesEMAt, incidentsEMAt ]
    })
    return this;
  }
}