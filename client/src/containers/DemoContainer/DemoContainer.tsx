import React, { Component } from 'react';
import D3ForceNetwork from '../../components/D3ForceNetwork/D3ForceNetwork';

class DemoContainer extends Component {
  state = {
    data: { 
      nodes: {},
      links: {}
    },
    change: false
  }

  render() {
    return (
      <div>
        <D3ForceNetwork height={900} width={1200} data={this.state.data} />
      </div>
    );
  }
}

export default DemoContainer;