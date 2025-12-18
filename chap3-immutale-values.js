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
