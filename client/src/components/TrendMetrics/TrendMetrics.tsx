import React from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { Classes } from 'jss';

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(2)
  },
  title: {
    fontSize: 14
  },
  metric: {
    fontSize: 38,
    margin: "0.5em 0"
  }
});

interface props {
  classes: Classes;
  title: string;
  metric: number;
}

const NumberMetric = (props: props) => {
  const { classes, title, metric } = props;
  return (
    <section className={classes.root}>
      <h2 className={classes.title}>{title}</h2>
      <h3 className={classes.metric}>{metric}</h3>
    </section>
  )
}

export default withStyles(styles)(NumberMetric)