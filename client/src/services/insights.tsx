import { dateRange } from './dates';
import * as d3 from "d3";
import { differenceInMonths } from 'date-fns'

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

export const processTrends = (trends: any, data: any, reset: boolean) => {
  if (reset) {
    trends = [
      { title: "Deadliest Attack Type", value: "", metric: 0},
      { title: "Most Common Attack Type", value: "", metric: 0},
      { title: "Increasing Attack Type (4 years)", value: "", metric: 0},
      { title: "Most Targetted Area (4 years)", value: "", metric: 0},
      { title: "Increasing Threat Area (4 years)", value: "", metric: 0},
      { title: "Most Active Group (4 years)", value: "", metric: 0},
      { title: "Increasing Threat Group (4 years)", value: "", metric: 0},
    ]
  }

  let typeDeadly: any[] = [];
  let typeCommon: any[] = [];
  let increaseTrendType: any[] = [];
  let mostTargettedArea: any[] = [];
  let increaseThreatArea: any[] = [];
  let mostActiveGroup: any[] = [];
  let increaseThreatGroup: any[] = [];

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
    }
  })
  data.links.forEach((link: any) => {
    if (link.type === "target city") {
      if (differenceInMonths(new Date("12/31/2009"), new Date(link.date)) <= 48) {
        //most targetted
        if (mostTargettedArea.find(n => n.value === link.target) === undefined) {
          mostTargettedArea.push({value: link.target, metric: 1});
        }
        else {
          mostTargettedArea.find(n => n.value === link.target).metric++;
        }
      }
    }
    else if (link.type === "perpetrator") {
      if (differenceInMonths(new Date("12/31/2009"), new Date(link.date)) <= 48) {
        //most active
        if (mostActiveGroup.find(n => n.value === link.target) === undefined) {
          mostActiveGroup.push({value: link.target, metric: 1});
        }
        else {
          mostActiveGroup.find(n => n.value === link.target).metric++;
        }
      }
    }
  })
  
  trends = getMetric(0, typeDeadly, trends);
  trends = getMetric(1, typeCommon, trends);
  trends = getMetric(3, mostTargettedArea, trends);
  trends = getMetric(5, mostActiveGroup, trends);

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

export const processBarData = (nodeData: any) => {
  const fatalities = d3.nest<any, number>()
    .key((d: any) => {
      let date = new Date(d.date);
      return `${date.getMonth()+1}/1/${date.getFullYear()}` 
    })
    .rollup((d: any) => { 
      return d3.sum(d, (g: any) => g.fa);
    }).entries(nodeData);

  const incidents = d3.nest<any, number>()
    .key((d: any) => {
      let date = new Date(d.date);
      return `${date.getMonth()+1}/1/${date.getFullYear()}` 
    })
    .rollup((d: any) => { 
      return d3.sum(d, (g: any) => 1);
    }).entries(nodeData);

  let data: any[] = [];
  
  fatalities.forEach((f: any) => {
    if (f.key !== "NaN/1/NaN") {
      const incident = incidents.find((i: any) => {
        return i.key === f.key
      })
      if (incident !== undefined && incident.value) {
        data.push({
          date: f.key,
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
  const allMonths = dateRange(data[0].date, data[data.length - 1].date, "month");
  if (allMonths !== undefined) {
    allMonths.forEach(month => {
      let exists = data.findIndex(d => new Date(d.date).getTime() === month.getTime()) > -1;
      if (!exists) {
        data.push({
          date: `${month.getMonth()+1}/1/${month.getFullYear()}`,
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
        })
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