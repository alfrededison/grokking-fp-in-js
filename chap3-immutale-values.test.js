import { abbreviate } from './chap3-immutale-values';

test('abbreviates', () => {
    expect(abbreviate("Alonzo Church")).toBe("A. Church");
    expect(abbreviate("A. Church")).toBe("A. Church");
    expect(abbreviate("A Church")).toBe("A. Church");
});
