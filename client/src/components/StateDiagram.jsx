import React, { useEffect, useRef } from "react";
import * as d3 from 'd3';
import { downloadSVG } from "../utils/StateDiagramUtils";

const width = 500, height = 500;
export default function StateDiagram({ states, activeStates, initialState }) {
    const svgRef = useRef();
    const nodePositions = useRef({}); // Store node positions between updates
    
    useEffect(() => {
        console.log(activeStates);
        
        const edgeIndices = {}; // Store edge indices for label positioning
                    
        // Dynamically derive transitions from states object
        const transitions = Object.entries(states).flatMap(([state, edges]) =>
            Object.entries(edges['next-states']).flatMap(([symbol, targets]) =>
                targets.map((target) => {                           
                    // Create a consistent key for each source-target pair
                    const edgeKey = `${state}-${target}`; // Use directional key instead
                    
                    // Initialize if this is the first transition for this pair
                    if (!edgeIndices[edgeKey]) {
                        edgeIndices[edgeKey] = 0;
                    }
                    
                    // Increment and use as index
                    edgeIndices[edgeKey]++;
                    
                    return { 
                        source: state, 
                        target, 
                        label: symbol, 
                        i: edgeIndices[edgeKey]
                    };
                })
            )
        );
    
        console.log(transitions); 

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .style("font", "12px sans-serif");

        const statesArray = Object.keys(states).map(id => ({
            id,
            x: nodePositions.current[id]?.x || width / 2 + Math.random() * 100,
            y: nodePositions.current[id]?.y || height / 2 + Math.random() * 100,
            command: states[id].command
        }));

        const initialNode = statesArray.filter(x => x.id === initialState)[0];
        
        const startNode = { 
            id: "start", 
            x: nodePositions.current['start']?.x || width / 2 + Math.random() * 100,
            y: nodePositions.current['start']?.y || height / 2 + Math.random() * 100,
            command: 'initial state' 
        };
        statesArray.push(startNode);
        const initialTransition = {
            source: startNode,
            target: initialNode.id,
            label: "start",
            i: 1
        };

        transitions.push(initialTransition);
    
        // Make sure all targets in transitions exist in statesArray
        transitions.forEach(trans => {
            if (!statesArray.some(s => s.id === trans.target)) {
                statesArray.push({
                    id: trans.target,
                    x: nodePositions.current[trans.target]?.x || width / 2,
                    y: nodePositions.current[trans.target]?.y || height / 2
                });
            }
        });
        
        const states_num = statesArray.length;
        
        const dist = 100 + (50 / (0.25 * states_num));

        svg.selectAll("*").remove();

        const simulation = d3.forceSimulation(statesArray)
            .force("charge", d3.forceManyBody().strength(-200).distanceMax(dist))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("link", d3.forceLink(transitions).id(d => d.id).distance(dist))
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
            .data(statesArray)
            .join("circle")
            .attr("r", 25)
            .attr("fill", d => (d.id === 'start'? 'none': activeStates.includes(d.id) ? "#708B75" : "#30BCED")) // Highlight current state
            .call(drag(simulation));

        const label = svg.append("g")
            .selectAll("text")
            .data(statesArray)
            .join("text")
            .text(d => d.id)
            .attr("x", 0)
            .attr("y", 6)
            .style('font-family', 'Inter')
            .style('font-weight', 'bold');

        const command = svg.append("g")
            .selectAll("text")
            .data(statesArray)
            .join("text")
            .text(d => d.command? d.command: 'halt')
            .attr("x", 0)
            .attr("y", 0)
            .style('font-family', 'Fira Code')
            .style('font-size', '0.6rem')
            .style('font-weight', 'light');

        const symbols = svg.append("g")
            .selectAll("text")
            .data(transitions)
            .join("text")
            .text(d => d.label)
            .attr("x", 0)
            .attr("y", 0)
            .style('font-family', 'Fira Code')
            .style('font-size', '0.6rem')
            .attr("text-anchor", "middle"); // Add text-anchor to center text

        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 10)
            .attr("refY", 5)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .attr("fill", "#999");

        function ticked() {
            link.attr("d", d => getCurvedPath(d));
    
            node.attr("cx", d => {
                nodePositions.current[d.id] = { ...nodePositions.current[d.id], x: d.x }; // Save position
                return d.x;
            }).attr("cy", d => {
                nodePositions.current[d.id] = { ...nodePositions.current[d.id], y: d.y };
                return d.y;
            });
    
            label.attr("x", d => d.x)
                .attr("y", d => d.y - 2.5)
                .attr("text-anchor", "middle");
    
            command.attr("x", d => d.x)
                .attr("y", d => d.y + 7.5)
                .attr("text-anchor", "middle");
    
            // Update label positions
            symbols.each(function(d) {
                const sourceNode = statesArray.find(node => node.id === d.source) || 
                                 (typeof d.source === 'object' ? d.source : null);
                const targetNode = statesArray.find(node => node.id === d.target) || 
                                 (typeof d.target === 'object' ? d.target : null);
                
                if (!sourceNode || !targetNode) {
                    return; // Skip if nodes aren't found
                }
                
                let x, y;
                
                // Self-loop
                if (sourceNode.id === targetNode.id || sourceNode === targetNode) {
                    x = sourceNode.x;
                    y = sourceNode.y - 60 - (d.i * 15); // Stacked vertically above node
                } else {
                    // Get midpoint
                    const midX = (sourceNode.x + targetNode.x) / 2;
                    const midY = (sourceNode.y + targetNode.y) / 2;
                    
                    // Get direction vector
                    const dx = targetNode.x - sourceNode.x;
                    const dy = targetNode.y - sourceNode.y;
                    
                    // Skip calculation if dx and dy are both 0
                    if (dx === 0 && dy === 0) {
                        x = midX;
                        y = midY;
                    } else {
                        // Get perpendicular vector (normalized)
                        const len = Math.sqrt(dx * dx + dy * dy) || 1; // Avoid division by zero
                        const perpX = -dy / len;
                        const perpY = dx / len;
                        
                        // Offset perpendicular to the line
                        const offset = (d.i - 0.1) * 15; // Space labels out
                        x = midX + perpX * offset;
                        y = midY + perpY * offset;
                    }
                }
                
                // Apply positions to the element
                d3.select(this)
                    .attr("x", x)
                    .attr("y", y);
            });
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

        function getCurvedPath(d) {
            const source = typeof d.source === 'string' 
                ? statesArray.find(n => n.id === d.source) 
                : d.source;
            
            const target = typeof d.target === 'string' 
                ? statesArray.find(n => n.id === d.target) 
                : d.target;
            
            if (!source || !target) {
                return ""; // Return empty path if source or target is undefined
            }
            
            if (source.id === target.id || source === target) {
                const radius = 25;
                const loopSize = 40; // Size of the loop
                
                return `M ${source.x} ${source.y - radius} 
                        C ${source.x - loopSize} ${source.y - loopSize - 20}, 
                          ${source.x + loopSize} ${source.y - loopSize - 20}, 
                          ${source.x} ${source.y - radius}`;
            } else {
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dr = Math.sqrt(dx * dx + dy * dy) * 0.5;
        
                const angle = Math.atan2(dy, dx);
                const offsetX = Math.cos(angle) * 25;
                const offsetY = Math.sin(angle) * 25;
        
                return `M ${source.x + offsetX},${source.y + offsetY} 
                        A ${dr},${dr} 0 0,1 
                          ${target.x - offsetX},${target.y - offsetY}`;
            }
        }
    }, [states, activeStates, initialState]);
    
    let activeSet = new Set(activeStates)
    return <div>
        <h2>State Diagram</h2>
        <button onClick={() => downloadSVG(svgRef.current)}>Download snapshot</button>
        <h4 style={{marginBottom: '0.5vh'}}>Current State:</h4>
        <pre style={{marginTop: '0vh', fontSize: '0.9rem'}}>{activeStates.length === 0 ? 'Implicit Rejection' : Array.from(activeSet).join(', ')}</pre>
        <svg style={{border: '0.5px solid black'}} ref={svgRef} width={width} height={height}/>
    </div>;
}
