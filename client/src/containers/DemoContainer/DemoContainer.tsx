import React, { Component } from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Classes } from 'jss';
import D3ForceNetwork from '../../components/D3ForceNetwork/D3ForceNetwork';
import TEST_DATA from '../../data/data';

const styles = (theme: Theme) => createStyles({
  root: {

  }
});

interface props {
  classes: Classes;
}

class DemoContainer extends Component<props> {
  state = {
    data: TEST_DATA,
    change: false
  }

  change = () => {
    this.setState((state: any) => {
      return !state.change ?
      { 
        data: {
          nodes: [
            {id: "Myriel", group: 1},
            {id: "Napoleon", group: 1},
            {id: "Mlle.Baptistine", group: 1}
          ],
          links: [
            {source: "Napoleon", target: "Myriel", value: 1},
            {source: "Mlle.Baptistine", target: "Myriel", value: 8}
          ]
        },
        change: true
      }
      :
      {
        data: TEST_DATA,
        change: false
      }
    })  
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <D3ForceNetwork height={900} width={1200} data={this.state.data} change={this.change} />
      </div>
    );
  }
}

export default withStyles(styles)(DemoContainer);