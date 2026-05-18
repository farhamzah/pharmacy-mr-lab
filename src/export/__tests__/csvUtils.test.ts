import { describe, expect, it } from "vitest";
import { escapeCsv } from "../csvUtils";

describe("escapeCsv", () => {
  it("escapes comma", () => expect(escapeCsv("a,b")).toBe('"a,b"'));
  it("escapes quote", () => expect(escapeCsv('a"b')).toBe('"a""b"'));
  it("escapes newline", () => expect(escapeCsv("a\nb")).toBe('"a\nb"'));
  it("handles empty values", () => expect(escapeCsv(null)).toBe(""));
});
