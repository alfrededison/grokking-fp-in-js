import { abbreviate, replan } from './chap3-immutale-values';

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
