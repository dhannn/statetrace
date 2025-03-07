import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';

const width = 500, height = 500;
export default function StateDiagram({ states, transitions, activeStates }) {
    const svgRef = useRef();

    useEffect(() => {
        console.log(activeStates);

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("font", "12px sans-serif");


        const states_num = states.length;
        console.log(states.length);
        
        const dist = 50 + (150 /(0.05 * states_num))
        console.log(dist);
        

        svg.selectAll("*").remove();

        const simulation = d3.forceSimulation(states)
            .force("charge", d3.forceManyBody().strength(-500).distanceMax(dist))
            .force("center", d3.forceCenter(width / 2, height / 2, 50))
            .force("link", d3.forceLink(transitions).id(d => d.id).distance(100))
            .on("tick", ticked);
        
        const link = svg.append("g")
            .selectAll("path")
            .data(transitions)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrow)");
        
        const node = svg.append("g")
            .selectAll("circle")
            .data(states)
            .join("circle")
            .attr("r", 25)
            .attr("fill", d => (activeStates.includes(d.id)? "#708B75" : "#30BCED")) // Highlight current state
            .call(drag(simulation));


        // Labels (state names)
        const label = svg.append("g")
            .selectAll("text")
            .data(states)
            .join("text")
            .text(d => d.id)
            .attr("x", 6)
            .attr("y", 6)
            .style('font-family', 'Inter')
            .style('font-weight', 'bold');

        // Labels (state names)
        const commands = svg.append("g")
            .selectAll("text")
            .data(states)
            .join("text")
            .text(d => d.command)
            .attr("x", 6)
            .attr("y", 6)
            .style('font-family', 'Fira Code');

        const symbols = svg.append("g")
            .selectAll("text")
            .data(transitions)
            .join("text")
            .text(d => { return d.label })
            .attr("x", 6)
            .attr("y", 6)
            .style('font-family', 'Fira Code');

        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 10)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", "#999");
        

        function ticked() {
            link.attr("d", d => getCurvedPath(d.source, d.target));
            
            node.attr("cx", d => d.x)
                .attr("cy", d => d.y);
    
            label.attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("text-anchor", "middle");

            commands.attr('x', d => d.x)
                .attr("y", d => d.y + 15)
                .attr("text-anchor", "middle");
            
            symbols.attr('x', d => d.source.x === d.target.x? d.source.x: (d.source.x + d.target.x) / 2)
                .attr("y", d => d.source.y === d.target.y? d.source.y - (dist/25):(d.source.y + d.target.y) / 2)
                .attr("text-anchor", "middle");
        }

        function drag(simulation) {
          return d3.drag()
            .on("start", (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on("end", (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            });
        }

        function getCurvedPath(source, target) {
            if (source.id === target.id) {
                // Self-loop (make a small circular path)
                const radius = 20;
                return `M ${source.x} ${source.y - radius} 
                        C ${source.x - 40} ${source.y - 60}, 
                          ${source.x + 40} ${source.y - 60}, 
                          ${source.x} ${source.y - radius}`;
            } else {
                // Normal curved transition (quadratic Bézier curve)
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dr = Math.sqrt(dx * dx + dy * dy) * 0.5;

                // Ensure the arrow appears at the correct end of the path
                const angle = Math.atan2(dy, dx);
                const offsetX = Math.cos(angle) * 25; // Radius of the circle
                const offsetY = Math.sin(angle) * 25;

                return `M ${source.x + offsetX},${source.y + offsetY} 
                        A ${dr},${dr} 0 0,1 
                          ${target.x - offsetX},${target.y - offsetY}`;
            }
        }
    }, [states, transitions, activeStates]);

    return <div>
        <h2>State Diagram</h2>
        <h4 style={{marginBottom: '0.5vh'}}>Current State:</h4>
        <pre style={{marginTop: '0vh', fontSize: '0.9rem'}}>{activeStates.length === 0? 'Implicit Rejection': activeStates}</pre>
        <svg style={{border: '0.5px solid black'}} ref={svgRef} width={width} height={height}/>
    </div>
}
