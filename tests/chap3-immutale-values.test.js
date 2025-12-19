/**
 * 
 * @param {string} name
 */
const abbreviate = (name) => {
    const initial = name.substring(0, 1);
    const separator = name.indexOf(' ');
    const lastName = name.substring(separator + 1);
    return initial + '. ' + lastName;
}

/**
 * 
 * @param {string[]} plan 
 * @param {string} newCity 
 * @param {string} beforeCity 
 */
const replan = (plan, newCity, beforeCity) => {
    const beforeCityIndex = plan.indexOf(beforeCity)
    const citiesBefore = plan.slice(0, beforeCityIndex)
    const citiesAfter = plan.slice(beforeCityIndex, plan.length)
    return [...citiesBefore, newCity, ...citiesAfter]
}

test('abbreviates', () => {
    expect(abbreviate("Alonzo Church")).toBe("A. Church");
    expect(abbreviate("A. Church")).toBe("A. Church");
    expect(abbreviate("A Church")).toBe("A. Church");
});

test('replans', () => {
    const planA = ["Paris", "Berlin", "Kraków"]
    console.log("Plan A: " + planA)

    const planB = replan(planA, "Vienna", "Kraków")
    expect(planB).toEqual(["Paris", "Berlin", "Vienna", "Kraków"])
    console.log("Plan B: " + planB)
    
    expect(planA).toEqual(["Paris", "Berlin", "Kraków"])
    console.log("Plan A: " + planA)
});
