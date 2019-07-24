import React, { Component } from 'react';
import D3ForceNetwork from '../../components/D3ForceNetwork/D3ForceNetwork';
import { getNodes, getNodesBySearch, upload } from '../../services/datastore';
import SearchBar from '../../components/SearchBar/SearchBar';
import FilterBar from '../../components/FilterBar/FilterBar';

class DemoContainer extends Component {
  state = {
    data: { 
      nodes: [],
      links: []
    },
    loaded: false
  }

  componentDidMount() {
    getNodes().then((response: any) => {
      this.setState({
        data: response.data,
        loaded: true
      })
    })
  }

  handleSearch = (search: string) => {
    getNodesBySearch(search).then((response: any) => {
      this.setState({
        data: response.data,
        loaded: true
      })
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
          data: {
            nodes: filteredNodes,
            links: filteredLinks
          }
        }
      }
      //filter fatalities
      if (filter.fatalities > 0) {
        const filteredNodes = state.data.nodes.filter(node => {
          return (node.fa >= filter.fatalities) || node.type === "Terrorist Group" || node.type === "City"
        })
        const filteredLinks = state.data.links.filter(link => {
          return link.value >= filter.fatalities
        })
        return {
          data: {
            nodes: filteredNodes,
            links: filteredLinks
          }
        }
      }
      //filter injuries
      if (filter.injuries > 0) {
        const filteredNodes = state.data.nodes.filter(node => {
          return (node.in >= filter.injuries) || node.type === "Terrorist Group" || node.type === "City"
        })
        const filteredLinks = state.data.links.filter(link => {
          return link.in >= filter.injuries
        })
        return {
          data: {
            nodes: filteredNodes,
            links: filteredLinks
          }
        }
      }
    })
  }
  
  render() {
    return (
      <div>
        <SearchBar handleSearch={this.handleSearch} />
        <FilterBar handleFilter={this.handleFilter} />
        {
          this.state.loaded ?
          <D3ForceNetwork height={700} width={1400} data={this.state.data} handleDoubleClick={this.handleSearch} />
          :
          null
        }
      </div>
    );
  }
}

export default DemoContainer;