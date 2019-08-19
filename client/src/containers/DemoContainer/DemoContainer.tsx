import React, { Component, Fragment } from 'react';
import D3ForceNetwork from '../../components/D3ForceNetwork/D3ForceNetwork';
import D3GroupedBar from '../../components/D3GroupedBar/D3GroupedBar';
import { getNodes, getNodesBySearch } from '../../services/datastore';
import { processBarData, processMetrics, processTrends } from '../../services/insights';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterBar from '../../components/FilterBar/FilterBar';
import NumberMetric from '../../components/NumberMetric/NumberMetric';
import { withStyles, Theme, createStyles } from '@material-ui/core';

const styles = (theme: Theme) => createStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 150
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
      { title: "Deadliest Attack Type", value: "", metric: 0},
      { title: "Most Common Attack Type", value: "", metric: 0},
      { title: "Increasing Attack Type (4 years)", value: "", metric: 0},
      { title: "Most Targetted (4 years)", value: "", metric: 0},
      { title: "Increasing Threat Area (4 years)", value: "", metric: 0},
      { title: "Most Active Group (4 years)", value: "", metric: 0},
      { title: "Increasing Threat Group (4 years)", value: "", metric: 0},
    ]
  }

  componentDidMount() {
    getNodes().then((response: any) => {
      this.setState({
        data: response.data,
        metrics: processMetrics(this.state.metrics, response.data.nodes, false),
        trends: processTrends(this.state.trends, response.data, false),
        loaded: true
      })
    })
  }

  handleSearch = (search: string) => {
    getNodesBySearch(search).then((response: any) => {
      this.setState({
        data: response.data,
        metrics: processMetrics(this.state.metrics, response.data.nodes, true),
        trends: processTrends(this.state.trends, response.data, true),
        loaded: false
      }, () => {
        this.setState({
          loaded: true
        })
      })
    })
  }

  handleConnect = (search: string) => {
    getNodesBySearch(search).then((response: any) => {
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
          trends: processTrends(this.state.trends, response.data, false)
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

  handleFilter = (filter: {from: Date, to: Date, fatalities: number, injuries: number}) => {
    this.setState((state: { data: { nodes: Array<any>, links: Array<any> } }) => {
      //filter from and to date
      // if (filter.from.valueOf() !== filter.to.valueOf()) {
      //   const filteredNodes = state.data.nodes.filter(node => {
      //     let dateD = new Date(node.d)
      //     return (dateD > filter.from && dateD < filter.to) || node.type === "Terrorist Group" || node.type === "City"
      //   })
      //   const filteredLinks = state.data.links.filter(link => {
      //     let dateD = new Date(link.d)
      //     return (dateD > filter.from && dateD < filter.to)
      //   })
      //   return {
      //     subtractions: {
      //       nodes: filteredNodes,
      //       links: filteredLinks
      //     }
      //   }
      // }
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
  
  render() {
    const { classes } = this.props;
    return (
      <div>
        <SearchBar handleSearch={this.handleSearch} />
        <FilterBar handleFilter={this.handleFilter} />
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
            <D3GroupedBar data={processBarData(this.state.data.nodes)} />
          </Fragment>
          :
          null
        }
      </div>
    );
  }
}

export default withStyles(styles)(DemoContainer);