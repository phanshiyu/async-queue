class QNode<T> {
  next: QNode<T> | null = null;
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

class Queue<T> {
  private head: QNode<T> | null = null;
  private tail: QNode<T> | null = null;
  private queueLength: number = 0;

  constructor() {}

  enqueue = (value: T) => {
    const node = new QNode<T>(value);

    if (this.tail) {
      this.tail.next = node;
      this.tail = this.tail.next;
    } else {
      this.head = node;
      this.tail = node;
    }

    this.queueLength += 1;
  };

  dequeue = (): T | undefined => {
    if (!this.head) return undefined;

    const node = this.head;
    this.head = this.head.next;
    if (!this.head) this.tail = null;

    this.queueLength -= 1;

    return node.value;
  };

  peek = (): T | undefined => {
    return this.head?.value;
  };

  get length(): number {
    return this.queueLength;
  }
}

export class AsyncQueue {
  private count: number = 0;
  private queue: Queue<{
    asyncFn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = new Queue();
  constructor(private batchSize: number) {
    if (this.batchSize <= 0)
      throw new Error("Batch size cannot be less than 1");
  }

  private processBatch = () => {
    while (this.count < this.batchSize && this.queue.length) {
      this.count += 1;
      const item = this.queue.dequeue();
      if (item) {
        const { asyncFn, resolve, reject } = item;
        asyncFn()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.count -= 1;
            this.processBatch();
          });
      }
    }
  };

  exec = <T>(asyncFn: () => Promise<T>): Promise<T> => {
    const promise = new Promise((resolve, reject) => {
      this.queue.enqueue({
        asyncFn,
        resolve,
        reject,
      });
    });

    this.processBatch();

    return promise as Promise<T>;
  };
}
