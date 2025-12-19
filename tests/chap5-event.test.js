import { Record, Some, None, ffor } from '../src/libs';

const EventDetails = Record({ name: '', start: 0, end: 0 })

describe('Events', () => {
  test('using nulls', () => {
    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     */
    const parseAdHoc = (name, start, end) => // named parse in the book
      (name.length > 0 && end < 3000 & start <= end) ? EventDetails({name, start, end}) : null

    expect(parseAdHoc("Apollo Program", 1961, 1972)).toEqual(EventDetails({name: "Apollo Program", start: 1961, end: 1972}))
    expect(parseAdHoc("", 1939, 1945)).toEqual(null)
    expect(parseAdHoc("Event", 1949, 1945)).toEqual(null)
  })

  test('using Option', () => {
    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     */
    const parse = (name, start, end) =>
      (name.length > 0 && end < 3000 & start <= end) ? Some(EventDetails({name, start, end})) : None()

    expect(parse("Apollo Program", 1961, 1972)).toEqual(Some(EventDetails({name: "Apollo Program", start: 1961, end: 1972})))
    expect(parse("", 1939, 1945)).toEqual(None())
    expect(parse("Event", 1949, 1945)).toEqual(None())
  })

  test('parsing as a pipeline', () => {
    /**
     * @param {string} name
     */
    const validateName = (name) => (name.length > 0) ? Some(name) : None()

    /**
     * @param {number} end
     */
    const validateEnd = (end) => (end < 3000) ? Some(end) : None()

    /**
     * @param {number} start
     * @param {number} end
     */
    const validateStart = (start, end) => (start <= end) ? Some(start) : None()

    const eventBuilder = (name, start, end) => EventDetails({name, start, end})
    
    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     */
    const parse = (name, start, end) => ffor(eventBuilder)(  // NOTE: ffor is for comprehension simulation
      validateName(name),
      validateStart(start, end),
      validateEnd(end)
    )

    expect(parse("Apollo Program", 1961, 1972)).toEqual(Some(EventDetails({name: "Apollo Program", start: 1961, end: 1972})))
    expect(parse("", 1939, 1945)).toEqual(None())
    expect(parse("Event", 1949, 1945)).toEqual(None())

    // Coffee break: Parsing with Option
    /**
     * @param {number} start
     * @param {number} end
     * @param {number} minLength
     */
    const validateLength = (start, end, minLength) =>
      (end - start >= minLength) ? Some(end - start) : None()

    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     * @param {number} minLength
     */
    const parseLongEvent = (name, start, end, minLength) => ffor(eventBuilder)(  // NOTE: ffor is for comprehension simulation
      validateName(name),
      validateStart(start, end),
      validateEnd(end),
      validateLength(start, end, minLength)
    )

    expect(parseLongEvent("Apollo Program", 1961, 1972, 10)).toEqual(Some(EventDetails({name: "Apollo Program", start: 1961, end: 1972})))
    expect(parseLongEvent("World War II", 1939, 1945, 10)).toEqual(None())
    expect(parseLongEvent("", 1939, 1945, 10)).toEqual(None())
    expect(parseLongEvent("Apollo Program", 1972, 1961, 10)).toEqual(None())
  })
})
