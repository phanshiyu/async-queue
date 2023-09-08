## Usage
```typescript
function sleep(timeInMs: number) {
  console.log("started " + timeInMs);
  return new Promise<number>((res) => {
    setTimeout(() => {
      res(timeInMs);
    }, timeInMs);
  });
}

const queue = new AsyncQueue(3);

queue.exec(() => sleep(1000)).then(console.log);
queue.exec(() => sleep(10000)).then(console.log);
queue.exec(() => sleep(500)).then(console.log);
queue.exec(() => sleep(500)).then(console.log);
queue.exec(() => sleep(500)).then(console.log);
queue.exec(() => sleep(500)).then(console.log);
queue.exec(() => sleep(500)).then(console.log);
queue.exec(() => sleep(500)).then(console.log);
queue.exec(() => Promise.resolve("good days sir")).then(console.log);
queue.exec(() => sleep(6000)).then(console.log);
queue.exec(() => sleep(6000)).then(console.log);
```
