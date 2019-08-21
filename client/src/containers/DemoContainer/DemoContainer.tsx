import React, { Component, Fragment } from 'react';
import D3ForceNetwork from '../../components/D3ForceNetwork/D3ForceNetwork';
import D3GroupedBar from '../../components/D3GroupedBar/D3GroupedBar';
import { getNodesBySearch } from '../../services/datastore';
import { processBarData, processMetrics, processTrends } from '../../services/insights';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterBar from '../../components/FilterBar/FilterBar';
import NumberMetric from '../../components/NumberMetric/NumberMetric';
import TrendMetric from '../../components/TrendMetric/TrendMetric';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { lastDayOfMonth } from 'date-fns';

const styles = (theme: Theme) => createStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 150
  },
  trendContainer: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 60,
    right: 20
  }
});

class DemoContainer extends Component<any> {
  state = {
    data: { 
      nodes: [],
      links: []
    },
    additions: {
      nodes: [],
      links: []
    },
    subtractions: {
      nodes: [],
      links: []
    },
    loaded: false,
    metrics: [
      { title: "Incidents", value: 0},
      { title: "Fatalities", value: 0},
      { title: "Injuries", value: 0}
    ],
    trends: [
      { title: "Deadliest Attack Type", subtitle: "fatalities", value: "", metric: 0},
      { title: "Most Common Attack Type", subtitle: "attacks", value: "", metric: 0},
      { title: "Increasing Attack Type", subtitle: "attacks, 4 years", value: "", metric: 0},
      { title: "Most Targetted", subtitle: "attacks, 4 years", value: "", metric: 0},
      { title: "Increasing Threat Area", subtitle: "fatalities, 4 years", value: "", metric: 0},
      { title: "Most Active Group", subtitle: "attacks, 4 years", value: "", metric: 0},
      { title: "Increasing Threat Group", subtitle: "fatalities, 4 years", value: "", metric: 0},
    ],
    to: new Date("12/31/2009"),
    from: new Date("02/09/1968"),
    fatalities: 0,
    injuries: 0
  }

  componentDidMount() {
    getNodesBySearch("Tikrit, Iraq", {
      to: this.state.to,
      from: this.state.from,
      fatalities: this.state.fatalities,
      injuries: this.state.injuries
    }).then((response: any) => {
      this.setState({
        data: response.data,
        metrics: processMetrics(this.state.metrics, response.data.nodes, false),
        trends: processTrends(this.state.trends, response.data, false, "month"),
        loaded: true
      })
    })
  }

  handleSearch = (search: string) => {
    getNodesBySearch(search, { 
      to: this.state.to, 
      from: this.state.from, 
      fatalities: this.state.fatalities, 
      injuries: this.state.injuries
    }).then((response: any) => {
      this.setState({
        data: response.data,
        metrics: processMetrics(this.state.metrics, response.data.nodes, true),
        trends: processTrends(this.state.trends, response.data, true, "month"),
        loaded: false
      }, () => {
        this.setState({
          loaded: true
        })
      })
    })
  }

  handleConnect = (search: string) => {
    getNodesBySearch(search, { 
      to: this.state.to, 
      from: this.state.from, 
      fatalities: this.state.fatalities, 
      injuries: this.state.injuries
    }).then((response: any) => {
      this.setState((state: any) => {
        const newNodes = this.diffNodes(response.data.nodes, state.data.nodes)
        const newLinks = this.diffLinks(response.data.links, state.data.links)

        const mergeNodes = this.mergeArrays(state.data.nodes, response.data.nodes)
        const mergeLinks = this.mergeArrays(state.data.links, response.data.links)

        return {
          data: {
            nodes: mergeNodes,
            links: mergeLinks
          },
          additions: {
            nodes: newNodes,
            links: newLinks
          },
          metrics: processMetrics(this.state.metrics, response.data.nodes, false),
          trends: processTrends(this.state.trends, response.data, false, "month")
        }
      })
    })
  }

