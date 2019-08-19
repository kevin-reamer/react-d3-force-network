import React, { Component } from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { Classes } from 'jss';
import * as d3 from "d3";

const styles = (theme: Theme) => createStyles({
  root: {
    display: "flex",
    position: "fixed",
    bottom: 0,
    fill: "none",
    pointerEvents: "none"
  },
  text: {
    color: theme.palette.grey[700]
  }
});

interface props {
  classes: Classes;
  data: any;
}

class D3GroupedBar extends Component<props> {
  state = {
    height: 150,
    width: window.innerWidth - 60,
    margin: {top: 20, right: 20, bottom: 70, left: 40}
  }

  svg: any;
  g: any;
  parseDate: any;
  x0: any;
  x1: any;
  y: any;
  xAxis: any;
  yAxis: any;

  componentDidMount() {
    this.chart(this.props.data)
  }

  componentWillReceiveProps(nextProps: props) {
    this.g.selectAll("*").remove();
    this.updateData(nextProps.data);
  }

  color = d3.scaleOrdinal()
    .range(["#D94D1A","#323E40"]);
  
  chart = (data: any) => {
    // Parse the date / time
    this.parseDate = d3.isoParse

    this.x0 = d3.scaleBand().rangeRound([0, this.state.width]).padding(0.1);
    this.x1 = d3.scaleBand();
    this.y = d3.scaleLinear().range([this.state.height, 0]);

    this.xAxis = d3.axisBottom(this.x0)
      .tickFormat(d3.timeFormat("%b %Y") as (domainValue: d3.AxisDomain, index: number) => string);

    this.yAxis = d3.axisLeft(this.y) 
      .ticks(10);

    this.svg
      .attr("width", this.state.width + this.state.margin.left + this.state.margin.right)
      .attr("height", this.state.height + this.state.margin.top + this.state.margin.bottom)
      .style("pointer-events", "none")
      .style("fill", "none")
    
    this.g = this.svg.append("g")
        .attr("transform", "translate(" + this.state.margin.left + "," + this.state.margin.top + ")")
        .style("pointer-events", "none")
        .style("fill", "none");

    this.updateData(data)
  }

  updateData = (data: any) => {
    data.forEach((d: any) => {
      d.date = this.parseDate(d.date);
    });

    const dates = data.map((d: any) => d.date);
    const categories = ["Fatalities", "Incidents"];

    this.x0.domain(dates);
    this.x1.domain(categories).rangeRound([0, this.x0.bandwidth()]);
  
    this.y.domain([0, d3.max(data, (d: any) => d3.max(d.values, (d: any) => d.value))]);

    categories.forEach((category: string, i: number) => {
      let valueline = d3.line()
        .x((d: any) => this.x0(d.date))
        .y((d: any) => this.y(d.emaValues[i]))
        .curve(d3.curveMonotoneX);

      this.g.append("path")
        .data([data])
        .style("fill", "none")
        .style("stroke", (d: any) => this.color(category))
        .attr("d", valueline);
    })

    this.g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.state.height + ")")
      .call(this.xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .style("user-select", "none")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );

    this.g.append("g")
      .attr("class", "y axis")
      .style('opacity','0')
      .call(this.yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("user-select", "none")
        .text("Value");

    this.g.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    const slice = this.g.selectAll(".slice")
      .data(data)
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", (d: any) => "translate(" + this.x0(d.date) + ",0)");

    slice.selectAll("rect")
      .data((d: any) => d.values)
      .enter().append("rect")
        .attr("width", this.x1.bandwidth())
        .attr("x", (d: any) => this.x1(d.type))
        .style("pointer-events", "auto")
        .style("fill", (d: any) => this.color(d.type))
        .attr("y", (d: any) => this.y(0))
        .attr("height", (d: any) => this.state.height - this.y(0))
        .on('mouseover', this.showTip)
        .on('mouseout', this.hideTip);

    slice.selectAll("rect")
      .transition()
      .delay((d: any) => {return Math.random()*1000;})
      .duration(1000)
      .attr("y", (d: any) => this.y(d.value))
      .attr("height", (d: any) => this.state.height - this.y(d.value));

    this.legend()

    slice.selectAll("text")
      .data((d: any) => d.values)
      .enter().append("text")
        .attr("class","label")
        .attr("x", (d: any) => d.type === "Fatalities" ? this.x0.bandwidth() / 4 : this.x0.bandwidth() / 1.3)
        .attr("y", (d: any) => this.y(d.value) - 11)
        .attr("dy", ".75em")
        .style("fill", (d: any) => this.color(d.type))
        .style("font-size", "10px")
        .style("text-anchor", "middle")
        .text((d: any) => d.value > 0 ? d.value : "");
      
  }

  showTip = (d: any) => {
    
  }

  hideTip = () => {

  }

  legend = () => {
    const legendRectSize = 10;
    const legendSpacing = 5
    const legend = this.g.selectAll('.legend')
      .data(this.color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d: any, i: number) => {
        const width = legendRectSize + legendSpacing + 60;
        const horz = (this.state.width / 2) + (i * width);
        const vert = this.state.height + 55;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', this.color)
      .style('stroke', this.color);
      
    legend.append('text')
      .attr('x', - legendRectSize + legendSpacing)
      .attr('y', legendRectSize - (legendSpacing / 4))
      .style('fill', "black")
      .style('text-anchor', "end")
      .style('font-size', "12px")
      .text((d: any) => d);
  }

  render() {
    const { classes, data } = this.props
    return (
      <div className={classes.root}>
        {
          data ? 
          <svg height={this.state.height} width={this.state.width} ref={handle => (this.svg = d3.select(handle))}></svg>
          :
          null
        }
      </div>
    )
  }
  
}

export default withStyles(styles)(D3GroupedBar);