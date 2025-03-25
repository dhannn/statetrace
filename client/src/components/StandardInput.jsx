import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';

export default function StandardInput({ inputString, tapeHead }) {

    const svgRef = useRef();

    useEffect(() => {
        
        const width = inputString.length * 50, height = 50;

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("font", "12px Inter");

        svg.selectAll("*").remove();

        let str = Array.from(inputString);
        console.log(str);
        const squareSize = 50;
        const spacing = 0;

        const squares = svg.selectAll("g")
            .data(str)
            .enter()
            .append("g")
            .attr("transform", (d, i) => {
                const x = Math.floor(i) * (squareSize + spacing);
                const y = 0;
                return `translate(${x}, ${y})`;
        });
        
        
        squares.append("rect")
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("fill", (d, i) => tapeHead.includes(i)? '#708B75': '#FDFDFD')
            .attr("stroke", "#484349");

        squares.append("text")
            .attr("x", squareSize / 2)
            .attr("y", squareSize / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .text(d => d);

    }, [inputString, tapeHead])

    return <div>
        <h2 style={{'textAlign': 'center'}}>Input</h2>
        <svg ref={svgRef} width={500} height={50}/>
    </div>
}
