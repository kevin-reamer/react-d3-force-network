import { dateRange } from './dates';
import * as d3 from "d3";
import { differenceInMonths, getQuarter, startOfQuarter, startOfYear } from 'date-fns'

export const processMetrics = (metrics: any, nodeData: any, reset: boolean) => {
  if (reset) {
    metrics = [
      { title: "Incidents", value: 0},
      { title: "Fatalities", value: 0},
      { title: "Injuries", value: 0}
    ]
  }
  
  nodeData.forEach((node: any) => {
    if (node.type !== "City" && node.type !== "Terrorist Group") {
      metrics[0].value++;
      metrics[1].value += node.fa;
      metrics[2].value += node.in;
    }
  })
  
  return metrics;
}

export const processTrends = (trends: any, data: any, reset: boolean, type: string) => {
  if (reset) {
    trends = [
      { title: "Deadliest Attack Type", subtitle: "fatalities", value: "", metric: 0},
      { title: "Most Common Attack Type", subtitle: "attacks", value: "", metric: 0},
      { title: "Increasing Attack Type", subtitle: "attacks, 4 years", value: "", metric: 0},
      { title: "Most Targetted", subtitle: "attacks, 4 years", value: "", metric: 0},
      { title: "Increasing Threat Area", subtitle: "fatalities, 4 years", value: "", metric: 0},
      { title: "Most Active Group", subtitle: "attacks, 4 years", value: "", metric: 0},
      { title: "Increasing Threat Group", subtitle: "fatalities, 4 years", value: "", metric: 0},
    ]
  }

  let typeDeadly: any[] = [];
  let typeCommon: any[] = [];
  let increaseTrendType: any[] = [];
  let mostTargettedArea: any[] = [];
  let increaseThreatArea: any[] = [];
  let mostActiveGroup: any[] = [];
  let increaseThreatGroup: any[] = [];

  let thisPeriodGroups: any[] = [];
  let lastPeriodGroups: any[] = [];
  let thisPeriodCities: any[] = [];
  let lastPeriodCities: any[] = [];
  let thisPeriodAttacks: any[] = [];
  let lastPeriodAttacks: any[] = [];

  const period = 48;

  data.nodes.forEach((node: any) => {
    if (node.type !== "City" && node.type !== "Terrorist Group") {
      //deadly attacks
      if (typeDeadly.find(n => n.value === node.type) === undefined) {
        typeDeadly.push({value: node.type, metric: node.fa});
      }
      else {
        typeDeadly.find(n => n.value === node.type).metric += node.fa;
      }
      //common attacks
      if (typeCommon.find(n => n.value === node.type) === undefined) {
        typeCommon.push({value: node.type, metric: 1});
      }
      else {
        typeCommon.find(n => n.value === node.type).metric++;
      }

      const periodDifference = differenceInMonths(new Date("12/31/2009"), new Date(node.date))
      if (periodDifference <= period) {
        thisPeriodAttacks.push(node);
      }
      else if (periodDifference >= period && periodDifference <= period * 2) {
        lastPeriodAttacks.push(node);
      }
    }
  })
  data.links.forEach((link: any) => {
    const periodDifference = differenceInMonths(new Date("12/31/2009"), new Date(link.date))
    if (link.type === "target city") {
      if (periodDifference <= period) {
        thisPeriodCities.push(link)
        //most targetted
        if (mostTargettedArea.find(n => n.value === link.target) === undefined) {
          mostTargettedArea.push({value: link.target, metric: 1});
        }
        else {
          mostTargettedArea.find(n => n.value === link.target).metric++;
        }
      }
      else if (periodDifference >= period && periodDifference <= period * 2) {
        lastPeriodCities.push(link)
      }
    }
    else if (link.type === "perpetrator") {
      if (periodDifference <= period) {
        thisPeriodGroups.push(link);
        //most active
        if (mostActiveGroup.find(n => n.value === link.target) === undefined) {
          mostActiveGroup.push({value: link.target, metric: 1});
        }
        else {
          mostActiveGroup.find(n => n.value === link.target).metric++;
        }
      }
      else if (periodDifference >= period && periodDifference <= period * 2) {
        lastPeriodGroups.push(link)
      }
    }
  })

  const lastPeriodThreatGroups = groupByProperty(lastPeriodGroups, "target")
  const thisPeriodThreatGroups = groupByProperty(thisPeriodGroups, "target")
  for (let property in thisPeriodThreatGroups) {
    increaseThreatGroup.push({
      value: property, 
      metric: calcChange(
        sumProperty(thisPeriodThreatGroups[property], "fa"), 
        sumProperty(lastPeriodThreatGroups[property], "fa")
      )
    });
  }

  const lastPeriodThreatArea = groupByProperty(lastPeriodCities, "target")
  const thisPeriodThreatArea = groupByProperty(thisPeriodCities, "target")
  for (let property in thisPeriodThreatArea) {
    increaseThreatArea.push({
      value: property, 
      metric: calcChange(
        sumProperty(thisPeriodThreatArea[property], "fa"), 
        sumProperty(lastPeriodThreatArea[property], "fa")
      )
    });
  }

  const lastPeriodAttacksType = groupByProperty(lastPeriodAttacks, "type")
  const thisPeriodAttacksType = groupByProperty(thisPeriodAttacks, "type")
  for (let property in thisPeriodAttacksType) {
    increaseTrendType.push({
      value: property, 
      metric: calcChange(
        sumProperty(thisPeriodAttacksType[property], "fa"), 
        sumProperty(lastPeriodAttacksType[property], "fa")
      )
    });
  }

  trends = getMetric(0, typeDeadly, trends);
  trends = getMetric(1, typeCommon, trends);
  trends = getMetric(2, increaseTrendType, trends);
  trends = getMetric(3, mostTargettedArea, trends);
  trends = getMetric(4, increaseThreatArea, trends);
  trends = getMetric(5, mostActiveGroup, trends);
  trends = getMetric(6, increaseThreatGroup, trends);

  console.log(trends)

  return trends;
}

