import React, { Component, MouseEvent } from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { Classes } from 'jss';
const d3 = require("d3");

const styles = (theme: Theme) => createStyles({
  root: {
    display: "flex"
  },
  text: {
    color: theme.palette.grey[700]
  }
});

interface props {
  classes: Classes;
  data: any;
  height: number;
  width: number;
}

class D3ForceNetwork extends Component<props> {
  state = {
    simulation: undefined as any
  }

  svg: any;

  componentDidMount() {
    this.chart(this.props.data)
  }

  componentWillReceiveProps(nextProps: props) {
    d3.selectAll("svg > *").remove();
    this.chart(nextProps.data)
  }

  componentWillUnmount() {
    this.state.simulation.stop()
  }

  chart = (data: any) => {
    const links = data.links.map((d: any) => Object.create(d));
    const nodes = data.nodes.map((d: any) => Object.create(d));
    const scale = d3.scaleOrdinal(d3.schemeCategory10);

    this.state.simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id))
      .force("charge", d3.forceManyBody())
      .force("collision", d3.forceCollide((Math.random() * 10) + 40))
      .force("center", d3.forceCenter(this.props.width / 2, this.props.height / 2));

    this.svg
      .attr("viewBox", [0, 0, this.props.width, this.props.height]);

    const fade = (opacity: number) => {
      return (d: any) => {
        node.style('stroke-opacity', function(this: any, o: any) {
          const thisOpacity = (isConnected(d, o) && o.selected) ? 1 : (isConnected(d, o) || o.selected) ? 0.5 : opacity;
          this.setAttribute('fill-opacity', thisOpacity);
          return thisOpacity;
        });
  
        link.style('stroke-opacity', (o: any) => {
          return (o.source === d || o.target === d) && (o.source.selected && o.target.selected) ? 1 : (o.source === d || o.target === d) || (o.source.selected && o.target.selected) ? 0.5 : opacity
        });
  
      };
    }

    const selectNode = () => {
      return (d: any) => {
        node.style('stroke-opacity', function(this: any, o: any) {
          const thisOpacity = isConnected(d, o) ? 1 : o.selected ? 0.5 : 0.1;
          this.setAttribute('fill-opacity', thisOpacity);
          isConnected(d, o) || o.selected ? o.selected = true : o.selected = false;
          return thisOpacity;
        })
        
        link.style('stroke-opacity', (o: any) => {
          return (o.source === d || o.target === d) && (o.source.selected && o.target.selected) ? 1 : (o.source === d || o.target === d) || (o.source.selected && o.target.selected) ? 0.5 : 0.1
        });
      }
    }

    const releaseNode = (d: any) => {
      d.fx = null;
      d.fy = null;
      node.style('stroke-opacity', function(this: any, o: any) {
        isConnected(d, o) || !o.selected ? o.selected = false : o.selected = true;
        const thisOpacity = isConnected(d, o) ? 1 : o.selected ? 0.5 : 0.1;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      })

      link.style('stroke-opacity', (o: any) => {
        return (o.source === d || o.target === d) && (o.source.selected && o.target.selected) ? 1 : (o.source === d || o.target === d) || (o.source.selected && o.target.selected) ? 0.5 : 0.1
      });
    }

    const color = (type: string) => {
      switch(type) {
        case "associate of": return '#FF8838';
        case "financier of": return '#8B8E9E';
        case "participant in": return '#42C2FF';
        case "took place in": return '#CC4D21';
        case "lives in": return '#CC4D21'; 
      }
    }

    const link = this.svg.append("g")
        .attr("stroke-opacity", 0.6)
        .on('mouseout.fade', fade(1))
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke", (d: any) => color(d.type))
        .attr("stroke-width", (d: any) => Math.sqrt(d.value));
        
    link.append("title")
      .text((d: any) => `${d.source.id} ${d.type} ${d.target.id}: ${d.value}`);

    const node = this.svg.append("g")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(this.drag(this.state.simulation));

    node.append("circle")
      .attr("r", 25)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("fill", (d: any) => scale(d.type))
      .on('mouseover.fade', fade(0.1))
      .on('click', selectNode())
  	  .on('dblclick', (d: any) => releaseNode(d));

    node.append("title")
      .text((d: any) => `${d.id} (${d.type})`);

    node.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style('font-size', 12)
      .style('fill', '#000')
      .style('pointer-events', 'none')
      .text((d: any) => d.id );

    this.state.simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", function(d: any) {
          return "translate(" + d.x + "," + d.y + ")";
        })
    });

    let linkedByIndex: any = {};
    links.forEach((d: any) => {
      linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
    });

    const isConnected = (a: any, b: any) => {
      if (a !== undefined && b !== undefined) {
        return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
      }
      else {
        return false;
      }
    }

    return this.svg.node();
  }

  drag = (simulation: any) => {
    const dragstarted = (d: any) => {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    const dragged = (d: any) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    
    const dragended = (d: any) => {
      if (!d3.event.active) simulation.alphaTarget(0);
      //d.fx = null;
      //d.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  render() {
    const { classes, data, height, width } = this.props;
    return (
      <div className={classes.root}>
        {
          data ? 
          <svg height={height} width={width} ref={handle => (this.svg = d3.select(handle))}></svg>
          :
          null
        }
      </div>
    );
  }
}

export default withStyles(styles)(D3ForceNetwork);