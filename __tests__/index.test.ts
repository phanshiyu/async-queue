import { AsyncQueue } from "..";

const promiseControlMap = new Map<
  string,
  {
    resolve: (val: unknown) => void;
    reject: (val: any) => void;
  }
>();

const makePromise = (id: string) => () => {
  return new Promise((resolve, reject) => {
    promiseControlMap.set(id, {
      resolve,
      reject,
    });
  });
};

const processNextTick = () =>
  new Promise((resolve) => {
    process.nextTick(() => {
      resolve(undefined);
    });
  });

describe(AsyncQueue, () => {
  beforeEach(() => {
    promiseControlMap.clear();
  });

  test("Given a queue with batch size 3 and 4 async operations given, should only execute 3", () => {
    const queue = new AsyncQueue(3);
    ["1", "2", "3"].forEach((id) => {
      queue.exec(makePromise(id));
      expect(promiseControlMap.has(id)).toBeTruthy();
    });
    queue.exec(makePromise("4"));
    expect(promiseControlMap.has("4")).toBeFalsy();
  });

  test("Given a task is freed, should run the next one", async () => {
    const queue = new AsyncQueue(3);
    ["1", "2", "3"].forEach((id) => {
      queue.exec(makePromise(id));
      expect(promiseControlMap.has(id)).toBeTruthy();
    });
    queue.exec(makePromise("4"));
    expect(promiseControlMap.has("4")).toBeFalsy();
    promiseControlMap.get("2")?.resolve("2");
    await processNextTick();
    expect(promiseControlMap.has("4")).toBeTruthy();
  });

  test("Given a queue with batch size 3 and 100 tasks, should call all tasks eventually", async () => {
    const queue = new AsyncQueue(3);
    const ids = new Array(100).fill(0).map((_, index) => String(index));
    ids.forEach((id) => {
      queue.exec(makePromise(id));
    });
    for (let i = 0; i < ids.length; i += 3) {
      for (const id of ids.slice(i, i + 3)) {
        promiseControlMap.get(id)?.resolve(id);
        await processNextTick();
      }
    }
    expect(promiseControlMap.size).toBe(100);
  });
});
