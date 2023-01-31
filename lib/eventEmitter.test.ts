import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.173.0/testing/asserts.ts";
import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.173.0/testing/bdd.ts";

import { Emitter } from "./eventEmitter.ts";

describe("Note class", () => {
  let noteCreatedEmitter: Emitter<"note created", null>;
  beforeEach(() => {
    noteCreatedEmitter = new Emitter("note created");
  });
  it("should instantiate a new emitter", () => {
    assertExists(noteCreatedEmitter);
  });

  it("should allow to emit an event and be listened to", () => {
    let tester = 2;
    const listener = () => {
      tester *= 2;
    };
    noteCreatedEmitter.on(listener);
    noteCreatedEmitter.emit(null);
    assertEquals(tester, 4);
  });

  it("should allow to unsubscribe a listener", () => {
    let tester = 2;
    const listener = () => {
      tester *= 2;
    };
    noteCreatedEmitter.on(listener);
    noteCreatedEmitter.off(listener);
    noteCreatedEmitter.emit(null);
    assertEquals(tester, 2);
  });

  it("should allow to subscribe multiple listeners", () => {
    let tester = 2;
    const listener = () => {
      tester *= 2;
    };
    const listener2 = () => {
      tester *= 2;
    };
    const listener3 = () => {
      tester /= 2;
    };
    noteCreatedEmitter.on(listener);
    noteCreatedEmitter.on(listener2);
    noteCreatedEmitter.on(listener3);
    noteCreatedEmitter.emit(null);
    assertEquals(tester, 4);
  });

  it("allows me to pass data with the event", () => {
    let tester;
    const listener = (data: null) => {
      tester = data;
    };
    noteCreatedEmitter.on(listener);
    noteCreatedEmitter.emit(null);
    assertEquals(tester, null);
  });
});