const getMetric = (index: number, values: any[], trends: any[]) => {
  const sorted = values.sort((a, b) => {
    return b.metric - a.metric;
  })[0];
  if (sorted) {
    trends[index].value = sorted.value;
    trends[index].metric = sorted.metric;
  }
  return trends;
}

const sumProperty = (arr: any[], property: string) => {
  let sum = 0;
  if (arr !== undefined) {
    arr.forEach(item => {
      sum += item[property];
    })
  }
  return sum;
}

const groupData = (data: any[], type: string) => {
  return d3.nest<any, number>()
    .key((d: any) => {
      let date = new Date(d.date);
      if (type === "quarter") { date = startOfQuarter(date) }
      return `${date.getMonth()+1}/1/${date.getFullYear()}` 
    })
    .rollup((d: any) => { 
      return d3.sum(d, (g: any) => g.fa);
    }).entries(data);
}

var groupByProperty = function(arr: any[], key: string) {
  return arr.reduce(function(rv: any, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const calcChange = (thisPeriod: number, lastPeriod: number) => {
  const change = thisPeriod - lastPeriod;
  return change;
}

export const processBarData = (nodeData: any) => {
  nodeData.sort((a: any, b: any) => {
    return new Date(a.date).valueOf() - new Date(b.date).valueOf()
  })
  const allMonths = dateRange(nodeData[0].date, nodeData[nodeData.length - 1].date, "month");
  let allQuarters: Date[] | undefined = undefined;
  let allYears: Date[] | undefined = undefined;

  let fatalities: any[] = [];
  let incidents: any[] = [];
  let data: any[] = [];
  let type: string = "";

  if (allMonths !== undefined && allMonths.length > 60) {
    type = "quarter"
    allQuarters = dateRange(nodeData[0].date, nodeData[nodeData.length - 1].date, "quarter");
    if (allQuarters !== undefined && allQuarters.length > 60) {
      type = "year"
      allYears = dateRange(nodeData[0].date, nodeData[nodeData.length - 1].date, "year");
    }
  }
  else {
    type = "month"
  }

  fatalities = d3.nest<any, number>()
    .key((d: any) => {
      let date = new Date(d.date);
      if (type === "quarter") { date = startOfQuarter(date) }
      else if (type === "year") { date = startOfYear(date) }
      return `${date.getMonth()+1}/1/${date.getFullYear()}` 
    })
    .rollup((d: any) => { 
      return d3.sum(d, (g: any) => g.fa);
    }).entries(nodeData);

  incidents = d3.nest<any, number>()
    .key((d: any) => {
      let date = new Date(d.date);
      if (type === "quarter") { date = startOfQuarter(date) }
      else if (type === "year") { date = startOfYear(date) }
      return `${date.getMonth()+1}/1/${date.getFullYear()}` 
    })
    .rollup((d: any) => { 
      return d3.sum(d, (g: any) => 1);
    }).entries(nodeData);
  
  fatalities.forEach((f: any) => {
    if (f.key !== "NaN/1/NaN") {
      const incident = incidents.find((i: any) => {
        return i.key === f.key
      })
      if (incident !== undefined && incident.value) {
        data.push({
          date: f.key,
          type: type,
          values: [
            {
              type: "Fatalities",
              value: f.value
            },
            {
              type: "Incidents",
              value: incident.value as number
            }
          ]
        })
      }
    }
  })

  //add in missing months
  if (allMonths !== undefined && type === "month") {
    allMonths.forEach(month => {
      const exists = data.findIndex(d => new Date(d.date).getTime() === month.getTime()) > -1;
      if (!exists) {
        data.push(addEmpty(month, "month"))
      }
    })
  }
  else if (allQuarters !== undefined && type === "quarter") {
    allQuarters.forEach(quarter => {
      const exists = data.findIndex(d => new Date(d.date).getTime() === startOfQuarter(quarter).getTime()) > -1;
      if (!exists) {
        data.push(addEmpty(quarter, "quarter"))
      }
    })
  }
  else if (allYears !== undefined && type === "year") {
    allYears.forEach(year => {
      const exists = data.findIndex(d => new Date(d.date).getTime() === startOfYear(year).getTime()) > -1;
      if (!exists) {
        data.push(addEmpty(year, "year"))
      }
    })
  }

  data.sort((a: any, b: any) => {
    return new Date(a.date).valueOf() - new Date(b.date).valueOf()
  })

  let fatalitiesEMAy = 0;
  let fatalitiesEMAt = 0;
  let incidentsEMAy = 0;
  let incidentsEMAt = 0;
  data.forEach((d) => {
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

  return data;
}

const addEmpty = (date: any, type: string) => {
  return {
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
    ]
  }
}