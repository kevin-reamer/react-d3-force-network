import React from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { Classes } from 'jss';

const styles = (theme: Theme) => createStyles({
  root: {
    textAlign: "right"
  },
  title: {
    fontSize: 12,
    margin: "0.5em 0 0 0",
    fontWeight: "normal"
  },
  subtitle: {
    fontSize: 12,
    fontStyle: "italic",
    margin: 0,
    fontWeight: "normal"
  },
  valueGroup: {
    fontSize: 12,
    margin: "0 0 0.75em 0",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  metric: {
    fontSize: 24,
    margin: "0.25em 0 0.25em 0.25em",
    color: "#D94D1A"
  }
});

interface props {
  classes: Classes;
  title: string;
  subtitle: string;
  metric: number;
  value: string;
}

const TrendMetric = (props: props) => {
  const { classes, title, subtitle, metric, value } = props;
  return (
    <section className={classes.root}>
      <h2 className={classes.title}>{title}</h2>
      <h3 className={classes.subtitle}>({subtitle})</h3>
      <div className={classes.valueGroup}>{value} <span className={classes.metric}>{metric}</span></div>
    </section>
  )
}

export default withStyles(styles)(TrendMetric)