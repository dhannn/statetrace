
export function getTransitions(states) {
    return Object.entries(states).flatMap(([state, edges]) => Object.entries(edges).flatMap(([symbol, targets]) => targets.map(target => ({ source: state, target, label: symbol }))
    )
    );
}
