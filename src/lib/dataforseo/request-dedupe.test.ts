import { describe, expect, it } from "vitest";
import { withRequestDedupe } from "./request-dedupe";

describe("request dedupe", () => {
  it("reuses the same in-flight promise", async () => {
    let calls = 0;
    const run = () =>
      withRequestDedupe("same-key", async () => {
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "ok";
      });

    const [first, second] = await Promise.all([run(), run()]);
    expect(first).toBe("ok");
    expect(second).toBe("ok");
    expect(calls).toBe(1);
  });
});
