import React, { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

export default function TapeComponent({ name, content }) {

    const [ width, setWidth ] = useState(0)
    const svgRef = useRef();

    useEffect(() => {
        if (!content) return;

        const { head, tape } = content;

        // Convert tape object to a sorted array of indices
        const tapeIndices = Object.keys(tape).map(Number);
        const minIndex = Math.min(...tapeIndices, head - 4); // Ensure head has neighbors
        const maxIndex = Math.max(...tapeIndices, head + 4); // Show some context

        // Generate the displayed tape
        let displayedTape = [];
        for (let i = minIndex; i <= maxIndex; i++) {
            displayedTape.push({ index: i, value: tape[i] || '#' });
        }

        const squareSize = 50, spacing = 0;
        const width = displayedTape.length * (squareSize + spacing), height = 50;
        setWidth(width)

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("font", "12px Inter");

        svg.selectAll("*").remove();

        const squares = svg.selectAll("g")
            .data(displayedTape)
            .enter()
            .append("g")
            .attr("transform", (d, i) => {
                const x = i * (squareSize + spacing);
                return `translate(${x}, 0)`;
            });

        squares.append("rect")
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("fill", d => (d.index === head ? "#708B75" : "#FDFDFD"))
            .attr("stroke", "#484349");

        squares.append("text")
            .attr("x", squareSize / 2)
            .attr("y", squareSize / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "black")
            .text(d => d.value);

    }, [content]);

    return <div style={{overflow: 'scroll'}}>
        <h2 style={{'textAlign': 'center'}}>Tape {name}</h2>
        <svg ref={svgRef} width={width} height={50}/>
    </div>
}
