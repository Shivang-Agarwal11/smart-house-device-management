


// Function to suggest ways to reduce carbon consumption
export function suggestReductionMethods(carbonConsumption) {
    let suggestions = [];

    // Based on carbon consumption, suggest improvements
    if (carbonConsumption > 10) {
        suggestions.push("Consider upgrading to an energy-efficient model to reduce power usage.");
        suggestions.push("Use timers or smart plugs to automatically turn off the device when not in use.");
        suggestions.push("Switch to renewable energy sources (e.g., solar, wind) to power your device.");
    } else if (carbonConsumption > 5) {
        suggestions.push("Optimize usage time to avoid long periods of inactivity.");
        suggestions.push("Consider reducing standby power consumption by turning off the device when idle.");
    } else {
        suggestions.push("Maintain current energy-efficient practices.");
        suggestions.push("Consider powering the device with renewable energy sources to further reduce carbon impact.");
    }

    return suggestions;
}