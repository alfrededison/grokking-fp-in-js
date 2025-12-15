/**
 * 
 * @param {string} name
 */
export const abbreviate = (name) => {
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
export const replan = (plan, newCity, beforeCity) => {
    const beforeCityIndex = plan.indexOf(beforeCity)
    const citiesBefore = plan.slice(0, beforeCityIndex)
    const citiesAfter = plan.slice(beforeCityIndex, plan.length)
    return [...citiesBefore, newCity, ...citiesAfter]
}
