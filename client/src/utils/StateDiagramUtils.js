
export function getTransitions(states) {
    return Object.entries(states).flatMap(([state, edges]) => Object.entries(edges).flatMap(([symbol, targets]) => targets.map(target => ({ source: state, target, label: symbol }))
    )
    );
}

export const downloadSVG = (svgElement) => {
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Add the XML namespace (required for SVG files)
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "state_diagram.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