  mergeArrays = (...arrays: any[]) => {
    let jointArray: any[] = []

    arrays.forEach(array => {
      jointArray = [...jointArray, ...array]
    })
    const uniqueArray = jointArray.filter((item,index) => jointArray.indexOf(item) === index)
    return uniqueArray
  }

  diffNodes = (baseArray: any[], diffArray: any[]) => {
    let difference = baseArray.filter(b => !diffArray.find(d => b.id === d.id));
    return difference;
  }

  diffLinks = (baseArray: any[], diffArray: any[]) => {
    let difference = baseArray.filter(b => !diffArray.find(d => b.source === d.source && b.target === d.target));
    return difference;
  }

  handleChange = (type: string) => (event: any) => {
    let value = event;
    if (event.target) {
      value = event.target.value
    }
    this.setState({
      [type]: value
    })
  }

  handleFilter = (filter: {from: Date, to: Date, fatalities: number, injuries: number}) => {
    this.setState((state: { data: { nodes: Array<any>, links: Array<any> } }) => {
      //filter from and to date
      if (filter.from.valueOf() !== filter.to.valueOf()) {
        const filteredNodes = state.data.nodes.filter(node => {
          let dateD = new Date(node.d)
          return (dateD > filter.from && dateD < filter.to) || node.type === "Terrorist Group" || node.type === "City"
        })
        const filteredLinks = state.data.links.filter(link => {
          let dateD = new Date(link.d)
          return (dateD > filter.from && dateD < filter.to)
        })
        return {
          subtractions: {
            nodes: filteredNodes,
            links: filteredLinks
          }
        }
      }
      //filter fatalities
      if (filter.fatalities > 0) {
        const filteredNodes = state.data.nodes.filter(node => {
          return node.fa < filter.fatalities
        })
        const filteredLinks = state.data.links.filter(link => {
          return link.fa < filter.fatalities
        })

        return {
          subtractions: {
            nodes: filteredNodes,
            links: filteredLinks
          }
        }
      }
      //filter injuries
      if (filter.injuries > 0) {
        const filteredNodes = state.data.nodes.filter(node => {
          return node.in < filter.injuries
        })
        const filteredLinks = state.data.links.filter(link => {
          return link.in < filter.injuries
        })
        return {
          subtractions: {
            nodes: filteredNodes,
            links: filteredLinks
          }
        }
      }
    })
  }

  handleClickBar = (date: Date) => {
    this.setState({
      from: new Date(`${date.getMonth()+1}/01/${date.getFullYear()}`),
      to: lastDayOfMonth(date)
    })
    this.handleFilter({
      to: this.state.to,
      from: this.state.from,
      fatalities: this.state.fatalities,
      injuries: this.state.injuries
    })
  }
  
  render() {
    const { classes } = this.props;
    return (
      <div>
        <SearchBar handleSearch={this.handleSearch} />
        <FilterBar 
          handleFilter={this.handleFilter} 
          handleChange={this.handleChange}
          to={this.state.to} from={this.state.from} 
          fatalities={this.state.fatalities} injuries={this.state.injuries}
        />
        {
          this.state.loaded ?
          <Fragment>
            <D3ForceNetwork data={this.state.data} additions={this.state.additions} subtractions={this.state.subtractions} handleDoubleClick={this.handleConnect} />
            <section className={classes.container}>
              {
                this.state.metrics.map((metric: any, index: number) => (
                  <NumberMetric title={metric.title} metric={metric.value} key={index} />
                ))
              }
            </section>
            <section className={classes.trendContainer}>
              {
                this.state.trends.map((trend: any, index: number) => (
                  <TrendMetric title={trend.title} subtitle={trend.subtitle} metric={trend.metric} value={trend.value} key={index} />
                ))
              }
            </section>
            <D3GroupedBar data={processBarData(this.state.data.nodes)} handleClickBar={this.handleClickBar} />
          </Fragment>
          :
          null
        }
      </div>
    );
  }
}

export default withStyles(styles)(DemoContainer);