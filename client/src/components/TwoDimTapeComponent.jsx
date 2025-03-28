import React, { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

export default function TwoDimTapeComponent({ name, content }) {

    const [ width, setWidth ] = useState(0)
    const [ height, setHeight ] = useState(0)
    const svgRef = useRef();

    useEffect(() => {
        if (!content) return;

        const { head, tape } = content;
        

        // Convert tape object to a sorted array of indices
        const tapeRowIndices = Object.keys(tape).map(x => Number(x.slice(1, -1).split(',')[0]));
        const tapeColIndices = Object.keys(tape).map(x => Number(x.slice(1, -1).split(',')[1]));
        const minRowIndex = Math.min(...tapeRowIndices, head[0] - 2); // Ensure head has neighbors
        const maxRowIndex = Math.max(...tapeRowIndices, head[0] + 2); // Show some context
        const minColIndex = Math.min(...tapeColIndices, head[1] - 2); // Ensure head has neighbors
        const maxColIndex = Math.max(...tapeColIndices, head[1] + 2); // Show some context

        // Generate the displayed tape
        console.log(minRowIndex);
        console.log(maxRowIndex);
        let displayedTape = [];
        for (let i = minRowIndex; i <= maxRowIndex; i++) {
            for (let j = minColIndex; j <= maxColIndex; j++) {
                displayedTape.push({ index: `(${i}, ${j})`, value: tape[`(${i}, ${j})`] || '#' });
            }
        }    

        const squareSize = 50, spacing = 0;
        const numRows = maxRowIndex - minRowIndex + 1;
        const numCols = maxColIndex - minColIndex + 1;
        const width = numCols * (squareSize + spacing);
        const height = numRows * (squareSize + spacing);
        setWidth(width);
        setHeight(height);

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("font", "12px Inter");

        svg.selectAll("*").remove();

        console.log('Displayed Tape', displayedTape);
        console.log('Head', head);
        

        const squares = svg.selectAll("g")
            .data(displayedTape)
            .enter()
            .append("g")
            .attr("transform", (d) => {
                const [ row, col ] = d.index.slice(1, -1).split(',');
                const x = (Number(col) - minColIndex) * (squareSize + spacing);
                const y = (Number(row) - minRowIndex) * (squareSize + spacing);
                console.log(d);
                console.log(row, col, y, x);
                
                return `translate(${x}, ${y})`;
            });

        squares.append("rect")
            .attr("width", squareSize)
            .attr("height", squareSize)
            .attr("fill", d => (d.index === `(${head[0]}, ${head[1]})` ? "#708B75" : "#FDFDFD"))
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

    return <div style={{overflow: 'scroll', 'textAlign': 'center'}}>
        <h3>2D Tape {name}</h3>
        <svg ref={svgRef} width={width} height={height}/>
    </div>
}
