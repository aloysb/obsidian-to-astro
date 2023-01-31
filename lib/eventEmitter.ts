type Handler<K> = (event: K) => void;

export class Emitter<T extends string, K> {
  private listeners: Handler<K>[] = [];
  private readonly event: T;

  constructor(event: T) {
    this.event = event;
  }

  on(handler: Handler<K>) {
    this.listeners.push(handler);
  }

  off(handler: Handler<K>) {
    this.listeners = this.listeners.filter((subscriber) =>
      JSON.stringify(subscriber) !== JSON.stringify(handler)
    );
  }

  emit(data: K) {
    this.listeners.forEach((listener) => listener(data));
  }
}
