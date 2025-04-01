import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';

export default function QueueComponent({ name, content }) {

    const svgRef = useRef();

    useEffect(() => {
        if (content !== undefined) {
            const width = content.length * 50, height = 50;
            
            const svg = d3.select(svgRef.current)
                .attr("viewBox", [0, 0, width, height])
                .style("font", "12px Inter");

            svg.selectAll("*").remove();

            const squareSize = 50;
            const squares = svg.selectAll("g")
                .data(content)
                .enter()
                .append("g")
                .attr("transform", (d, i) => {
                    const y = 0;
                    const x = Math.floor(i) * squareSize;
                    return `translate(${x}, ${y})`;
            });    
            
            squares.append("rect")
                .attr("width", squareSize)
                .attr("height", squareSize)
                .attr("fill", '#FDFDFD')
                .attr("stroke", "#484349");

            squares.append("text")
                .attr("x", squareSize / 2)
                .attr("y", squareSize / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("fill", "black")
                .text(d => d);
                
        }
    }, [content])

    return <div style={{overflow: 'scroll', 'textAlign': 'center'}}>
        <h3>Queue {name}</h3>
        <svg ref={svgRef} width={400} height={50}/>
    </div>; 
}
