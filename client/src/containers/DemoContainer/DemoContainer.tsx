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
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <D3ForceNetwork height={900} width={1200} data={TEST_DATA} />
      </div>
    );
  }
}

export default withStyles(styles)(DemoContainer);