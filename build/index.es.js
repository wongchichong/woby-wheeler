(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const SYMBOL_OBSERVABLE = Symbol("Observable");
const SYMBOL_OBSERVABLE_FROZEN = Symbol("Frozen");
const SYMBOL_OBSERVABLE_READABLE = Symbol("Readable");
const SYMBOL_OBSERVABLE_WRITABLE = Symbol("Writable");
const SYMBOL_STORE = Symbol("Store");
const SYMBOL_STORE_KEYS = Symbol("Keys");
const SYMBOL_STORE_OBSERVABLE = Symbol("Observable");
const SYMBOL_STORE_TARGET = Symbol("Target");
const SYMBOL_STORE_VALUES = Symbol("Values");
const SYMBOL_STORE_UNTRACKED = Symbol("Untracked");
const SYMBOL_UNCACHED = Symbol("Uncached");
const SYMBOL_UNTRACKED_UNWRAPPED = Symbol("Unwrapped");
const suspended = () => {
  return void 0;
};
const lazyArrayEach = (arr, fn) => {
  if (arr instanceof Array) {
    arr.forEach(fn);
  } else if (arr) {
    fn(arr);
  }
};
const lazyArrayEachRight = (arr, fn) => {
  if (arr instanceof Array) {
    for (let i = arr.length - 1; i >= 0; i--) {
      fn(arr[i]);
    }
  } else if (arr) {
    fn(arr);
  }
};
const lazyArrayPush = (obj, key, value) => {
  const arr = obj[key];
  if (arr instanceof Array) {
    arr.push(value);
  } else if (arr) {
    obj[key] = [arr, value];
  } else {
    obj[key] = value;
  }
};
const lazySetAdd = (obj, key, value) => {
  const set = obj[key];
  if (set instanceof Set) {
    set.add(value);
  } else if (set) {
    if (value !== set) {
      const s = /* @__PURE__ */ new Set();
      s.add(set);
      s.add(value);
      obj[key] = s;
    }
  } else {
    obj[key] = value;
  }
};
const lazySetDelete = (obj, key, value) => {
  const set = obj[key];
  if (set instanceof Set) {
    set.delete(value);
  } else if (set === value) {
    obj[key] = void 0;
  }
};
const lazySetEach = (set, fn) => {
  if (set instanceof Set) {
    for (const value of set) {
      fn(value);
    }
  } else if (set) {
    fn(set);
  }
};
const lazySetHas = (set, value) => {
  if (set instanceof Set) {
    return set.has(value);
  } else {
    return set === value;
  }
};
const castArray$1 = (value) => {
  return isArray$1(value) ? value : [value];
};
const castError$1 = (error2) => {
  if (error2 instanceof Error)
    return error2;
  if (typeof error2 === "string")
    return new Error(error2);
  return new Error("Unknown error");
};
const { is } = Object;
const { isArray: isArray$1 } = Array;
const isFunction$1 = (value) => {
  return typeof value === "function";
};
const isNumber = (value) => {
  return typeof value === "number";
};
const isObject$1 = (value) => {
  return value !== null && typeof value === "object";
};
const max = (a, b) => {
  return a > b ? a : b;
};
const noop = () => {
  return;
};
const nope = () => {
  return false;
};
class Observer {
  constructor() {
    __publicField(this, "parent");
    __publicField(this, "signal");
    __publicField(this, "cleanups");
    __publicField(this, "contexts");
    __publicField(this, "errors");
    __publicField(this, "observables");
    __publicField(this, "observablesLeftover");
    __publicField(this, "observers");
    __publicField(this, "roots");
    __publicField(this, "inactive");
  }
  // Inactive observers should not be re-executed, if they can be
  /* REGISTRATION API */
  registerCleanup(cleanup2) {
    lazyArrayPush(this, "cleanups", cleanup2);
  }
  registerError(error2) {
    lazyArrayPush(this, "errors", error2);
  }
  registerObservable(observable2) {
    lazyArrayPush(this, "observables", observable2);
  }
  registerObserver(observer) {
    lazyArrayPush(this, "observers", observer);
  }
  registerRoot(root2) {
    lazySetAdd(this, "roots", root2);
  }
  unregisterRoot(root2) {
    lazySetDelete(this, "roots", root2);
  }
  /* API */
  catch(error2, silent) {
    const { errors, parent } = this;
    if (errors) {
      try {
        lazyArrayEach(errors, (fn) => fn.call(fn, error2));
      } catch (error22) {
        if (parent) {
          parent.catch(castError$1(error22), false);
        } else {
          throw error22;
        }
      }
      return true;
    } else {
      if (parent == null ? void 0 : parent.catch(error2, true))
        return true;
      if (silent) {
        return false;
      } else {
        throw error2;
      }
    }
  }
  dispose(deep, immediate) {
    const { observers, observables, cleanups, errors, contexts } = this;
    if (observers) {
      this.observers = void 0;
      lazyArrayEachRight(observers, (observer) => {
        observer.dispose(true, true);
      });
    }
    if (observables) {
      this.observables = void 0;
      if (immediate) {
        lazyArrayEach(observables, (observable2) => {
          if (!observable2.signal.disposed) {
            observable2.unregisterObserver(this);
          }
        });
      } else {
        this.observablesLeftover = observables;
      }
    }
    if (cleanups) {
      this.cleanups = void 0;
      this.inactive = true;
      lazyArrayEachRight(cleanups, (cleanup2) => cleanup2.call(cleanup2));
      this.inactive = false;
    }
    if (errors) {
      this.errors = void 0;
    }
    if (contexts) {
      this.contexts = void 0;
    }
  }
  postdispose() {
    const prev = this.observablesLeftover;
    if (!prev)
      return;
    this.observablesLeftover = void 0;
    const next = this.observables;
    if (prev === next)
      return;
    const a = prev instanceof Array ? prev : [prev];
    const b = next instanceof Array ? next : next ? [next] : [];
    let bSet;
    for (let ai = 0, al = a.length; ai < al; ai++) {
      const av = a[ai];
      if (av.signal.disposed)
        continue;
      if (av === b[ai])
        continue;
      bSet || (bSet = new Set(b));
      if (bSet.has(av))
        continue;
      av.unregisterObserver(this);
    }
  }
  read(symbol) {
    const { contexts, parent } = this;
    if (contexts && symbol in contexts)
      return contexts[symbol];
    return parent == null ? void 0 : parent.read(symbol);
  }
  write(symbol, value) {
    this.contexts || (this.contexts = {});
    this.contexts[symbol] = value;
  }
  wrap(fn, tracking = false) {
    const ownerPrev = OWNER;
    const trackingPrev = TRACKING;
    setOwner(this);
    setTracking(tracking);
    let result;
    try {
      result = fn();
    } catch (error2) {
      this.catch(castError$1(error2), false);
    } finally {
      setOwner(ownerPrev);
      setTracking(trackingPrev);
    }
    return result;
  }
}
class Root extends Observer {
  /* CONSTRUCTOR */
  constructor(pausable) {
    super();
    __publicField(this, "parent", OWNER);
    __publicField(this, "disposed");
    __publicField(this, "pausable");
    if (pausable && isNumber(suspended())) {
      this.pausable = true;
      this.parent.registerRoot(this);
    }
  }
  /* API */
  dispose(deep, immediate) {
    this.disposed = true;
    if (this.pausable) {
      this.parent.unregisterRoot(this);
    }
    super.dispose(deep, immediate);
  }
  wrap(fn) {
    const dispose = this.dispose.bind(this, true, true);
    const fnWithDispose = fn.bind(void 0, dispose);
    const rootPrev = ROOT;
    setRoot(this);
    try {
      return super.wrap(fnWithDispose);
    } finally {
      setRoot(rootPrev);
    }
  }
}
class SuperRoot extends Observer {
  constructor() {
    super(...arguments);
    __publicField(this, "disposed", false);
  }
}
let SUPER_OWNER = new SuperRoot();
let BATCH;
let OWNER = SUPER_OWNER;
let ROOT = SUPER_OWNER;
let ROOT_DISPOSED = Object.assign(new Root(), { disposed: true });
let TRACKING = false;
const setBatch = (value) => BATCH = value;
const setOwner = (value) => OWNER = value;
const setRoot = (value) => ROOT = value;
const setTracking = (value) => TRACKING = value;
const start = () => {
  setBatch(/* @__PURE__ */ new Map());
};
const stop = () => {
  const batch2 = BATCH;
  if (!batch2)
    return;
  setBatch();
  if (batch2.size > 1) {
    batch2.forEach(stale);
    batch2.forEach(write);
    batch2.forEach(unstale);
  } else {
    batch2.forEach(write);
  }
};
const wrap = (fn, onBefore, onAfter) => {
  onBefore();
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.finally(onAfter);
    } else {
      onAfter();
    }
    return result;
  } catch (error2) {
    onAfter();
    throw error2;
  }
};
const stale = (value, observable2) => {
  observable2.emit(1, false);
};
const unstale = (value, observable2) => {
  observable2.emit(-1, false);
};
const write = (value, observable2) => {
  observable2.write(value);
};
const batch = (fn) => {
  if (BATCH) {
    return fn();
  } else {
    return wrap(fn, start, stop);
  }
};
function frozenFunction() {
  if (arguments.length)
    throw new Error("A readonly Observable can not be updated");
  return this;
}
function readableFunction(symbol) {
  if (arguments.length) {
    if (symbol === SYMBOL_OBSERVABLE)
      return this;
    throw new Error("A readonly Observable can not be updated");
  }
  return this.read();
}
function writableFunction(fn) {
  if (arguments.length) {
    if (fn === SYMBOL_OBSERVABLE)
      return this;
    if (isFunction$1(fn))
      return this.update(fn);
    return this.write(fn);
  }
  return this.read();
}
const frozen = (value) => {
  const fn = frozenFunction.bind(value);
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_FROZEN] = true;
  return fn;
};
const readable = (value) => {
  if (value.signal === ROOT_DISPOSED)
    return frozen(value.value);
  const fn = readableFunction.bind(value);
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_READABLE] = true;
  return fn;
};
const writable = (value) => {
  const fn = writableFunction.bind(value);
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_WRITABLE] = true;
  return fn;
};
const getExecution = (status) => {
  return status & 3;
};
const setExecution = (status, execution) => {
  return status >>> 2 << 2 | execution;
};
const getFresh = (status) => {
  return !!(status & 4);
};
const setFresh = (status, fresh) => {
  return fresh ? status | 4 : status;
};
const getCount = (status) => {
  return status >>> 3;
};
const changeCount = (status, change) => {
  return status + (change << 3);
};
class Computation extends Observer {
  constructor() {
    super(...arguments);
    __publicField(this, "parent", OWNER);
    __publicField(this, "signal", ROOT);
    __publicField(this, "status", 0);
  }
  /* API */
  emit(change, fresh) {
    if (change < 0 && !getCount(this.status))
      return;
    this.status = changeCount(this.status, change);
    this.status = setFresh(this.status, fresh);
    if (getCount(this.status))
      return;
    fresh = getFresh(this.status);
    this.status = getExecution(this.status);
    if (this.inactive)
      return;
    this.update(fresh);
  }
  update(fresh) {
  }
  wrap(fn, tracking = true) {
    return super.wrap(fn, tracking);
  }
}
class Observable {
  /* CONSTRUCTOR */
  constructor(value, options, parent) {
    __publicField(this, "parent");
    __publicField(this, "signal", ROOT);
    __publicField(this, "value");
    __publicField(this, "equals");
    __publicField(this, "listeners");
    __publicField(this, "observers");
    this.value = value;
    if (parent) {
      this.parent = parent;
    }
    if ((options == null ? void 0 : options.equals) !== void 0) {
      this.equals = options.equals || nope;
    }
  }
  /* REGISTRATION API */
  registerListener(listener) {
    if (lazySetHas(this.listeners, listener))
      return;
    lazySetAdd(this, "listeners", listener);
  }
  registerObserver(observer) {
    lazySetAdd(this, "observers", observer);
  }
  registerSelf() {
    if (this.signal.disposed)
      return;
    if (TRACKING) {
      const owner2 = OWNER;
      if (owner2.observables !== this) {
        this.registerObserver(owner2);
        owner2.registerObservable(this);
      }
    }
    if (this.parent && getCount(this.parent.status)) {
      this.parent.status = getExecution(this.parent.status);
      this.parent.update(true);
    }
  }
  unregisterListener(listener) {
    lazySetDelete(this, "listeners", listener);
  }
  unregisterObserver(observer) {
    lazySetDelete(this, "observers", observer);
  }
  /* API */
  read() {
    this.registerSelf();
    return this.value;
  }
  write(value) {
    if (this.signal === ROOT_DISPOSED)
      throw new Error("A disposed Observable can not be updated");
    if (BATCH) {
      BATCH.set(this, value);
      return value;
    } else {
      const equals = this.equals || is;
      const fresh = !equals(value, this.value);
      if (!this.parent) {
        if (!fresh)
          return value;
        if (!this.signal.disposed) {
          this.emit(1, fresh);
        }
      }
      if (fresh) {
        const valuePrev = this.value;
        this.value = value;
        this.listened(valuePrev);
      }
      if (!this.signal.disposed) {
        this.emit(-1, fresh);
      }
      return value;
    }
  }
  update(fn) {
    const valueNext = fn(this.value);
    return this.write(valueNext);
  }
  emit(change, fresh) {
    if (this.signal.disposed)
      return;
    const computations = this.observers;
    if (computations) {
      if (computations instanceof Set) {
        for (const computation of computations) {
          computation.emit(change, fresh);
        }
      } else {
        computations.emit(change, fresh);
      }
    }
  }
  listened(valuePrev) {
    if (this.signal.disposed)
      return;
    const { listeners } = this;
    if (listeners) {
      if (listeners instanceof Set) {
        for (const listener of listeners) {
          listener.call(listener, this.value, valuePrev);
        }
      } else {
        listeners.call(listeners, this.value, valuePrev);
      }
    }
  }
  dispose() {
    this.signal = ROOT_DISPOSED;
  }
}
class Memo extends Computation {
  /* CONSTRUCTOR */
  constructor(fn, options) {
    super();
    __publicField(this, "fn");
    __publicField(this, "observable");
    this.fn = fn;
    this.observable = new Observable(void 0, options, this);
    this.parent.registerObserver(this);
    this.update(true, true);
  }
  /* API */
  dispose(deep, immediate) {
    if (deep && !this.signal.disposed) {
      this.observable.dispose();
    }
    super.dispose(deep, immediate);
  }
  emit(change, fresh) {
    if (change > 0 && !getCount(this.status)) {
      this.observable.emit(change, false);
    }
    super.emit(change, fresh);
  }
  update(fresh, first) {
    if (fresh && !this.observable.signal.disposed) {
      const status = getExecution(this.status);
      if (status) {
        this.status = setExecution(this.status, fresh ? 3 : max(status, 2));
        if (status > 1) {
          this.observable.emit(-1, false);
        }
      } else {
        this.status = setExecution(this.status, 1);
        this.dispose();
        try {
          const value = this.wrap(this.fn);
          this.postdispose();
          if (this.observable.signal.disposed) {
            this.observable.emit(-1, false);
          } else if (first) {
            this.observable.value = value;
          } else {
            this.observable.write(value);
          }
          if (!this.observers && !this.observables && !this.cleanups) {
            this.dispose(true, true);
          }
        } catch (error2) {
          this.postdispose();
          this.catch(castError$1(error2), false);
          this.observable.emit(-1, false);
        } finally {
          const status2 = getExecution(this.status);
          this.status = setExecution(status2, 0);
          if (status2 > 1) {
            this.update(status2 === 3);
          } else if (!this.observables) {
            this.fn = noop;
            this.observable.dispose();
          }
        }
      }
    } else {
      this.observable.emit(-1, false);
    }
  }
}
const memo = (fn, options) => {
  const memo2 = new Memo(fn, options);
  const observable2 = readable(memo2.observable);
  return observable2;
};
const isObservableFrozen = (value) => {
  return isFunction$1(value) && SYMBOL_OBSERVABLE_FROZEN in value;
};
const cleanup = (fn) => {
  OWNER.registerCleanup(fn);
};
function context(symbol, value) {
  if (arguments.length < 2) {
    return OWNER.read(symbol);
  } else {
    return OWNER.write(symbol, value);
  }
}
const disposed = () => {
  const observable2 = new Observable(false);
  cleanup(() => {
    observable2.write(true);
  });
  return readable(observable2);
};
class Reaction extends Computation {
  /* CONSTRUCTOR */
  constructor(fn, pausable) {
    super();
    __publicField(this, "fn");
    this.fn = fn;
    this.parent.registerObserver(this);
    if (pausable && suspended()) {
      this.emit(1, true);
    } else {
      this.update(true);
    }
  }
  /* API */
  update(fresh) {
    if (fresh && !this.signal.disposed) {
      const status = getExecution(this.status);
      if (status) {
        this.status = setExecution(this.status, fresh ? 3 : max(status, 2));
      } else {
        this.status = setExecution(this.status, 1);
        this.dispose();
        try {
          const cleanup2 = this.wrap(this.fn);
          this.postdispose();
          if (isFunction$1(cleanup2)) {
            this.registerCleanup(cleanup2);
          } else {
            if (!this.observers && !this.observables && !this.cleanups) {
              this.dispose(true, true);
            }
          }
        } catch (error2) {
          this.postdispose();
          this.catch(castError$1(error2), false);
        } finally {
          const status2 = getExecution(this.status);
          this.status = setExecution(this.status, 0);
          if (status2 > 1) {
            this.update(status2 === 3);
          } else if (!this.observables) {
            this.fn = noop;
          }
        }
      }
    }
  }
}
class Effect extends Reaction {
  /* CONSTRUCTOR */
  constructor(fn) {
    super(fn, true);
  }
}
const effect = (fn) => {
  const effect2 = new Effect(fn);
  const dispose = effect2.dispose.bind(effect2, true, true);
  return dispose;
};
const isObservable = (value) => {
  return isFunction$1(value) && (SYMBOL_OBSERVABLE_FROZEN in value || SYMBOL_OBSERVABLE_READABLE in value || SYMBOL_OBSERVABLE_WRITABLE in value);
};
function get(value, getFunction = true) {
  const is2 = getFunction ? isFunction$1 : isObservable;
  if (is2(value)) {
    return value();
  } else {
    return value;
  }
}
const isStore = (value) => {
  return isObject$1(value) && SYMBOL_STORE in value;
};
function untrack(fn) {
  if (isFunction$1(fn)) {
    const trackingPrev = TRACKING;
    try {
      setTracking(false);
      return fn();
    } finally {
      setTracking(trackingPrev);
    }
  } else {
    return fn;
  }
}
frozen(-1);
frozen(-1);
const isBatching = () => {
  return !!BATCH;
};
const target$1 = (observable2) => {
  if (isFunction$1(observable2)) {
    return observable2(SYMBOL_OBSERVABLE);
  } else {
    return observable2;
  }
};
const off = (observable2, listener) => {
  if (!isObservableFrozen(observable2)) {
    target$1(observable2).unregisterListener(listener);
  }
};
const on = (observable2, listener) => {
  if (!isObservableFrozen(observable2)) {
    target$1(observable2).registerListener(listener);
  }
  return () => {
    off(observable2, listener);
  };
};
const reaction = (fn) => {
  const reaction2 = new Reaction(fn);
  const dispose = reaction2.dispose.bind(reaction2, true, true);
  return dispose;
};
const root = (fn) => {
  return new Root(true).wrap(fn);
};
frozen(false);
frozen(true);
class StoreMap extends Map {
  insert(key, value) {
    super.set(key, value);
    return value;
  }
}
class StoreCleanable {
  constructor() {
    __publicField(this, "count", 0);
  }
  listen() {
    this.count += 1;
    cleanup(this);
  }
  call() {
    this.count -= 1;
    if (this.count)
      return;
    this.dispose();
  }
  dispose() {
  }
}
class StoreKeys extends StoreCleanable {
  constructor(parent, observable2) {
    super();
    this.parent = parent;
    this.observable = observable2;
  }
  dispose() {
    this.parent.keys = void 0;
  }
}
class StoreValues extends StoreCleanable {
  constructor(parent, observable2) {
    super();
    this.parent = parent;
    this.observable = observable2;
  }
  dispose() {
    this.parent.values = void 0;
  }
}
class StoreHas extends StoreCleanable {
  constructor(parent, key, observable2) {
    super();
    this.parent = parent;
    this.key = key;
    this.observable = observable2;
  }
  dispose() {
    var _a2;
    (_a2 = this.parent.has) == null ? void 0 : _a2.delete(this.key);
  }
}
class StoreProperty extends StoreCleanable {
  constructor(parent, key, observable2, node) {
    super();
    this.parent = parent;
    this.key = key;
    this.observable = observable2;
    this.node = node;
  }
  dispose() {
    var _a2;
    (_a2 = this.parent.properties) == null ? void 0 : _a2.delete(this.key);
  }
}
const StoreListenersRegular = {
  /* VARIABLES */
  active: 0,
  listeners: /* @__PURE__ */ new Set(),
  nodes: /* @__PURE__ */ new Set(),
  /* API */
  prepare: () => {
    const { listeners, nodes } = StoreListenersRegular;
    const traversed = /* @__PURE__ */ new Set();
    const traverse = (node) => {
      if (traversed.has(node))
        return;
      traversed.add(node);
      lazySetEach(node.parents, traverse);
      lazySetEach(node.listenersRegular, (listener) => {
        listeners.add(listener);
      });
    };
    nodes.forEach(traverse);
    return () => {
      listeners.forEach((listener) => {
        listener();
      });
    };
  },
  register: (node) => {
    StoreListenersRegular.nodes.add(node);
    StoreScheduler.schedule();
  },
  reset: () => {
    StoreListenersRegular.listeners = /* @__PURE__ */ new Set();
    StoreListenersRegular.nodes = /* @__PURE__ */ new Set();
  }
};
const StoreListenersRoots = {
  /* VARIABLES */
  active: 0,
  nodes: /* @__PURE__ */ new Map(),
  /* API */
  prepare: () => {
    const { nodes } = StoreListenersRoots;
    return () => {
      nodes.forEach((rootsSet, store2) => {
        const roots = Array.from(rootsSet);
        lazySetEach(store2.listenersRoots, (listener) => {
          listener(roots);
        });
      });
    };
  },
  register: (store2, root2) => {
    const roots = StoreListenersRoots.nodes.get(store2) || /* @__PURE__ */ new Set();
    roots.add(root2);
    StoreListenersRoots.nodes.set(store2, roots);
    StoreScheduler.schedule();
  },
  registerWith: (current, parent, key) => {
    if (!parent.parents) {
      const root2 = (current == null ? void 0 : current.store) || untrack(() => parent.store[key]);
      StoreListenersRoots.register(parent, root2);
    } else {
      const traversed = /* @__PURE__ */ new Set();
      const traverse = (node) => {
        if (traversed.has(node))
          return;
        traversed.add(node);
        lazySetEach(node.parents, (parent2) => {
          if (!parent2.parents) {
            StoreListenersRoots.register(parent2, node.store);
          }
          traverse(parent2);
        });
      };
      traverse(current || parent);
    }
  },
  reset: () => {
    StoreListenersRoots.nodes = /* @__PURE__ */ new Map();
  }
};
const StoreScheduler = {
  /* VARIABLES */
  active: false,
  /* API */
  flush: () => {
    const flushRegular = StoreListenersRegular.prepare();
    const flushRoots = StoreListenersRoots.prepare();
    StoreScheduler.reset();
    flushRegular();
    flushRoots();
  },
  flushIfNotBatching: () => {
    if (isBatching()) {
      setTimeout(StoreScheduler.flushIfNotBatching, 0);
    } else {
      StoreScheduler.flush();
    }
  },
  reset: () => {
    StoreScheduler.active = false;
    StoreListenersRegular.reset();
    StoreListenersRoots.reset();
  },
  schedule: () => {
    if (StoreScheduler.active)
      return;
    StoreScheduler.active = true;
    queueMicrotask(StoreScheduler.flushIfNotBatching);
  }
};
const NODES = /* @__PURE__ */ new WeakMap();
const SPECIAL_SYMBOLS = /* @__PURE__ */ new Set([SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES]);
const UNREACTIVE_KEYS = /* @__PURE__ */ new Set(["__proto__", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "prototype", "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toSource", "toString", "valueOf"]);
const STORE_TRAPS = {
  /* API */
  get: (target2, key) => {
    var _a2, _b2;
    if (SPECIAL_SYMBOLS.has(key)) {
      if (key === SYMBOL_STORE)
        return true;
      if (key === SYMBOL_STORE_TARGET)
        return target2;
      if (key === SYMBOL_STORE_KEYS) {
        if (isListenable()) {
          const node2 = getNodeExisting(target2);
          node2.keys || (node2.keys = getNodeKeys(node2));
          node2.keys.listen();
          node2.keys.observable.read();
        }
        return;
      }
      if (key === SYMBOL_STORE_VALUES) {
        if (isListenable()) {
          const node2 = getNodeExisting(target2);
          node2.values || (node2.values = getNodeValues(node2));
          node2.values.listen();
          node2.values.observable.read();
        }
        return;
      }
      if (key === SYMBOL_STORE_OBSERVABLE) {
        return (key2) => {
          var _a22;
          key2 = typeof key2 === "number" ? String(key2) : key2;
          const node2 = getNodeExisting(target2);
          const getter2 = (_a22 = node2.getters) == null ? void 0 : _a22.get(key2);
          if (getter2)
            return getter2.bind(node2.store);
          node2.properties || (node2.properties = new StoreMap());
          const value2 = target2[key2];
          const property2 = node2.properties.get(key2) || node2.properties.insert(key2, getNodeProperty(node2, key2, value2));
          const options = node2.equals ? { equals: node2.equals } : void 0;
          property2.observable || (property2.observable = getNodeObservable(node2, value2, options));
          const observable2 = readable(property2.observable);
          return observable2;
        };
      }
    }
    if (UNREACTIVE_KEYS.has(key))
      return target2[key];
    const node = getNodeExisting(target2);
    const getter = (_a2 = node.getters) == null ? void 0 : _a2.get(key);
    const value = getter || target2[key];
    node.properties || (node.properties = new StoreMap());
    const listenable = isListenable();
    const proxiable = isProxiable(value);
    const property = listenable || proxiable ? node.properties.get(key) || node.properties.insert(key, getNodeProperty(node, key, value)) : void 0;
    if (property == null ? void 0 : property.node) {
      lazySetAdd(property.node, "parents", node);
    }
    if (property && listenable) {
      const options = node.equals ? { equals: node.equals } : void 0;
      property.listen();
      property.observable || (property.observable = getNodeObservable(node, value, options));
      property.observable.read();
    }
    if (getter) {
      return getter.call(node.store);
    } else {
      if (typeof value === "function" && value === Array.prototype[key]) {
        return function() {
          return batch(() => value.apply(node.store, arguments));
        };
      }
      return ((_b2 = property == null ? void 0 : property.node) == null ? void 0 : _b2.store) || value;
    }
  },
  set: (target2, key, value) => {
    var _a2;
    value = getTarget(value);
    const node = getNodeExisting(target2);
    const setter = (_a2 = node.setters) == null ? void 0 : _a2.get(key);
    if (setter) {
      batch(() => setter.call(node.store, value));
    } else {
      const valuePrev = target2[key];
      const hadProperty = !!valuePrev || key in target2;
      const equals = node.equals || is;
      if (hadProperty && equals(value, valuePrev) && (key !== "length" || !Array.isArray(target2)))
        return true;
      target2[key] = value;
      batch(() => {
        var _a22, _b2, _c, _d, _e, _f;
        (_a22 = node.values) == null ? void 0 : _a22.observable.write(0);
        if (!hadProperty) {
          (_b2 = node.keys) == null ? void 0 : _b2.observable.write(0);
          (_d = (_c = node.has) == null ? void 0 : _c.get(key)) == null ? void 0 : _d.observable.write(true);
        }
        const property = (_e = node.properties) == null ? void 0 : _e.get(key);
        if (property == null ? void 0 : property.node) {
          lazySetDelete(property.node, "parents", node);
        }
        if (property) {
          (_f = property.observable) == null ? void 0 : _f.write(value);
          property.node = isProxiable(value) ? NODES.get(value) || getNode(value, node) : void 0;
        }
        if (property == null ? void 0 : property.node) {
          lazySetAdd(property.node, "parents", node);
        }
        if (StoreListenersRoots.active) {
          StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key);
        }
        if (StoreListenersRegular.active) {
          StoreListenersRegular.register(node);
        }
      });
    }
    return true;
  },
  deleteProperty: (target2, key) => {
    const hasProperty = key in target2;
    if (!hasProperty)
      return true;
    const deleted = Reflect.deleteProperty(target2, key);
    if (!deleted)
      return false;
    const node = getNodeExisting(target2);
    batch(() => {
      var _a2, _b2, _c, _d, _e, _f;
      (_a2 = node.keys) == null ? void 0 : _a2.observable.write(0);
      (_b2 = node.values) == null ? void 0 : _b2.observable.write(0);
      (_d = (_c = node.has) == null ? void 0 : _c.get(key)) == null ? void 0 : _d.observable.write(false);
      const property = (_e = node.properties) == null ? void 0 : _e.get(key);
      if (StoreListenersRoots.active) {
        StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key);
      }
      if (property == null ? void 0 : property.node) {
        lazySetDelete(property.node, "parents", node);
      }
      if (property) {
        (_f = property.observable) == null ? void 0 : _f.write(void 0);
        property.node = void 0;
      }
      if (StoreListenersRegular.active) {
        StoreListenersRegular.register(node);
      }
    });
    return true;
  },
  defineProperty: (target2, key, descriptor) => {
    const node = getNodeExisting(target2);
    const equals = node.equals || is;
    const hadProperty = key in target2;
    const descriptorPrev = Reflect.getOwnPropertyDescriptor(target2, key);
    if (descriptorPrev && isEqualDescriptor(descriptorPrev, descriptor, equals))
      return true;
    const defined = Reflect.defineProperty(target2, key, descriptor);
    if (!defined)
      return false;
    batch(() => {
      var _a2, _b2, _c, _d, _e, _f, _g, _h;
      if (!descriptor.get) {
        (_a2 = node.getters) == null ? void 0 : _a2.delete(key);
      } else if (descriptor.get) {
        node.getters || (node.getters = new StoreMap());
        node.getters.set(key, descriptor.get);
      }
      if (!descriptor.set) {
        (_b2 = node.setters) == null ? void 0 : _b2.delete(key);
      } else if (descriptor.set) {
        node.setters || (node.setters = new StoreMap());
        node.setters.set(key, descriptor.set);
      }
      if (hadProperty !== !!descriptor.enumerable) {
        (_c = node.keys) == null ? void 0 : _c.observable.write(0);
        (_e = (_d = node.has) == null ? void 0 : _d.get(key)) == null ? void 0 : _e.observable.write(!!descriptor.enumerable);
      }
      const property = (_f = node.properties) == null ? void 0 : _f.get(key);
      if (StoreListenersRoots.active) {
        StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key);
      }
      if (property == null ? void 0 : property.node) {
        lazySetDelete(property.node, "parents", node);
      }
      if (property) {
        if ("get" in descriptor) {
          (_g = property.observable) == null ? void 0 : _g.write(descriptor.get);
          property.node = void 0;
        } else {
          const value = descriptor["value"];
          (_h = property.observable) == null ? void 0 : _h.write(value);
          property.node = isProxiable(value) ? NODES.get(value) || getNode(value, node) : void 0;
        }
      }
      if (property == null ? void 0 : property.node) {
        lazySetAdd(property.node, "parents", node);
      }
      if (StoreListenersRoots.active) {
        StoreListenersRoots.registerWith(property == null ? void 0 : property.node, node, key);
      }
      if (StoreListenersRegular.active) {
        StoreListenersRegular.register(node);
      }
    });
    return true;
  },
  has: (target2, key) => {
    if (key === SYMBOL_STORE)
      return true;
    if (key === SYMBOL_STORE_TARGET)
      return true;
    const value = key in target2;
    if (isListenable()) {
      const node = getNodeExisting(target2);
      node.has || (node.has = new StoreMap());
      const has = node.has.get(key) || node.has.insert(key, getNodeHas(node, key, value));
      has.listen();
      has.observable.read();
    }
    return value;
  },
  ownKeys: (target2) => {
    const keys2 = Reflect.ownKeys(target2);
    if (isListenable()) {
      const node = getNodeExisting(target2);
      node.keys || (node.keys = getNodeKeys(node));
      node.keys.listen();
      node.keys.observable.read();
    }
    return keys2;
  }
};
const STORE_UNTRACK_TRAPS = {
  /* API */
  has: (target2, key) => {
    if (key === SYMBOL_STORE_UNTRACKED)
      return true;
    return key in target2;
  }
};
const getNode = (value, parent, equals) => {
  const store2 = new Proxy(value, STORE_TRAPS);
  const signal = (parent == null ? void 0 : parent.signal) || ROOT;
  const gettersAndSetters = getGettersAndSetters(value);
  const node = { parents: parent, store: store2, signal };
  if (gettersAndSetters) {
    const { getters, setters } = gettersAndSetters;
    if (getters)
      node.getters = getters;
    if (setters)
      node.setters = setters;
  }
  if (equals === false) {
    node.equals = nope;
  } else if (equals) {
    node.equals = equals;
  } else if (parent == null ? void 0 : parent.equals) {
    node.equals = parent.equals;
  }
  NODES.set(value, node);
  return node;
};
const getNodeExisting = (value) => {
  const node = NODES.get(value);
  if (!node)
    throw new Error("Impossible");
  return node;
};
const getNodeFromStore = (store2) => {
  return getNodeExisting(getTarget(store2));
};
const getNodeKeys = (node) => {
  const observable2 = getNodeObservable(node, 0, { equals: false });
  const keys2 = new StoreKeys(node, observable2);
  return keys2;
};
const getNodeValues = (node) => {
  const observable2 = getNodeObservable(node, 0, { equals: false });
  const values = new StoreValues(node, observable2);
  return values;
};
const getNodeHas = (node, key, value) => {
  const observable2 = getNodeObservable(node, value);
  const has = new StoreHas(node, key, observable2);
  return has;
};
const getNodeObservable = (node, value, options) => {
  const observable2 = new Observable(value, options);
  observable2.signal = node.signal;
  return observable2;
};
const getNodeProperty = (node, key, value) => {
  const observable2 = void 0;
  const propertyNode = isProxiable(value) ? NODES.get(value) || getNode(value, node) : void 0;
  const property = new StoreProperty(node, key, observable2, propertyNode);
  node.properties || (node.properties = new StoreMap());
  node.properties.set(key, property);
  return property;
};
const getGettersAndSetters = (value) => {
  if (isArray$1(value))
    return void 0;
  let getters;
  let setters;
  const keys2 = Object.keys(value);
  for (let i = 0, l = keys2.length; i < l; i++) {
    const key = keys2[i];
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor)
      continue;
    const { get: get2, set } = descriptor;
    if (get2) {
      getters || (getters = new StoreMap());
      getters.set(key, get2);
    }
    if (set) {
      setters || (setters = new StoreMap());
      setters.set(key, set);
    }
  }
  if (!getters && !setters)
    return void 0;
  return { getters, setters };
};
const getStore = (value, options) => {
  if (isStore(value))
    return value;
  const node = NODES.get(value) || getNode(value, void 0, options == null ? void 0 : options.equals);
  return node.store;
};
const getTarget = (value) => {
  if (isStore(value))
    return value[SYMBOL_STORE_TARGET];
  return value;
};
const getUntracked = (value) => {
  if (!isObject$1(value))
    return value;
  if (isUntracked(value))
    return value;
  return new Proxy(value, STORE_UNTRACK_TRAPS);
};
const isEqualDescriptor = (a, b, equals) => {
  return !!a.configurable === !!b.configurable && !!a.enumerable === !!b.enumerable && !!a["writable"] === !!b["writable"] && equals(a["value"], b["value"]) && a.get === b.get && a.set === b.set;
};
const isListenable = () => {
  return TRACKING;
};
const isProxiable = (value) => {
  if (value === null || typeof value !== "object")
    return false;
  if (SYMBOL_STORE in value)
    return true;
  if (SYMBOL_STORE_UNTRACKED in value)
    return false;
  if (isArray$1(value))
    return true;
  const prototype = Object.getPrototypeOf(value);
  if (prototype === null)
    return true;
  return Object.getPrototypeOf(prototype) === null;
};
const isUntracked = (value) => {
  if (value === null || typeof value !== "object")
    return false;
  return SYMBOL_STORE_UNTRACKED in value;
};
const store = (value, options) => {
  if (!isObject$1(value))
    return value;
  if (isUntracked(value))
    return value;
  return getStore(value, options);
};
store.on = (target2, listener) => {
  const targets = castArray$1(target2);
  const selectors = targets.filter(isFunction$1);
  const nodes = targets.filter(isStore).map(getNodeFromStore);
  StoreListenersRegular.active += 1;
  const disposers = selectors.map((selector2) => {
    let inited = false;
    return reaction(() => {
      if (inited) {
        StoreListenersRegular.listeners.add(listener);
        StoreScheduler.schedule();
      }
      inited = true;
      selector2();
    });
  });
  nodes.forEach((node) => {
    lazySetAdd(node, "listenersRegular", listener);
  });
  return () => {
    StoreListenersRegular.active -= 1;
    disposers.forEach((disposer) => {
      disposer();
    });
    nodes.forEach((node) => {
      lazySetDelete(node, "listenersRegular", listener);
    });
  };
};
store._onRoots = (target2, listener) => {
  if (!isStore(target2))
    return noop;
  const node = getNodeFromStore(target2);
  if (node.parents)
    throw new Error("Only top-level stores are supported");
  StoreListenersRoots.active += 1;
  lazySetAdd(node, "listenersRoots", listener);
  return () => {
    StoreListenersRoots.active -= 1;
    lazySetDelete(node, "listenersRoots", listener);
  };
};
store.reconcile = (() => {
  const getType = (value) => {
    if (isArray$1(value))
      return 1;
    if (isProxiable(value))
      return 2;
    return 0;
  };
  const reconcileOuter = (prev, next) => {
    const uprev = getTarget(prev);
    const unext = getTarget(next);
    reconcileInner(prev, next);
    const prevType = getType(uprev);
    const nextType = getType(unext);
    if (prevType === 1 || nextType === 1) {
      prev.length = next.length;
    }
    return prev;
  };
  const reconcileInner = (prev, next) => {
    const uprev = getTarget(prev);
    const unext = getTarget(next);
    const prevKeys = Object.keys(uprev);
    const nextKeys = Object.keys(unext);
    for (let i = 0, l = nextKeys.length; i < l; i++) {
      const key = nextKeys[i];
      const prevValue = uprev[key];
      const nextValue = unext[key];
      if (!is(prevValue, nextValue)) {
        const prevType = getType(prevValue);
        const nextType = getType(nextValue);
        if (prevType && prevType === nextType) {
          reconcileInner(prev[key], nextValue);
          if (prevType === 1) {
            prev[key].length = nextValue.length;
          }
        } else {
          prev[key] = nextValue;
        }
      } else if (prevValue === void 0 && !(key in uprev)) {
        prev[key] = void 0;
      }
    }
    for (let i = 0, l = prevKeys.length; i < l; i++) {
      const key = prevKeys[i];
      if (!(key in unext)) {
        delete prev[key];
      }
    }
    return prev;
  };
  const reconcile = (prev, next) => {
    return batch(() => {
      return untrack(() => {
        return reconcileOuter(prev, next);
      });
    });
  };
  return reconcile;
})();
store.untrack = (value) => {
  return getUntracked(value);
};
store.unwrap = (value) => {
  return getTarget(value);
};
function observable(value, options) {
  return writable(new Observable(value, options));
}
const _with = () => {
  const owner2 = OWNER;
  return (fn) => {
    return owner2.wrap(() => fn());
  };
};
const HMR = !!globalThis.VOBY_HMR;
const SYMBOL_TEMPLATE_ACCESSOR = Symbol("Template Accessor");
const SYMBOLS_DIRECTIVES = {};
const SYMBOL_CLONE = Symbol("CloneElement");
const { assign } = Object;
const castArray = (value) => {
  return isArray(value) ? value : [value];
};
const flatten = (arr) => {
  for (let i = 0, l = arr.length; i < l; i++) {
    if (!isArray(arr[i]))
      continue;
    return arr.flat(Infinity);
  }
  return arr;
};
const { isArray } = Array;
const isBoolean = (value) => {
  return typeof value === "boolean";
};
const isFunction = (value) => {
  return typeof value === "function";
};
const isNil = (value) => {
  return value === null || value === void 0;
};
const isNode = (value) => {
  return value instanceof Node;
};
const isString = (value) => {
  return typeof value === "string";
};
const isSVG = (value) => {
  return !!value["isSVG"];
};
const isSVGElement = (() => {
  const svgRe = /^(t(ext$|s)|s[vwy]|g)|^set|tad|ker|p(at|s)|s(to|c$|ca|k)|r(ec|cl)|ew|us|f($|e|s)|cu|n[ei]|l[ty]|[GOP]/;
  const svgCache = {};
  return (element) => {
    const cached = svgCache[element];
    return cached !== void 0 ? cached : svgCache[element] = !element.includes("-") && svgRe.test(element);
  };
})();
const isTemplateAccessor = (value) => {
  return isFunction(value) && SYMBOL_TEMPLATE_ACCESSOR in value;
};
const useMicrotask = (fn) => {
  const disposed$1 = disposed();
  const runWithOwner = _with();
  queueMicrotask(() => {
    if (disposed$1())
      return;
    runWithOwner(fn);
  });
};
const useMicrotask$1 = useMicrotask;
const wrapElement = (element) => {
  element[SYMBOL_UNTRACKED_UNWRAPPED] = true;
  return element;
};
const wrapElement$1 = wrapElement;
const wrapCloneElement = (target2, component, props) => {
  target2[SYMBOL_CLONE] = { component, props };
  return target2;
};
const { createComment, createHTMLNode, createSVGNode, createText, createDocumentFragment } = (() => {
  if (typeof via !== "undefined") {
    const document2 = via.document;
    const createComment2 = document2.createComment;
    const createHTMLNode2 = document2.createElement;
    const createSVGNode2 = (name) => document2.createElementNS("http://www.w3.org/2000/svg", name);
    const createText2 = document2.createTextNode;
    const createDocumentFragment2 = document2.createDocumentFragment;
    return { createComment: createComment2, createHTMLNode: createHTMLNode2, createSVGNode: createSVGNode2, createText: createText2, createDocumentFragment: createDocumentFragment2 };
  } else {
    const createComment2 = document.createComment.bind(document, "");
    const createHTMLNode2 = document.createElement.bind(document);
    const createSVGNode2 = document.createElementNS.bind(document, "http://www.w3.org/2000/svg");
    const createText2 = document.createTextNode.bind(document);
    const createDocumentFragment2 = document.createDocumentFragment.bind(document);
    return { createComment: createComment2, createHTMLNode: createHTMLNode2, createSVGNode: createSVGNode2, createText: createText2, createDocumentFragment: createDocumentFragment2 };
  }
})();
const target = (observable2) => SYMBOL_OBSERVABLE_FROZEN in observable2 ? observable2 : observable2(SYMBOL_OBSERVABLE);
class Callable {
  /* CONSTRUCTOR */
  constructor(observable2) {
    this.observable = target(observable2);
  }
  /* API */
  init(observable2) {
    on(this.observable, this);
    this.call(observable2, untrack(observable2));
    cleanup(this);
  }
  call() {
    if (arguments.length === 1) {
      this.cleanup();
    } else {
      this.update(arguments[1], arguments[2]);
    }
  }
  cleanup() {
    off(this.observable, this);
  }
}
class CallableAttributeStatic extends Callable {
  /* CONSTRUCTOR */
  constructor(observable2, element, key) {
    super(observable2);
    this.element = element;
    this.key = key;
    this.init(observable2);
  }
  /* API */
  update(value) {
    setAttributeStatic(this.element, this.key, value);
  }
}
class CallableClassStatic extends Callable {
  /* CONSTRUCTOR */
  constructor(observable2, element, key) {
    super(observable2);
    this.element = element;
    this.key = key;
    this.init(observable2);
  }
  /* API */
  update(value) {
    setClassStatic(this.element, this.key, value);
  }
}
class CallableClassBooleanStatic extends Callable {
  /* CONSTRUCTOR */
  constructor(observable2, element, value) {
    super(observable2);
    this.element = element;
    this.value = value;
    this.init(observable2);
  }
  /* API */
  update(key, keyPrev) {
    setClassBooleanStatic(this.element, this.value, key, keyPrev);
  }
}
class CallableEventStatic extends Callable {
  /* CONSTRUCTOR */
  constructor(observable2, element, event) {
    super(observable2);
    this.element = element;
    this.event = event;
    this.init(observable2);
  }
  /* API */
  update(value) {
    setEventStatic(this.element, this.event, value);
  }
}
class CallablePropertyStatic extends Callable {
  /* CONSTRUCTOR */
  constructor(observable2, element, key) {
    super(observable2);
    this.element = element;
    this.key = key;
    this.init(observable2);
  }
  /* API */
  update(value) {
    setPropertyStatic(this.element, this.key, value);
  }
}
class CallableStyleStatic extends Callable {
  /* CONSTRUCTOR */
  constructor(observable2, element, key) {
    super(observable2);
    this.element = element;
    this.key = key;
    this.init(observable2);
  }
  /* API */
  update(value) {
    setStyleStatic(this.element, this.key, value);
  }
}
class CallableStylesStatic extends Callable {
  /* CONSTRUCTOR */
  constructor(observable2, element) {
    super(observable2);
    this.element = element;
    this.init(observable2);
  }
  /* API */
  update(object, objectPrev) {
    setStylesStatic(this.element, object, objectPrev);
  }
}
const classesToggle = (element, classes, force) => {
  const { className } = element;
  if (isString(className)) {
    if (!className) {
      if (force) {
        element.className = classes;
        return;
      } else {
        return;
      }
    } else if (!force && className === classes) {
      element.className = "";
      return;
    }
  }
  if (classes.includes(" ")) {
    classes.split(" ").forEach((cls) => {
      if (!cls.length)
        return;
      element.classList.toggle(cls, !!force);
    });
  } else {
    element.classList.toggle(classes, !!force);
  }
};
const dummyNode = createComment("");
const beforeDummyWrapper = [dummyNode];
const afterDummyWrapper = [dummyNode];
const diff = (parent, before, after, nextSibling) => {
  if (before === after)
    return;
  if (before instanceof Node) {
    beforeDummyWrapper[0] = before;
    before = beforeDummyWrapper;
  }
  if (after instanceof Node) {
    afterDummyWrapper[0] = after;
    after = afterDummyWrapper;
  }
  const bLength = after.length;
  let aEnd = before.length;
  let bEnd = bLength;
  let aStart = 0;
  let bStart = 0;
  let map = null;
  let removable;
  while (aStart < aEnd || bStart < bEnd) {
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? after[bStart - 1].nextSibling : after[bEnd - bStart] : nextSibling;
      if (bStart < bEnd) {
        if (node) {
          node.before.apply(node, after.slice(bStart, bEnd));
        } else {
          parent.append.apply(parent, after.slice(bStart, bEnd));
        }
        bStart = bEnd;
      }
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(before[aStart])) {
          removable = before[aStart];
          parent.removeChild(removable);
        }
        aStart++;
      }
    } else if (before[aStart] === after[bStart]) {
      aStart++;
      bStart++;
    } else if (before[aEnd - 1] === after[bEnd - 1]) {
      aEnd--;
      bEnd--;
    } else if (before[aStart] === after[bEnd - 1] && after[bStart] === before[aEnd - 1]) {
      const node = before[--aEnd].nextSibling;
      parent.insertBefore(
        after[bStart++],
        before[aStart++].nextSibling
      );
      parent.insertBefore(after[--bEnd], node);
      before[aEnd] = after[bEnd];
    } else {
      if (!map) {
        map = /* @__PURE__ */ new Map();
        let i = bStart;
        while (i < bEnd)
          map.set(after[i], i++);
      }
      if (map.has(before[aStart])) {
        const index = map.get(before[aStart]);
        if (bStart < index && index < bEnd) {
          let i = aStart;
          let sequence = 1;
          while (++i < aEnd && i < bEnd && map.get(before[i]) === index + sequence)
            sequence++;
          if (sequence > index - bStart) {
            const node = before[aStart];
            if (bStart < index) {
              if (node) {
                node.before.apply(node, after.slice(bStart, index));
              } else {
                parent.append.apply(parent, after.slice(bStart, index));
              }
              bStart = index;
            }
          } else {
            parent.replaceChild(
              after[bStart++],
              before[aStart++]
            );
          }
        } else
          aStart++;
      } else {
        removable = before[aStart++];
        parent.removeChild(removable);
      }
    }
  }
  beforeDummyWrapper[0] = dummyNode;
  afterDummyWrapper[0] = dummyNode;
};
const diff$1 = diff;
const NOOP_CHILDREN = [];
const FragmentUtils = {
  make: () => {
    return {
      values: void 0,
      length: 0
    };
  },
  makeWithNode: (node) => {
    return {
      values: node,
      length: 1
    };
  },
  makeWithFragment: (fragment) => {
    return {
      values: fragment,
      fragmented: true,
      length: 1
    };
  },
  getChildrenFragmented: (thiz, children = []) => {
    const { values, length } = thiz;
    if (!length)
      return children;
    if (values instanceof Array) {
      for (let i = 0, l = values.length; i < l; i++) {
        const value = values[i];
        if (value instanceof Node) {
          children.push(value);
        } else {
          FragmentUtils.getChildrenFragmented(value, children);
        }
      }
    } else {
      if (values instanceof Node) {
        children.push(values);
      } else {
        FragmentUtils.getChildrenFragmented(values, children);
      }
    }
    return children;
  },
  getChildren: (thiz) => {
    if (!thiz.length)
      return NOOP_CHILDREN;
    if (!thiz.fragmented)
      return thiz.values;
    if (thiz.length === 1)
      return FragmentUtils.getChildren(thiz.values);
    return FragmentUtils.getChildrenFragmented(thiz);
  },
  pushFragment: (thiz, fragment) => {
    FragmentUtils.pushValue(thiz, fragment);
    thiz.fragmented = true;
  },
  pushNode: (thiz, node) => {
    FragmentUtils.pushValue(thiz, node);
  },
  pushValue: (thiz, value) => {
    const { values, length } = thiz;
    if (length === 0) {
      thiz.values = value;
    } else if (length === 1) {
      thiz.values = [values, value];
    } else {
      values.push(value);
    }
    thiz.length += 1;
  },
  replaceWithNode: (thiz, node) => {
    thiz.values = node;
    delete thiz.fragmented;
    thiz.length = 1;
  },
  replaceWithFragment: (thiz, fragment) => {
    thiz.values = fragment.values;
    thiz.fragmented = fragment.fragmented;
    thiz.length = fragment.length;
  }
};
const FragmentUtils$1 = FragmentUtils;
const resolveChild = (value, setter, _dynamic = false) => {
  if (isFunction(value)) {
    if (SYMBOL_UNTRACKED_UNWRAPPED in value || SYMBOL_OBSERVABLE_FROZEN in value)
      resolveChild(value(), setter, _dynamic);
    else
      reaction(() => {
        resolveChild(value(), setter, true);
      });
  } else if (isArray(value)) {
    const [values, hasObservables] = resolveArraysAndStatics(value);
    values[SYMBOL_UNCACHED] = value[SYMBOL_UNCACHED];
    setter(values, hasObservables || _dynamic);
  } else {
    setter(value, _dynamic);
  }
};
const resolveClass = (classes, resolved = {}) => {
  if (isString(classes)) {
    classes.split(/\s+/g).filter(Boolean).filter((cls) => {
      resolved[cls] = true;
    });
  } else if (isFunction(classes)) {
    resolveClass(classes(), resolved);
  } else if (isArray(classes)) {
    classes.forEach((cls) => {
      resolveClass(cls, resolved);
    });
  } else if (classes) {
    for (const key in classes) {
      const value = classes[key];
      const isActive = !!get(value);
      if (!isActive)
        continue;
      resolved[key] = true;
    }
  }
  return resolved;
};
const resolveArraysAndStatics = (() => {
  const DUMMY_RESOLVED = [];
  const resolveArraysAndStaticsInner = (values, resolved, hasObservables) => {
    for (let i = 0, l = values.length; i < l; i++) {
      const value = values[i];
      const type = typeof value;
      if (type === "string" || type === "number" || type === "bigint") {
        if (resolved === DUMMY_RESOLVED)
          resolved = values.slice(0, i);
        resolved.push(createText(value));
      } else if (type === "object" && isArray(value)) {
        if (resolved === DUMMY_RESOLVED)
          resolved = values.slice(0, i);
        hasObservables = resolveArraysAndStaticsInner(value, resolved, hasObservables)[1];
      } else if (type === "function" && isObservable(value)) {
        if (resolved !== DUMMY_RESOLVED)
          resolved.push(value);
        hasObservables = true;
      } else {
        if (resolved !== DUMMY_RESOLVED)
          resolved.push(value);
      }
    }
    if (resolved === DUMMY_RESOLVED)
      resolved = values;
    return [resolved, hasObservables];
  };
  return (values) => {
    return resolveArraysAndStaticsInner(values, DUMMY_RESOLVED, false);
  };
})();
const setAttributeStatic = (() => {
  const attributesBoolean = /* @__PURE__ */ new Set(["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"]);
  const attributeCamelCasedRe = /e(r[HRWrv]|[Vawy])|Con|l(e[Tcs]|c)|s(eP|y)|a(t[rt]|u|v)|Of|Ex|f[XYa]|gt|hR|d[Pg]|t[TXYd]|[UZq]/;
  const attributesCache = {};
  const uppercaseRe = /[A-Z]/g;
  const normalizeKeySvg = (key) => {
    return attributesCache[key] || (attributesCache[key] = attributeCamelCasedRe.test(key) ? key : key.replace(uppercaseRe, (char) => `-${char.toLowerCase()}`));
  };
  return (element, key, value) => {
    if (isSVG(element)) {
      key = key === "xlinkHref" || key === "xlink:href" ? "href" : normalizeKeySvg(key);
      if (isNil(value) || value === false && attributesBoolean.has(key)) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, String(value));
      }
    } else {
      if (isNil(value) || value === false && attributesBoolean.has(key)) {
        element.removeAttribute(key);
      } else {
        value = value === true ? "" : String(value);
        element.setAttribute(key, value);
      }
    }
  };
})();
const setAttribute = (element, key, value) => {
  if (isFunction(value)) {
    if (isObservable(value)) {
      new CallableAttributeStatic(value, element, key);
    } else {
      reaction(() => {
        setAttributeStatic(element, key, value());
      });
    }
  } else {
    setAttributeStatic(element, key, value);
  }
};
const setChildReplacementText = (child, childPrev) => {
  if (childPrev.nodeType === 3) {
    childPrev.nodeValue = child;
    return childPrev;
  } else {
    const parent = childPrev.parentElement;
    if (!parent)
      throw new Error("Invalid child replacement");
    const textNode = createText(child);
    parent.replaceChild(textNode, childPrev);
    return textNode;
  }
};
const setChildStatic = (parent, fragment, child, dynamic) => {
  if (!dynamic && child === void 0)
    return;
  const prev = FragmentUtils$1.getChildren(fragment);
  const prevIsArray = prev instanceof Array;
  const prevLength = prevIsArray ? prev.length : 1;
  const prevFirst = prevIsArray ? prev[0] : prev;
  const prevLast = prevIsArray ? prev[prevLength - 1] : prev;
  const prevSibling = (prevLast == null ? void 0 : prevLast.nextSibling) || null;
  if (prevLength === 0) {
    const type = typeof child;
    if (type === "string" || type === "number" || type === "bigint") {
      const textNode = createText(child);
      parent.appendChild(textNode);
      FragmentUtils$1.replaceWithNode(fragment, textNode);
      return;
    } else if (type === "object" && child !== null && typeof child.nodeType === "number") {
      const node = child;
      parent.insertBefore(node, null);
      FragmentUtils$1.replaceWithNode(fragment, node);
      return;
    }
  }
  if (prevLength === 1) {
    const type = typeof child;
    if (type === "string" || type === "number" || type === "bigint") {
      const node = setChildReplacementText(String(child), prevFirst);
      FragmentUtils$1.replaceWithNode(fragment, node);
      return;
    }
  }
  const fragmentNext = FragmentUtils$1.make();
  const children = Array.isArray(child) ? child : [child];
  let nextHasStaticChildren = false;
  for (let i = 0, l = children.length; i < l; i++) {
    const child2 = children[i];
    const type = typeof child2;
    if (type === "string" || type === "number" || type === "bigint") {
      nextHasStaticChildren = true;
      FragmentUtils$1.pushNode(fragmentNext, createText(child2));
    } else if (type === "object" && child2 !== null && typeof child2.nodeType === "number") {
      nextHasStaticChildren = true;
      FragmentUtils$1.pushNode(fragmentNext, child2);
    } else if (type === "function") {
      const fragment2 = FragmentUtils$1.make();
      FragmentUtils$1.pushFragment(fragmentNext, fragment2);
      resolveChild(child2, setChildStatic.bind(void 0, parent, fragment2));
    }
  }
  let next = FragmentUtils$1.getChildren(fragmentNext);
  let nextLength = fragmentNext.length;
  let nextHasDynamicChildren = !nextHasStaticChildren && nextLength > 0;
  if (nextLength === 0 && prevLength === 1 && prevFirst.nodeType === 8) {
    return;
  }
  if (nextLength === 0 || prevLength === 1 && prevFirst.nodeType === 8 || children[SYMBOL_UNCACHED]) {
    const { childNodes } = parent;
    if (childNodes.length === prevLength) {
      parent.textContent = "";
      if (nextLength === 0) {
        const placeholder = createComment("");
        FragmentUtils$1.pushNode(fragmentNext, placeholder);
        if (next !== fragmentNext.values) {
          next = placeholder;
          nextLength += 1;
        }
      }
      if (prevSibling) {
        if (next instanceof Array) {
          prevSibling.before.apply(prevSibling, next);
        } else {
          parent.insertBefore(next, prevSibling);
        }
      } else {
        if (next instanceof Array) {
          parent.append.apply(parent, next);
        } else {
          parent.append(next);
        }
      }
      FragmentUtils$1.replaceWithFragment(fragment, fragmentNext);
      return;
    }
  }
  if (nextLength === 0) {
    const placeholder = createComment("");
    FragmentUtils$1.pushNode(fragmentNext, placeholder);
    if (next !== fragmentNext.values) {
      next = placeholder;
      nextLength += 1;
    }
  }
  if (prevLength > 0 || nextHasStaticChildren || !nextHasDynamicChildren) {
    try {
      diff$1(parent, prev, next, prevSibling);
    } catch (error) {
      if (HMR) {
        console.error(error);
      } else {
        throw error;
      }
    }
  }
  FragmentUtils$1.replaceWithFragment(fragment, fragmentNext);
};
const setChild = (parent, child, fragment = FragmentUtils$1.make()) => {
  resolveChild(child, setChildStatic.bind(void 0, parent, fragment));
};
const setClassStatic = classesToggle;
const setClass = (element, key, value) => {
  if (isFunction(value)) {
    if (isObservable(value)) {
      new CallableClassStatic(value, element, key);
    } else {
      reaction(() => {
        setClassStatic(element, key, value());
      });
    }
  } else {
    setClassStatic(element, key, value);
  }
};
const setClassBooleanStatic = (element, value, key, keyPrev) => {
  if (keyPrev && keyPrev !== true) {
    setClassStatic(element, keyPrev, false);
  }
  if (key && key !== true) {
    setClassStatic(element, key, value);
  }
};
const setClassBoolean = (element, value, key) => {
  if (isFunction(key)) {
    if (isObservable(key)) {
      new CallableClassBooleanStatic(key, element, value);
    } else {
      let keyPrev;
      reaction(() => {
        const keyNext = key();
        setClassBooleanStatic(element, value, keyNext, keyPrev);
        keyPrev = keyNext;
      });
    }
  } else {
    setClassBooleanStatic(element, value, key);
  }
};
const setClassesStatic = (element, object, objectPrev) => {
  if (isString(object)) {
    if (isSVG(element)) {
      element.setAttribute("class", object);
    } else {
      element.className = object;
    }
  } else {
    if (objectPrev) {
      if (isString(objectPrev)) {
        if (objectPrev) {
          if (isSVG(element)) {
            element.setAttribute("class", "");
          } else {
            element.className = "";
          }
        }
      } else if (isArray(objectPrev)) {
        objectPrev = store.unwrap(objectPrev);
        for (let i = 0, l = objectPrev.length; i < l; i++) {
          if (!objectPrev[i])
            continue;
          setClassBoolean(element, false, objectPrev[i]);
        }
      } else {
        objectPrev = store.unwrap(objectPrev);
        for (const key in objectPrev) {
          if (object && key in object)
            continue;
          setClass(element, key, false);
        }
      }
    }
    if (isArray(object)) {
      if (isStore(object)) {
        for (let i = 0, l = object.length; i < l; i++) {
          const fn = untrack(() => isFunction(object[i]) ? object[i] : object[SYMBOL_STORE_OBSERVABLE](String(i)));
          setClassBoolean(element, true, fn);
        }
      } else {
        for (let i = 0, l = object.length; i < l; i++) {
          if (!object[i])
            continue;
          setClassBoolean(element, true, object[i]);
        }
      }
    } else {
      if (isStore(object)) {
        for (const key in object) {
          const fn = untrack(() => isFunction(object[key]) ? object[key] : object[SYMBOL_STORE_OBSERVABLE](key));
          setClass(element, key, fn);
        }
      } else {
        for (const key in object) {
          setClass(element, key, object[key]);
        }
      }
    }
  }
};
const setClasses = (element, object) => {
  if (isFunction(object) || isArray(object)) {
    let objectPrev;
    reaction(() => {
      const objectNext = resolveClass(object);
      setClassesStatic(element, objectNext, objectPrev);
      objectPrev = objectNext;
    });
  } else {
    setClassesStatic(element, object);
  }
};
const setDirective = (() => {
  const runWithSuperRoot = _with();
  return (element, directive, args) => {
    const symbol = SYMBOLS_DIRECTIVES[directive] || Symbol();
    const data2 = runWithSuperRoot(() => context(symbol));
    if (!data2)
      throw new Error(`Directive "${directive}" not found`);
    const call = () => data2.fn(element, ...castArray(args));
    if (data2.immediate) {
      call();
    } else {
      useMicrotask$1(call);
    }
  };
})();
const setEventStatic = (() => {
  const delegatedEvents = {
    onauxclick: ["_onauxclick", false],
    onbeforeinput: ["_onbeforeinput", false],
    onclick: ["_onclick", false],
    ondblclick: ["_ondblclick", false],
    onfocusin: ["_onfocusin", false],
    onfocusout: ["_onfocusout", false],
    oninput: ["_oninput", false],
    onkeydown: ["_onkeydown", false],
    onkeyup: ["_onkeyup", false],
    onmousedown: ["_onmousedown", false],
    onmouseup: ["_onmouseup", false]
  };
  const delegate = (event) => {
    const key = `_${event}`;
    document.addEventListener(event.slice(2), (event2) => {
      const targets = event2.composedPath();
      let target2 = null;
      Object.defineProperty(event2, "currentTarget", {
        configurable: true,
        get() {
          return target2;
        }
      });
      for (let i = 0, l = targets.length; i < l; i++) {
        target2 = targets[i];
        const handler = target2[key];
        if (!handler)
          continue;
        handler(event2);
        if (event2.cancelBubble)
          break;
      }
      target2 = null;
    });
  };
  return (element, event, value) => {
    const delegated = delegatedEvents[event];
    if (delegated) {
      if (!delegated[1]) {
        delegated[1] = true;
        delegate(event);
      }
      element[delegated[0]] = value;
    } else if (event.endsWith("passive")) {
      const isCapture = event.endsWith("capturepassive");
      const type = event.slice(2, -7 - (isCapture ? 7 : 0));
      const key = `_${event}`;
      const valuePrev = element[key];
      if (valuePrev)
        element.removeEventListener(type, valuePrev, { capture: isCapture });
      if (value)
        element.addEventListener(type, value, { passive: true, capture: isCapture });
      element[key] = value;
    } else if (event.endsWith("capture")) {
      const type = event.slice(2, -7);
      const key = `_${event}`;
      const valuePrev = element[key];
      if (valuePrev)
        element.removeEventListener(type, valuePrev, { capture: true });
      if (value)
        element.addEventListener(type, value, { capture: true });
      element[key] = value;
    } else {
      element[event] = value;
    }
  };
})();
const setEvent = (element, event, value) => {
  if (isObservable(value)) {
    new CallableEventStatic(value, element, event);
  } else {
    setEventStatic(element, event, value);
  }
};
const setHTMLStatic = (element, value) => {
  element.innerHTML = String(isNil(value) ? "" : value);
};
const setHTML = (element, value) => {
  reaction(() => {
    setHTMLStatic(element, get(get(value).__html));
  });
};
const setPropertyStatic = (element, key, value) => {
  if (key === "tabIndex" && isBoolean(value)) {
    value = value ? 0 : void 0;
  }
  if (key === "value" && element.tagName === "SELECT" && !element["_$inited"]) {
    element["_$inited"] = true;
    queueMicrotask(() => element[key] = value);
  }
  element[key] = value;
  if (isNil(value)) {
    setAttributeStatic(element, key, null);
  }
};
const setProperty = (element, key, value) => {
  if (isFunction(value)) {
    if (isObservable(value)) {
      new CallablePropertyStatic(value, element, key);
    } else {
      reaction(() => {
        setPropertyStatic(element, key, value());
      });
    }
  } else {
    setPropertyStatic(element, key, value);
  }
};
const setRef = (element, value) => {
  if (isNil(value))
    return;
  const values = flatten(castArray(value));
  useMicrotask$1(() => values.forEach((value2) => value2 == null ? void 0 : value2(element)));
};
const setStyleStatic = (() => {
  const propertyNonDimensionalRe = /^(-|f[lo].*[^se]$|g.{5,}[^ps]$|z|o[pr]|(W.{5})?[lL]i.*(t|mp)$|an|(bo|s).{4}Im|sca|m.{6}[ds]|ta|c.*[st]$|wido|ini)/i;
  const propertyNonDimensionalCache = {};
  return (element, key, value) => {
    if (key.charCodeAt(0) === 45) {
      if (isNil(value)) {
        element.style.removeProperty(key);
      } else {
        element.style.setProperty(key, String(value));
      }
    } else if (isNil(value)) {
      element.style[key] = null;
    } else {
      element.style[key] = isString(value) || (propertyNonDimensionalCache[key] || (propertyNonDimensionalCache[key] = propertyNonDimensionalRe.test(key))) ? value : `${value}px`;
    }
  };
})();
const setStyle = (element, key, value) => {
  if (isFunction(value)) {
    if (isObservable(value)) {
      new CallableStyleStatic(value, element, key);
    } else {
      reaction(() => {
        setStyleStatic(element, key, value());
      });
    }
  } else {
    setStyleStatic(element, key, value);
  }
};
const setStylesStatic = (element, object, objectPrev) => {
  if (isString(object)) {
    element.setAttribute("style", object);
  } else {
    if (objectPrev) {
      if (isString(objectPrev)) {
        if (objectPrev) {
          element.style.cssText = "";
        }
      } else {
        objectPrev = store.unwrap(objectPrev);
        for (const key in objectPrev) {
          if (object && key in object)
            continue;
          setStyleStatic(element, key, null);
        }
      }
    }
    if (isStore(object)) {
      for (const key in object) {
        const fn = untrack(() => isFunction(object[key]) ? object[key] : object[SYMBOL_STORE_OBSERVABLE](key));
        setStyle(element, key, fn);
      }
    } else {
      for (const key in object) {
        setStyle(element, key, object[key]);
      }
    }
  }
};
const setStyles = (element, object) => {
  if (isFunction(object)) {
    if (isObservable(object)) {
      new CallableStylesStatic(object, element);
    } else {
      let objectPrev;
      reaction(() => {
        const objectNext = object();
        setStylesStatic(element, objectNext, objectPrev);
        objectPrev = objectNext;
      });
    }
  } else {
    setStylesStatic(element, object);
  }
};
const setTemplateAccessor = (element, key, value) => {
  if (key === "children") {
    const placeholder = createText("");
    element.insertBefore(placeholder, null);
    value(element, "setChildReplacement", void 0, placeholder);
  } else if (key === "ref") {
    value(element, "setRef");
  } else if (key === "style") {
    value(element, "setStyles");
  } else if (key === "class" || key === "className") {
    if (!isSVG(element)) {
      element.className = "";
    }
    value(element, "setClasses");
  } else if (key === "dangerouslySetInnerHTML") {
    value(element, "setHTML");
  } else if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
    value(element, "setEvent", key.toLowerCase());
  } else if (key.charCodeAt(0) === 117 && key.charCodeAt(3) === 58) {
    value(element, "setDirective", key.slice(4));
  } else if (key === "innerHTML" || key === "outerHTML" || key === "textContent")
    ;
  else if (key in element && !isSVG(element)) {
    value(element, "setProperty", key);
  } else {
    element.setAttribute(key, "");
    value(element, "setAttribute", key);
  }
};
const setProp = (element, key, value) => {
  if (isTemplateAccessor(value)) {
    setTemplateAccessor(element, key, value);
  } else if (key === "children") {
    setChild(element, value);
  } else if (key === "ref") {
    setRef(element, value);
  } else if (key === "style") {
    setStyles(element, value);
  } else if (key === "class" || key === "className") {
    setClasses(element, value);
  } else if (key === "dangerouslySetInnerHTML") {
    setHTML(element, value);
  } else if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
    setEvent(element, key.toLowerCase(), value);
  } else if (key.charCodeAt(0) === 117 && key.charCodeAt(3) === 58) {
    setDirective(element, key.slice(4), value);
  } else if (key === "innerHTML" || key === "outerHTML" || key === "textContent")
    ;
  else if (key in element && !isSVG(element)) {
    setProperty(element, key, value);
  } else {
    setAttribute(element, key, value);
  }
};
const setProps = (element, object) => {
  for (const key in object) {
    setProp(element, key, object[key]);
  }
};
const createElement = (component, props, _key, _isStatic, _source, _self) => {
  const { ...rest } = props;
  if (isFunction(component)) {
    const props2 = rest;
    return wrapElement$1(() => {
      return untrack(() => component.call(component, props2));
    });
  } else if (isString(component)) {
    const props2 = rest;
    const isSVG2 = isSVGElement(component);
    const createNode = isSVG2 ? createSVGNode : createHTMLNode;
    return wrapElement$1(() => {
      const child = createNode(component);
      if (isSVG2)
        child["isSVG"] = true;
      untrack(() => setProps(child, props2));
      return child;
    });
  } else if (isNode(component)) {
    return wrapElement$1(() => component);
  } else {
    throw new Error("Invalid component");
  }
};
const creatElement = createElement;
const jsx = (component, props, key) => {
  return wrapCloneElement(creatElement(component, props), component, props);
};
const WheelPicker$1 = "";
const prefixed = (prop) => {
  let style = document.createElement("div").style;
  let vendors = ["Webkit", "Moz", "ms", "O"];
  let name;
  if (prop in style)
    return prop;
  for (var i = 0, len = vendors.length; i < len; i++) {
    name = vendors[i] + prop.charAt(0).toUpperCase() + prop.substring(1);
    if (name in style)
      return name;
  }
  return null;
};
const getStyle = (el, prop) => {
  prop = prop.replace(/([A-Z])/g, "-$1");
  prop = prop.toLowerCase();
  return window.getComputedStyle(el, null).getPropertyValue(prop);
};
var n = function(t2, s, r, e) {
  var u;
  s[0] = 0;
  for (var h = 1; h < s.length; h++) {
    var p = s[h++], a = s[h] ? (s[0] |= p ? 1 : 2, r[s[h++]]) : s[++h];
    3 === p ? e[0] = a : 4 === p ? e[1] = Object.assign(e[1] || {}, a) : 5 === p ? (e[1] = e[1] || {})[s[++h]] = a : 6 === p ? e[1][s[++h]] += a + "" : p ? (u = t2.apply(a, n(t2, a, r, ["", null])), e.push(u), a[0] ? s[0] |= 2 : (s[h - 2] = 0, s[h] = u)) : e.push(a);
  }
  return e;
}, t = /* @__PURE__ */ new Map();
function htm(s) {
  var r = t.get(this);
  return r || (r = /* @__PURE__ */ new Map(), t.set(this, r)), (r = n(this, r.get(s) || (r.set(s, r = function(n2) {
    for (var t2, s2, r2 = 1, e = "", u = "", h = [0], p = function(n3) {
      1 === r2 && (n3 || (e = e.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h.push(0, n3, e) : 3 === r2 && (n3 || e) ? (h.push(3, n3, e), r2 = 2) : 2 === r2 && "..." === e && n3 ? h.push(4, n3, 0) : 2 === r2 && e && !n3 ? h.push(5, 0, true, e) : r2 >= 5 && ((e || !n3 && 5 === r2) && (h.push(r2, 0, e, s2), r2 = 6), n3 && (h.push(r2, n3, 0, s2), r2 = 6)), e = "";
    }, a = 0; a < n2.length; a++) {
      a && (1 === r2 && p(), p(a));
      for (var l = 0; l < n2[a].length; l++)
        t2 = n2[a][l], 1 === r2 ? "<" === t2 ? (p(), h = [h], r2 = 3) : e += t2 : 4 === r2 ? "--" === e && ">" === t2 ? (r2 = 1, e = "") : e = t2 + e[0] : u ? t2 === u ? u = "" : e += t2 : '"' === t2 || "'" === t2 ? u = t2 : ">" === t2 ? (p(), r2 = 1) : r2 && ("=" === t2 ? (r2 = 5, s2 = e, e = "") : "/" === t2 && (r2 < 5 || ">" === n2[a][l + 1]) ? (p(), 3 === r2 && (h = h[0]), r2 = h, (h = h[0]).push(2, 0, r2), r2 = 0) : " " === t2 || "	" === t2 || "\n" === t2 || "\r" === t2 ? (p(), r2 = 2) : e += t2), 3 === r2 && "!--" === e && (r2 = 4, h = h[0]);
    }
    return p(), h;
  }(s)), r), arguments, [])).length > 1 ? r : r[0];
}
const render = (child, parent) => {
  if (!parent || !(parent instanceof HTMLElement))
    throw new Error("Invalid parent node");
  parent.textContent = "";
  return root((dispose) => {
    setChild(parent, child);
    return () => {
      dispose();
      parent.textContent = "";
    };
  });
};
const render$1 = render;
var _a, _b;
!!((_b = (_a = globalThis.CDATASection) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a).match(/^\s*function\s+CDATASection\s*\(\s*\)\s*\{\s*\[native code\]\s*\}\s*$/));
const registry = {};
const h2 = (type, props, key, isStatic, source, self) => creatElement(registry[type] || type, props);
const register = (components) => void assign(registry, components);
assign(htm.bind(h2), { register });
const isTouch = (e) => !!e.touches;
const Wheel = (props) => {
  const {
    data: data2,
    rowHeight = 34,
    adjustTime = 400,
    bounceTime = 600,
    momentumThresholdTime = 300,
    momentumThresholdDistance = 10,
    value,
    resetSelectedOnDataChanged = false,
    width
  } = props;
  let { rows = 5 } = props;
  const _items = observable([]);
  const list = observable([]);
  const y = observable(0);
  const selectedIndex = observable(0);
  const isTransition = observable(false);
  const isTouching = observable(false);
  const easings = observable({
    scroll: "cubic-bezier(0.23, 1, 0.32, 1)",
    // easeOutQuint
    scrollBounce: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    // easeOutQuard
    bounce: "cubic-bezier(0.165, 0.84, 0.44, 1)"
    // easeOutQuart
  });
  const transformName = observable(prefixed("transform"));
  const transitionName = observable(prefixed("transition"));
  const wheel = observable();
  const scroller = observable();
  const wheelHeight = memo(() => {
    var _a2;
    return (_a2 = wheel()) == null ? void 0 : _a2.offsetHeight;
  });
  const maxScrollY = observable();
  const startY = observable();
  const lastY = observable();
  const startTime = observable();
  effect(() => {
    data2();
    if (get(resetSelectedOnDataChanged))
      selectedIndex(0);
  });
  effect(() => {
    if (get(rows) % 2 === 0)
      isObservable(rows) ? rows((r) => ++r) : rows++;
  });
  const _momentum = (current, start2, time, lowerMargin, wheelSize, deceleration, rowHeight2) => {
    let distance = current - start2;
    let speed = Math.abs(distance) / time;
    let destination;
    let duration;
    deceleration = deceleration === void 0 ? 6e-4 : deceleration;
    destination = current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
    duration = speed / deceleration;
    destination = Math.round(destination / rowHeight2) * rowHeight2;
    if (destination < lowerMargin) {
      destination = wheelSize ? lowerMargin - wheelSize / 2.5 * (speed / 8) : lowerMargin;
      distance = Math.abs(destination - current);
      duration = distance / speed;
    } else if (destination > 0) {
      destination = wheelSize ? wheelSize / 2.5 * (speed / 8) : 0;
      distance = Math.abs(current) + destination;
      duration = distance / speed;
    }
    return {
      destination: Math.round(destination),
      duration
    };
  };
  const _resetPosition = (duration) => {
    let yy = y();
    duration = duration || 0;
    if (yy > 0)
      yy = 0;
    if (yy < maxScrollY())
      yy = maxScrollY();
    if (yy === y())
      return false;
    _scrollTo(yy, duration, easings().bounce);
    return true;
  };
  const _getClosestSelectablePosition = (y2) => {
    var _a2;
    let index = Math.abs(Math.round(y2 / get(rowHeight)));
    const items = _items();
    if (!((_a2 = items[index]) == null ? void 0 : _a2.disabled))
      return y2;
    let max2 = Math.max(index, items.length - index);
    for (let i = 1; i <= max2; i++) {
      if (!items[index + i].disabled) {
        index += i;
        break;
      }
      if (!items[index - i].disabled) {
        index -= i;
        break;
      }
    }
    return index * -get(rowHeight);
  };
  const _scrollTo = (yy, duration, easing) => {
    if (y() === yy) {
      _scrollFinish();
      return false;
    }
    y(_getClosestSelectablePosition(yy));
    if (duration && duration > 0) {
      isTransition(true);
      scroller().style[transitionName()] = duration + "ms " + easing;
    } else {
      _scrollFinish();
    }
  };
  const _scrollFinish = () => {
    let newIndex = Math.abs(y() / get(rowHeight));
    if (selectedIndex() != newIndex) {
      selectedIndex(newIndex);
      const v = _items()[selectedIndex()];
      value(v);
    }
  };
  effect(() => {
    var _a2;
    const v = ((_a2 = value()) == null ? void 0 : _a2.value) ?? value();
    const i = data2().findIndex((vv, i2) => vv.value === v || vv === v);
    selectedIndex(i);
  });
  const _getCurrentY = () => {
    const matrixValues = getStyle(scroller(), transformName()).match(/-?\d+(\.\d+)?/g);
    return parseInt(matrixValues[matrixValues.length - 1]);
  };
  const _start = (event) => {
    event.preventDefault();
    const items = _items();
    if (!items.length)
      return;
    if (isTransition()) {
      isTransition(false);
      y(_getCurrentY());
      scroller().style[transitionName()] = "";
    }
    startY(y());
    lastY(isTouch(event) ? event.touches[0].pageY : event.pageY);
    startTime(Date.now());
    isTouching(true);
  };
  const _move = (event) => {
    if (!isTouching())
      return false;
    let yy = isTouch(event) ? event.changedTouches[0].pageY : event.pageY;
    let deltaY = yy - lastY();
    let targetY = y() + deltaY;
    let now = Date.now();
    lastY(yy);
    if (targetY > 0 || targetY < maxScrollY()) {
      targetY = y() + deltaY / 3;
    }
    y(Math.round(targetY));
    if (now - startTime() > get(momentumThresholdTime)) {
      startTime(now);
      startY(y());
    }
    return false;
  };
  const _end = (event) => {
    var _a2, _b2;
    if (!isTouching())
      return false;
    const deltaTime = Date.now() - startTime();
    let duration = get(adjustTime);
    let easing = easings().scroll;
    const distanceY = Math.abs(y() - startY());
    let momentumVals;
    let yy;
    isTouching(false);
    if (deltaTime < get(momentumThresholdTime) && distanceY <= 10 && ((_a2 = event.target) == null ? void 0 : _a2.classList.contains("wheelpicker-item"))) {
      const aid = +((_b2 = event.target) == null ? void 0 : _b2.getAttribute("_wsidx"));
      console.log(aid, -get(rowHeight), duration, easing);
      _scrollTo(aid * -get(rowHeight), duration, easing);
      return false;
    }
    if (_resetPosition(get(bounceTime)))
      return;
    if (deltaTime < get(momentumThresholdTime) && distanceY > get(momentumThresholdDistance)) {
      momentumVals = _momentum(y(), startY(), deltaTime, maxScrollY(), wheelHeight(), 7e-4, get(rowHeight));
      yy = momentumVals.destination;
      duration = momentumVals.duration;
    } else {
      yy = Math.round(y() / get(rowHeight)) * get(rowHeight);
    }
    if (yy > 0 || yy < maxScrollY()) {
      easing = easings().scrollBounce;
    }
    _scrollTo(yy, duration, easing);
  };
  const _transitionEnd = () => {
    isTransition(false);
    scroller().style[transitionName()] = "";
    if (!_resetPosition(get(bounceTime)))
      _scrollFinish();
  };
  effect(() => {
    const dt2 = data2();
    const lis = [];
    const items = [];
    console.log("build data", dt2);
    items.push(...dt2.map((item, idx) => {
      item = typeof item === "object" ? item : {
        text: item,
        value: item
      };
      let li = () => /* @__PURE__ */ jsx(
        "li",
        {
          class: ["wheelpicker-item", {
            //@ts-ignore
            "wheelpicker-item-disabled": item.disabled,
            "wheelpicker-item-selected": () => idx === selectedIndex()
          }],
          _wsidx: idx,
          children: item.text ?? item
        }
      );
      lis.push(li);
      return item;
    }));
    list(lis);
    _items(items);
    y(selectedIndex() * -get(rowHeight));
    maxScrollY(-get(rowHeight) * (dt2.length - 1));
    value(items[selectedIndex()]);
  });
  const _wheel = () => {
    let pid;
    let pwid;
    wheel().onwheel = (event) => {
      var _a2;
      let duration = get(adjustTime);
      let easing = easings().scroll;
      if (!event.target)
        return;
      const aid = +((_a2 = event.target) == null ? void 0 : _a2.getAttribute("_wsidx"));
      _scrollTo((pid = (aid === pwid ? pid : aid) + Math.sign(event.deltaY)) * -get(rowHeight), duration, easing);
      pwid = aid;
    };
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: wheel,
      class: "wheelpicker-wheel",
      style: { height: get(rowHeight) * get(rows) + "px", width },
      onTouchStart: _start,
      onTouchMove: _move,
      onTouchEnd: _end,
      onTouchCancel: _end,
      onMouseDown: _start,
      onMouseMove: _move,
      onMouseUp: _end,
      onMouseLeave: _end,
      onWheel: _wheel,
      children: /* @__PURE__ */ jsx("ul", { ref: scroller, class: "wheelpicker-wheel-scroller", style: { transform: () => "translate3d(0," + y() + "px,0)", marginTop: get(rowHeight) * Math.floor(get(rows) / 2) + "px" }, onTransitionEnd: _transitionEnd, children: list })
    }
  );
};
const WheelPicker = (props) => {
  const {
    data: data2,
    rows = 5,
    rowHeight = 34,
    onCancel,
    onShow,
    disabled,
    hidden,
    value,
    tempValue: tempValue2,
    title,
    hideOnBackdrop,
    resetSelectedOnDataChanged
  } = props;
  const control = observable();
  const closed = observable(true);
  const container = observable();
  const restore = observable();
  const cancelled = observable();
  const oriValue = value.map((v) => v());
  effect(() => {
    if (!Array.isArray(value))
      console.error("value must be array.");
    if (!Array.isArray(tempValue2))
      console.error("tempValue must be array.");
    const d = data2;
    if (!Array.isArray(value) || d.length !== value.length)
      throw new Error("value & data not in same dimension");
    if (!Array.isArray(tempValue2) || d.length !== tempValue2.length)
      throw new Error("tempValue & data not in same dimension");
    d.forEach((dd, i) => {
      if (!value[i])
        value[i] = observable(d[i]()[0]);
      if (!value[i]())
        value[i](d[i]()[0]);
      tempValue2[i](value[i]());
    });
  });
  data2.forEach((_, i) => {
    oriValue[i] = value[i]();
  });
  const shown = observable(false);
  const _onFocus = (event) => {
    event.target.blur();
    show();
  };
  const _backdropTransEnd = () => {
    if (!shown()) {
      container().style.display = "none";
      closed(true);
    }
  };
  const _set = (silent) => {
    cancelled(false);
    if (silent === true)
      return;
    batch(() => value.forEach((v, i) => oriValue[i] = v(tempValue2[i]())));
    shown(false);
  };
  effect(() => {
    if (restore())
      batch(() => {
        tempValue2.forEach((v, i) => v(oriValue[i]));
        value.forEach((v, i) => v(oriValue[i]));
      });
  });
  const _cancel = () => {
    cancelled(restore(true));
    batch(() => tempValue2.forEach((v, i) => v(value[i]())));
    onCancel == null ? void 0 : onCancel();
    shown(false);
  };
  const show = () => {
    if (get(disabled) || !closed())
      return;
    let cont = container();
    closed(restore(false));
    cont.style.display = "block";
    shown(true);
    onShow == null ? void 0 : onShow();
  };
  const width = memo(() => 100 / data2.filter((f) => !!f()).length + "%");
  const ws = memo(() => data2.map((v, i) => /* @__PURE__ */ jsx(
    Wheel,
    {
      rows,
      rowHeight,
      width,
      data: v,
      resetSelectedOnDataChanged,
      value: tempValue2[i]
    }
  )));
  const height = get(rowHeight) * Math.floor(get(rows) / 2) - 1 + "px";
  return /* @__PURE__ */ jsx("div", { readOnly: true, className: [
    "wheelpicker-control"
    /* , {'wheelpicker-hiddeninput':hiddenInput} */
  ], onFocus: _onFocus, onClick: _onFocus, children: [
    control() ?? /* @__PURE__ */ jsx("input", { type: "text", disabled, hidden, value: () => tempValue2.map((v) => {
      var _a2;
      return ((_a2 = v()) == null ? void 0 : _a2.value) ?? v();
    }) }),
    /* @__PURE__ */ jsx("div", { ref: container, className: "wheelpicker", class: [{ "shown": shown }], children: [
      /* @__PURE__ */ jsx("div", { class: "wheelpicker-backdrop", onTransitionEnd: _backdropTransEnd, onClick: get(hideOnBackdrop) ? _cancel : null }),
      /* @__PURE__ */ jsx("div", { class: "wheelpicker-panel", children: [
        /* @__PURE__ */ jsx("div", { class: "wheelpicker-actions", children: [
          /* @__PURE__ */ jsx("button", { type: "button", class: "btn-cancel", onClick: _cancel, children: "取消" }),
          /* @__PURE__ */ jsx("button", { type: "button", class: "btn-set", onClick: () => _set(), children: "确定" }),
          /* @__PURE__ */ jsx("h4", { class: "wheelpicker-title", children: get(title) })
        ] }),
        /* @__PURE__ */ jsx("div", { class: "wheelpicker-main", children: [
          /* @__PURE__ */ jsx("div", { class: "wheelpicker-wheels", children: ws }),
          /* @__PURE__ */ jsx("div", { class: "wheelpicker-mask wheelpicker-mask-top", style: { height } }),
          /* @__PURE__ */ jsx("div", { class: "wheelpicker-mask wheelpicker-mask-current" }),
          /* @__PURE__ */ jsx("div", { class: "wheelpicker-mask wheelpicker-mask-btm", style: { height } })
        ] })
      ] })
    ] })
  ] });
};
const data = {
  "北京市": {
    "市辖区": [
      "东城区",
      "西城区",
      "朝阳区",
      "丰台区",
      "石景山区",
      "海淀区",
      "门头沟区",
      "房山区",
      "通州区",
      "顺义区",
      "昌平区",
      "大兴区",
      "怀柔区",
      "平谷区",
      "密云区",
      "延庆区"
    ]
  },
  "天津市": {
    "市辖区": [
      "和平区",
      "河东区",
      "河西区",
      "南开区",
      "河北区",
      "红桥区",
      "东丽区",
      "西青区",
      "津南区",
      "北辰区",
      "武清区",
      "宝坻区",
      "滨海新区",
      "宁河区",
      "静海区",
      "蓟州区"
    ]
  },
  "河北省": {
    "石家庄市": [
      "长安区",
      "桥西区",
      "新华区",
      "井陉矿区",
      "裕华区",
      "藁城区",
      "鹿泉区",
      "栾城区",
      "井陉县",
      "正定县",
      "行唐县",
      "灵寿县",
      "高邑县",
      "深泽县",
      "赞皇县",
      "无极县",
      "平山县",
      "元氏县",
      "赵县",
      "石家庄高新技术产业开发区",
      "石家庄循环化工园区",
      "辛集市",
      "晋州市",
      "新乐市"
    ],
    "唐山市": [
      "路南区",
      "路北区",
      "古冶区",
      "开平区",
      "丰南区",
      "丰润区",
      "曹妃甸区",
      "滦南县",
      "乐亭县",
      "迁西县",
      "玉田县",
      "河北唐山芦台经济开发区",
      "唐山市汉沽管理区",
      "唐山高新技术产业开发区",
      "河北唐山海港经济开发区",
      "遵化市",
      "迁安市",
      "滦州市"
    ],
    "秦皇岛市": [
      "海港区",
      "山海关区",
      "北戴河区",
      "抚宁区",
      "青龙满族自治县",
      "昌黎县",
      "卢龙县",
      "秦皇岛市经济技术开发区",
      "北戴河新区"
    ],
    "邯郸市": [
      "邯山区",
      "丛台区",
      "复兴区",
      "峰峰矿区",
      "肥乡区",
      "永年区",
      "临漳县",
      "成安县",
      "大名县",
      "涉县",
      "磁县",
      "邱县",
      "鸡泽县",
      "广平县",
      "馆陶县",
      "魏县",
      "曲周县",
      "邯郸经济技术开发区",
      "邯郸冀南新区",
      "武安市"
    ],
    "邢台市": [
      "襄都区",
      "信都区",
      "任泽区",
      "南和区",
      "临城县",
      "内丘县",
      "柏乡县",
      "隆尧县",
      "宁晋县",
      "巨鹿县",
      "新河县",
      "广宗县",
      "平乡县",
      "威县",
      "清河县",
      "临西县",
      "河北邢台经济开发区",
      "南宫市",
      "沙河市"
    ],
    "保定市": [
      "竞秀区",
      "莲池区",
      "满城区",
      "清苑区",
      "徐水区",
      "涞水县",
      "阜平县",
      "定兴县",
      "唐县",
      "高阳县",
      "容城县",
      "涞源县",
      "望都县",
      "安新县",
      "易县",
      "曲阳县",
      "蠡县",
      "顺平县",
      "博野县",
      "雄县",
      "保定高新技术产业开发区",
      "保定白沟新城",
      "涿州市",
      "定州市",
      "安国市",
      "高碑店市"
    ],
    "张家口市": [
      "桥东区",
      "桥西区",
      "宣化区",
      "下花园区",
      "万全区",
      "崇礼区",
      "张北县",
      "康保县",
      "沽源县",
      "尚义县",
      "蔚县",
      "阳原县",
      "怀安县",
      "怀来县",
      "涿鹿县",
      "赤城县",
      "张家口经济开发区",
      "张家口市察北管理区",
      "张家口市塞北管理区"
    ],
    "承德市": [
      "双桥区",
      "双滦区",
      "鹰手营子矿区",
      "承德县",
      "兴隆县",
      "滦平县",
      "隆化县",
      "丰宁满族自治县",
      "宽城满族自治县",
      "围场满族蒙古族自治县",
      "承德高新技术产业开发区",
      "平泉市"
    ],
    "沧州市": [
      "新华区",
      "运河区",
      "沧县",
      "青县",
      "东光县",
      "海兴县",
      "盐山县",
      "肃宁县",
      "南皮县",
      "吴桥县",
      "献县",
      "孟村回族自治县",
      "河北沧州经济开发区",
      "沧州高新技术产业开发区",
      "沧州渤海新区",
      "泊头市",
      "任丘市",
      "黄骅市",
      "河间市"
    ],
    "廊坊市": [
      "安次区",
      "广阳区",
      "固安县",
      "永清县",
      "香河县",
      "大城县",
      "文安县",
      "大厂回族自治县",
      "廊坊经济技术开发区",
      "霸州市",
      "三河市"
    ],
    "衡水市": [
      "桃城区",
      "冀州区",
      "枣强县",
      "武邑县",
      "武强县",
      "饶阳县",
      "安平县",
      "故城县",
      "景县",
      "阜城县",
      "河北衡水高新技术产业开发区",
      "衡水滨湖新区",
      "深州市"
    ]
  },
  "山西省": {
    "太原市": [
      "小店区",
      "迎泽区",
      "杏花岭区",
      "尖草坪区",
      "万柏林区",
      "晋源区",
      "清徐县",
      "阳曲县",
      "娄烦县",
      "山西转型综合改革示范区",
      "古交市"
    ],
    "大同市": [
      "新荣区",
      "平城区",
      "云冈区",
      "云州区",
      "阳高县",
      "天镇县",
      "广灵县",
      "灵丘县",
      "浑源县",
      "左云县",
      "山西大同经济开发区"
    ],
    "阳泉市": [
      "城区",
      "矿区",
      "郊区",
      "平定县",
      "盂县"
    ],
    "长治市": [
      "潞州区",
      "上党区",
      "屯留区",
      "潞城区",
      "襄垣县",
      "平顺县",
      "黎城县",
      "壶关县",
      "长子县",
      "武乡县",
      "沁县",
      "沁源县",
      "山西长治高新技术产业园区"
    ],
    "晋城市": [
      "城区",
      "沁水县",
      "阳城县",
      "陵川县",
      "泽州县",
      "高平市"
    ],
    "朔州市": [
      "朔城区",
      "平鲁区",
      "山阴县",
      "应县",
      "右玉县",
      "山西朔州经济开发区",
      "怀仁市"
    ],
    "晋中市": [
      "榆次区",
      "太谷区",
      "榆社县",
      "左权县",
      "和顺县",
      "昔阳县",
      "寿阳县",
      "祁县",
      "平遥县",
      "灵石县",
      "介休市"
    ],
    "运城市": [
      "盐湖区",
      "临猗县",
      "万荣县",
      "闻喜县",
      "稷山县",
      "新绛县",
      "绛县",
      "垣曲县",
      "夏县",
      "平陆县",
      "芮城县",
      "永济市",
      "河津市"
    ],
    "忻州市": [
      "忻府区",
      "定襄县",
      "五台县",
      "代县",
      "繁峙县",
      "宁武县",
      "静乐县",
      "神池县",
      "五寨县",
      "岢岚县",
      "河曲县",
      "保德县",
      "偏关县",
      "五台山风景名胜区",
      "原平市"
    ],
    "临汾市": [
      "尧都区",
      "曲沃县",
      "翼城县",
      "襄汾县",
      "洪洞县",
      "古县",
      "安泽县",
      "浮山县",
      "吉县",
      "乡宁县",
      "大宁县",
      "隰县",
      "永和县",
      "蒲县",
      "汾西县",
      "侯马市",
      "霍州市"
    ],
    "吕梁市": [
      "离石区",
      "文水县",
      "交城县",
      "兴县",
      "临县",
      "柳林县",
      "石楼县",
      "岚县",
      "方山县",
      "中阳县",
      "交口县",
      "孝义市",
      "汾阳市"
    ]
  },
  "内蒙古自治区": {
    "呼和浩特市": [
      "新城区",
      "回民区",
      "玉泉区",
      "赛罕区",
      "土默特左旗",
      "托克托县",
      "和林格尔县",
      "清水河县",
      "武川县",
      "呼和浩特经济技术开发区"
    ],
    "包头市": [
      "东河区",
      "昆都仑区",
      "青山区",
      "石拐区",
      "白云鄂博矿区",
      "九原区",
      "土默特右旗",
      "固阳县",
      "达尔罕茂明安联合旗",
      "包头稀土高新技术产业开发区"
    ],
    "乌海市": [
      "海勃湾区",
      "海南区",
      "乌达区"
    ],
    "赤峰市": [
      "红山区",
      "元宝山区",
      "松山区",
      "阿鲁科尔沁旗",
      "巴林左旗",
      "巴林右旗",
      "林西县",
      "克什克腾旗",
      "翁牛特旗",
      "喀喇沁旗",
      "宁城县",
      "敖汉旗"
    ],
    "通辽市": [
      "科尔沁区",
      "科尔沁左翼中旗",
      "科尔沁左翼后旗",
      "开鲁县",
      "库伦旗",
      "奈曼旗",
      "扎鲁特旗",
      "通辽经济技术开发区",
      "霍林郭勒市"
    ],
    "鄂尔多斯市": [
      "东胜区",
      "康巴什区",
      "达拉特旗",
      "准格尔旗",
      "鄂托克前旗",
      "鄂托克旗",
      "杭锦旗",
      "乌审旗",
      "伊金霍洛旗"
    ],
    "呼伦贝尔市": [
      "海拉尔区",
      "扎赉诺尔区",
      "阿荣旗",
      "莫力达瓦达斡尔族自治旗",
      "鄂伦春自治旗",
      "鄂温克族自治旗",
      "陈巴尔虎旗",
      "新巴尔虎左旗",
      "新巴尔虎右旗",
      "满洲里市",
      "牙克石市",
      "扎兰屯市",
      "额尔古纳市",
      "根河市"
    ],
    "巴彦淖尔市": [
      "临河区",
      "五原县",
      "磴口县",
      "乌拉特前旗",
      "乌拉特中旗",
      "乌拉特后旗",
      "杭锦后旗"
    ],
    "乌兰察布市": [
      "集宁区",
      "卓资县",
      "化德县",
      "商都县",
      "兴和县",
      "凉城县",
      "察哈尔右翼前旗",
      "察哈尔右翼中旗",
      "察哈尔右翼后旗",
      "四子王旗",
      "丰镇市"
    ],
    "兴安盟": [
      "乌兰浩特市",
      "阿尔山市",
      "科尔沁右翼前旗",
      "科尔沁右翼中旗",
      "扎赉特旗",
      "突泉县"
    ],
    "锡林郭勒盟": [
      "二连浩特市",
      "锡林浩特市",
      "阿巴嘎旗",
      "苏尼特左旗",
      "苏尼特右旗",
      "东乌珠穆沁旗",
      "西乌珠穆沁旗",
      "太仆寺旗",
      "镶黄旗",
      "正镶白旗",
      "正蓝旗",
      "多伦县",
      "乌拉盖管委会"
    ],
    "阿拉善盟": [
      "阿拉善左旗",
      "阿拉善右旗",
      "额济纳旗",
      "内蒙古阿拉善高新技术产业开发区"
    ]
  },
  "辽宁省": {
    "沈阳市": [
      "和平区",
      "沈河区",
      "大东区",
      "皇姑区",
      "铁西区",
      "苏家屯区",
      "浑南区",
      "沈北新区",
      "于洪区",
      "辽中区",
      "康平县",
      "法库县",
      "新民市"
    ],
    "大连市": [
      "中山区",
      "西岗区",
      "沙河口区",
      "甘井子区",
      "旅顺口区",
      "金州区",
      "普兰店区",
      "长海县",
      "瓦房店市",
      "庄河市"
    ],
    "鞍山市": [
      "铁东区",
      "铁西区",
      "立山区",
      "千山区",
      "台安县",
      "岫岩满族自治县",
      "海城市"
    ],
    "抚顺市": [
      "新抚区",
      "东洲区",
      "望花区",
      "顺城区",
      "抚顺县",
      "新宾满族自治县",
      "清原满族自治县"
    ],
    "本溪市": [
      "平山区",
      "溪湖区",
      "明山区",
      "南芬区",
      "本溪满族自治县",
      "桓仁满族自治县"
    ],
    "丹东市": [
      "元宝区",
      "振兴区",
      "振安区",
      "宽甸满族自治县",
      "东港市",
      "凤城市"
    ],
    "锦州市": [
      "古塔区",
      "凌河区",
      "太和区",
      "黑山县",
      "义县",
      "凌海市",
      "北镇市"
    ],
    "营口市": [
      "站前区",
      "西市区",
      "鲅鱼圈区",
      "老边区",
      "盖州市",
      "大石桥市"
    ],
    "阜新市": [
      "海州区",
      "新邱区",
      "太平区",
      "清河门区",
      "细河区",
      "阜新蒙古族自治县",
      "彰武县"
    ],
    "辽阳市": [
      "白塔区",
      "文圣区",
      "宏伟区",
      "弓长岭区",
      "太子河区",
      "辽阳县",
      "灯塔市"
    ],
    "盘锦市": [
      "双台子区",
      "兴隆台区",
      "大洼区",
      "盘山县"
    ],
    "铁岭市": [
      "银州区",
      "清河区",
      "铁岭县",
      "西丰县",
      "昌图县",
      "调兵山市",
      "开原市"
    ],
    "朝阳市": [
      "双塔区",
      "龙城区",
      "朝阳县",
      "建平县",
      "喀喇沁左翼蒙古族自治县",
      "北票市",
      "凌源市"
    ],
    "葫芦岛市": [
      "连山区",
      "龙港区",
      "南票区",
      "绥中县",
      "建昌县",
      "兴城市"
    ]
  },
  "吉林省": {
    "长春市": [
      "南关区",
      "宽城区",
      "朝阳区",
      "二道区",
      "绿园区",
      "双阳区",
      "九台区",
      "农安县",
      "长春经济技术开发区",
      "长春净月高新技术产业开发区",
      "长春高新技术产业开发区",
      "长春汽车经济技术开发区",
      "榆树市",
      "德惠市",
      "公主岭市"
    ],
    "吉林市": [
      "昌邑区",
      "龙潭区",
      "船营区",
      "丰满区",
      "永吉县",
      "吉林经济开发区",
      "吉林高新技术产业开发区",
      "吉林中国新加坡食品区",
      "蛟河市",
      "桦甸市",
      "舒兰市",
      "磐石市"
    ],
    "四平市": [
      "铁西区",
      "铁东区",
      "梨树县",
      "伊通满族自治县",
      "双辽市"
    ],
    "辽源市": [
      "龙山区",
      "西安区",
      "东丰县",
      "东辽县"
    ],
    "通化市": [
      "东昌区",
      "二道江区",
      "通化县",
      "辉南县",
      "柳河县",
      "梅河口市",
      "集安市"
    ],
    "白山市": [
      "浑江区",
      "江源区",
      "抚松县",
      "靖宇县",
      "长白朝鲜族自治县",
      "临江市"
    ],
    "松原市": [
      "宁江区",
      "前郭尔罗斯蒙古族自治县",
      "长岭县",
      "乾安县",
      "吉林松原经济开发区",
      "扶余市"
    ],
    "白城市": [
      "洮北区",
      "镇赉县",
      "通榆县",
      "吉林白城经济开发区",
      "洮南市",
      "大安市"
    ],
    "延边朝鲜族自治州": [
      "延吉市",
      "图们市",
      "敦化市",
      "珲春市",
      "龙井市",
      "和龙市",
      "汪清县",
      "安图县"
    ]
  },
  "黑龙江省": {
    "哈尔滨市": [
      "道里区",
      "南岗区",
      "道外区",
      "平房区",
      "松北区",
      "香坊区",
      "呼兰区",
      "阿城区",
      "双城区",
      "依兰县",
      "方正县",
      "宾县",
      "巴彦县",
      "木兰县",
      "通河县",
      "延寿县",
      "尚志市",
      "五常市"
    ],
    "齐齐哈尔市": [
      "龙沙区",
      "建华区",
      "铁锋区",
      "昂昂溪区",
      "富拉尔基区",
      "碾子山区",
      "梅里斯达斡尔族区",
      "龙江县",
      "依安县",
      "泰来县",
      "甘南县",
      "富裕县",
      "克山县",
      "克东县",
      "拜泉县",
      "讷河市"
    ],
    "鸡西市": [
      "鸡冠区",
      "恒山区",
      "滴道区",
      "梨树区",
      "城子河区",
      "麻山区",
      "鸡东县",
      "虎林市",
      "密山市"
    ],
    "鹤岗市": [
      "向阳区",
      "工农区",
      "南山区",
      "兴安区",
      "东山区",
      "兴山区",
      "萝北县",
      "绥滨县"
    ],
    "双鸭山市": [
      "尖山区",
      "岭东区",
      "四方台区",
      "宝山区",
      "集贤县",
      "友谊县",
      "宝清县",
      "饶河县"
    ],
    "大庆市": [
      "萨尔图区",
      "龙凤区",
      "让胡路区",
      "红岗区",
      "大同区",
      "肇州县",
      "肇源县",
      "林甸县",
      "杜尔伯特蒙古族自治县",
      "大庆高新技术产业开发区"
    ],
    "伊春市": [
      "伊美区",
      "乌翠区",
      "友好区",
      "嘉荫县",
      "汤旺县",
      "丰林县",
      "大箐山县",
      "南岔县",
      "金林区",
      "铁力市"
    ],
    "佳木斯市": [
      "向阳区",
      "前进区",
      "东风区",
      "郊区",
      "桦南县",
      "桦川县",
      "汤原县",
      "同江市",
      "富锦市",
      "抚远市"
    ],
    "七台河市": [
      "新兴区",
      "桃山区",
      "茄子河区",
      "勃利县"
    ],
    "牡丹江市": [
      "东安区",
      "阳明区",
      "爱民区",
      "西安区",
      "林口县",
      "牡丹江经济技术开发区",
      "绥芬河市",
      "海林市",
      "宁安市",
      "穆棱市",
      "东宁市"
    ],
    "黑河市": [
      "爱辉区",
      "逊克县",
      "孙吴县",
      "北安市",
      "五大连池市",
      "嫩江市"
    ],
    "绥化市": [
      "北林区",
      "望奎县",
      "兰西县",
      "青冈县",
      "庆安县",
      "明水县",
      "绥棱县",
      "安达市",
      "肇东市",
      "海伦市"
    ],
    "大兴安岭地区": [
      "漠河市",
      "呼玛县",
      "塔河县",
      "加格达奇区",
      "松岭区",
      "新林区",
      "呼中区"
    ]
  },
  "上海市": {
    "市辖区": [
      "黄浦区",
      "徐汇区",
      "长宁区",
      "静安区",
      "普陀区",
      "虹口区",
      "杨浦区",
      "闵行区",
      "宝山区",
      "嘉定区",
      "浦东新区",
      "金山区",
      "松江区",
      "青浦区",
      "奉贤区",
      "崇明区"
    ]
  },
  "江苏省": {
    "南京市": [
      "玄武区",
      "秦淮区",
      "建邺区",
      "鼓楼区",
      "浦口区",
      "栖霞区",
      "雨花台区",
      "江宁区",
      "六合区",
      "溧水区",
      "高淳区"
    ],
    "无锡市": [
      "锡山区",
      "惠山区",
      "滨湖区",
      "梁溪区",
      "新吴区",
      "江阴市",
      "宜兴市"
    ],
    "徐州市": [
      "鼓楼区",
      "云龙区",
      "贾汪区",
      "泉山区",
      "铜山区",
      "丰县",
      "沛县",
      "睢宁县",
      "徐州经济技术开发区",
      "新沂市",
      "邳州市"
    ],
    "常州市": [
      "天宁区",
      "钟楼区",
      "新北区",
      "武进区",
      "金坛区",
      "溧阳市"
    ],
    "苏州市": [
      "虎丘区",
      "吴中区",
      "相城区",
      "姑苏区",
      "吴江区",
      "苏州工业园区",
      "常熟市",
      "张家港市",
      "昆山市",
      "太仓市"
    ],
    "南通市": [
      "通州区",
      "崇川区",
      "海门区",
      "如东县",
      "南通经济技术开发区",
      "启东市",
      "如皋市",
      "海安市"
    ],
    "连云港市": [
      "连云区",
      "海州区",
      "赣榆区",
      "东海县",
      "灌云县",
      "灌南县",
      "连云港经济技术开发区",
      "连云港高新技术产业开发区"
    ],
    "淮安市": [
      "淮安区",
      "淮阴区",
      "清江浦区",
      "洪泽区",
      "涟水县",
      "盱眙县",
      "金湖县",
      "淮安经济技术开发区"
    ],
    "盐城市": [
      "亭湖区",
      "盐都区",
      "大丰区",
      "响水县",
      "滨海县",
      "阜宁县",
      "射阳县",
      "建湖县",
      "盐城经济技术开发区",
      "东台市"
    ],
    "扬州市": [
      "广陵区",
      "邗江区",
      "江都区",
      "宝应县",
      "扬州经济技术开发区",
      "仪征市",
      "高邮市"
    ],
    "镇江市": [
      "京口区",
      "润州区",
      "丹徒区",
      "镇江新区",
      "丹阳市",
      "扬中市",
      "句容市"
    ],
    "泰州市": [
      "海陵区",
      "高港区",
      "姜堰区",
      "泰州医药高新技术产业开发区",
      "兴化市",
      "靖江市",
      "泰兴市"
    ],
    "宿迁市": [
      "宿城区",
      "宿豫区",
      "沭阳县",
      "泗阳县",
      "泗洪县",
      "宿迁经济技术开发区"
    ]
  },
  "浙江省": {
    "杭州市": [
      "上城区",
      "拱墅区",
      "西湖区",
      "滨江区",
      "萧山区",
      "余杭区",
      "富阳区",
      "临安区",
      "临平区",
      "钱塘区",
      "桐庐县",
      "淳安县",
      "建德市"
    ],
    "宁波市": [
      "海曙区",
      "江北区",
      "北仑区",
      "镇海区",
      "鄞州区",
      "奉化区",
      "象山县",
      "宁海县",
      "余姚市",
      "慈溪市"
    ],
    "温州市": [
      "鹿城区",
      "龙湾区",
      "瓯海区",
      "洞头区",
      "永嘉县",
      "平阳县",
      "苍南县",
      "文成县",
      "泰顺县",
      "瑞安市",
      "乐清市",
      "龙港市"
    ],
    "嘉兴市": [
      "南湖区",
      "秀洲区",
      "嘉善县",
      "海盐县",
      "海宁市",
      "平湖市",
      "桐乡市"
    ],
    "湖州市": [
      "吴兴区",
      "南浔区",
      "德清县",
      "长兴县",
      "安吉县"
    ],
    "绍兴市": [
      "越城区",
      "柯桥区",
      "上虞区",
      "新昌县",
      "诸暨市",
      "嵊州市"
    ],
    "金华市": [
      "婺城区",
      "金东区",
      "武义县",
      "浦江县",
      "磐安县",
      "兰溪市",
      "义乌市",
      "东阳市",
      "永康市"
    ],
    "衢州市": [
      "柯城区",
      "衢江区",
      "常山县",
      "开化县",
      "龙游县",
      "江山市"
    ],
    "舟山市": [
      "定海区",
      "普陀区",
      "岱山县",
      "嵊泗县"
    ],
    "台州市": [
      "椒江区",
      "黄岩区",
      "路桥区",
      "三门县",
      "天台县",
      "仙居县",
      "温岭市",
      "临海市",
      "玉环市"
    ],
    "丽水市": [
      "莲都区",
      "青田县",
      "缙云县",
      "遂昌县",
      "松阳县",
      "云和县",
      "庆元县",
      "景宁畲族自治县",
      "龙泉市"
    ]
  },
  "安徽省": {
    "合肥市": [
      "瑶海区",
      "庐阳区",
      "蜀山区",
      "包河区",
      "长丰县",
      "肥东县",
      "肥西县",
      "庐江县",
      "合肥高新技术产业开发区",
      "合肥经济技术开发区",
      "合肥新站高新技术产业开发区",
      "巢湖市"
    ],
    "芜湖市": [
      "镜湖区",
      "鸠江区",
      "弋江区",
      "湾沚区",
      "繁昌区",
      "南陵县",
      "芜湖经济技术开发区",
      "安徽芜湖三山经济开发区",
      "无为市"
    ],
    "蚌埠市": [
      "龙子湖区",
      "蚌山区",
      "禹会区",
      "淮上区",
      "怀远县",
      "五河县",
      "固镇县",
      "蚌埠市高新技术开发区",
      "蚌埠市经济开发区"
    ],
    "淮南市": [
      "大通区",
      "田家庵区",
      "谢家集区",
      "八公山区",
      "潘集区",
      "凤台县",
      "寿县"
    ],
    "马鞍山市": [
      "花山区",
      "雨山区",
      "博望区",
      "当涂县",
      "含山县",
      "和县"
    ],
    "淮北市": [
      "杜集区",
      "相山区",
      "烈山区",
      "濉溪县"
    ],
    "铜陵市": [
      "铜官区",
      "义安区",
      "郊区",
      "枞阳县"
    ],
    "安庆市": [
      "迎江区",
      "大观区",
      "宜秀区",
      "怀宁县",
      "太湖县",
      "宿松县",
      "望江县",
      "岳西县",
      "安徽安庆经济开发区",
      "桐城市",
      "潜山市"
    ],
    "黄山市": [
      "屯溪区",
      "黄山区",
      "徽州区",
      "歙县",
      "休宁县",
      "黟县",
      "祁门县"
    ],
    "滁州市": [
      "琅琊区",
      "南谯区",
      "来安县",
      "全椒县",
      "定远县",
      "凤阳县",
      "中新苏滁高新技术产业开发区",
      "滁州经济技术开发区",
      "天长市",
      "明光市"
    ],
    "阜阳市": [
      "颍州区",
      "颍东区",
      "颍泉区",
      "临泉县",
      "太和县",
      "阜南县",
      "颍上县",
      "阜阳合肥现代产业园区",
      "阜阳经济技术开发区",
      "界首市"
    ],
    "宿州市": [
      "埇桥区",
      "砀山县",
      "萧县",
      "灵璧县",
      "泗县",
      "宿州马鞍山现代产业园区",
      "宿州经济技术开发区"
    ],
    "六安市": [
      "金安区",
      "裕安区",
      "叶集区",
      "霍邱县",
      "舒城县",
      "金寨县",
      "霍山县"
    ],
    "亳州市": [
      "谯城区",
      "涡阳县",
      "蒙城县",
      "利辛县"
    ],
    "池州市": [
      "贵池区",
      "东至县",
      "石台县",
      "青阳县"
    ],
    "宣城市": [
      "宣州区",
      "郎溪县",
      "泾县",
      "绩溪县",
      "旌德县",
      "宣城市经济开发区",
      "宁国市",
      "广德市"
    ]
  },
  "福建省": {
    "福州市": [
      "鼓楼区",
      "台江区",
      "仓山区",
      "马尾区",
      "晋安区",
      "长乐区",
      "闽侯县",
      "连江县",
      "罗源县",
      "闽清县",
      "永泰县",
      "平潭县",
      "福清市"
    ],
    "厦门市": [
      "思明区",
      "海沧区",
      "湖里区",
      "集美区",
      "同安区",
      "翔安区"
    ],
    "莆田市": [
      "城厢区",
      "涵江区",
      "荔城区",
      "秀屿区",
      "仙游县"
    ],
    "三明市": [
      "三元区",
      "沙县区",
      "明溪县",
      "清流县",
      "宁化县",
      "大田县",
      "尤溪县",
      "将乐县",
      "泰宁县",
      "建宁县",
      "永安市"
    ],
    "泉州市": [
      "鲤城区",
      "丰泽区",
      "洛江区",
      "泉港区",
      "惠安县",
      "安溪县",
      "永春县",
      "德化县",
      "金门县",
      "石狮市",
      "晋江市",
      "南安市"
    ],
    "漳州市": [
      "芗城区",
      "龙文区",
      "龙海区",
      "长泰区",
      "云霄县",
      "漳浦县",
      "诏安县",
      "东山县",
      "南靖县",
      "平和县",
      "华安县"
    ],
    "南平市": [
      "延平区",
      "建阳区",
      "顺昌县",
      "浦城县",
      "光泽县",
      "松溪县",
      "政和县",
      "邵武市",
      "武夷山市",
      "建瓯市"
    ],
    "龙岩市": [
      "新罗区",
      "永定区",
      "长汀县",
      "上杭县",
      "武平县",
      "连城县",
      "漳平市"
    ],
    "宁德市": [
      "蕉城区",
      "霞浦县",
      "古田县",
      "屏南县",
      "寿宁县",
      "周宁县",
      "柘荣县",
      "福安市",
      "福鼎市"
    ]
  },
  "江西省": {
    "南昌市": [
      "东湖区",
      "西湖区",
      "青云谱区",
      "青山湖区",
      "新建区",
      "红谷滩区",
      "南昌县",
      "安义县",
      "进贤县"
    ],
    "景德镇市": [
      "昌江区",
      "珠山区",
      "浮梁县",
      "乐平市"
    ],
    "萍乡市": [
      "安源区",
      "湘东区",
      "莲花县",
      "上栗县",
      "芦溪县"
    ],
    "九江市": [
      "濂溪区",
      "浔阳区",
      "柴桑区",
      "武宁县",
      "修水县",
      "永修县",
      "德安县",
      "都昌县",
      "湖口县",
      "彭泽县",
      "瑞昌市",
      "共青城市",
      "庐山市"
    ],
    "新余市": [
      "渝水区",
      "分宜县"
    ],
    "鹰潭市": [
      "月湖区",
      "余江区",
      "贵溪市"
    ],
    "赣州市": [
      "章贡区",
      "南康区",
      "赣县区",
      "信丰县",
      "大余县",
      "上犹县",
      "崇义县",
      "安远县",
      "定南县",
      "全南县",
      "宁都县",
      "于都县",
      "兴国县",
      "会昌县",
      "寻乌县",
      "石城县",
      "瑞金市",
      "龙南市"
    ],
    "吉安市": [
      "吉州区",
      "青原区",
      "吉安县",
      "吉水县",
      "峡江县",
      "新干县",
      "永丰县",
      "泰和县",
      "遂川县",
      "万安县",
      "安福县",
      "永新县",
      "井冈山市"
    ],
    "宜春市": [
      "袁州区",
      "奉新县",
      "万载县",
      "上高县",
      "宜丰县",
      "靖安县",
      "铜鼓县",
      "丰城市",
      "樟树市",
      "高安市"
    ],
    "抚州市": [
      "临川区",
      "东乡区",
      "南城县",
      "黎川县",
      "南丰县",
      "崇仁县",
      "乐安县",
      "宜黄县",
      "金溪县",
      "资溪县",
      "广昌县"
    ],
    "上饶市": [
      "信州区",
      "广丰区",
      "广信区",
      "玉山县",
      "铅山县",
      "横峰县",
      "弋阳县",
      "余干县",
      "鄱阳县",
      "万年县",
      "婺源县",
      "德兴市"
    ]
  },
  "山东省": {
    "济南市": [
      "历下区",
      "市中区",
      "槐荫区",
      "天桥区",
      "历城区",
      "长清区",
      "章丘区",
      "济阳区",
      "莱芜区",
      "钢城区",
      "平阴县",
      "商河县",
      "济南高新技术产业开发区"
    ],
    "青岛市": [
      "市南区",
      "市北区",
      "黄岛区",
      "崂山区",
      "李沧区",
      "城阳区",
      "即墨区",
      "青岛高新技术产业开发区",
      "胶州市",
      "平度市",
      "莱西市"
    ],
    "淄博市": [
      "淄川区",
      "张店区",
      "博山区",
      "临淄区",
      "周村区",
      "桓台县",
      "高青县",
      "沂源县"
    ],
    "枣庄市": [
      "市中区",
      "薛城区",
      "峄城区",
      "台儿庄区",
      "山亭区",
      "滕州市"
    ],
    "东营市": [
      "东营区",
      "河口区",
      "垦利区",
      "利津县",
      "广饶县",
      "东营经济技术开发区",
      "东营港经济开发区"
    ],
    "烟台市": [
      "芝罘区",
      "福山区",
      "牟平区",
      "莱山区",
      "蓬莱区",
      "烟台高新技术产业开发区",
      "烟台经济技术开发区",
      "龙口市",
      "莱阳市",
      "莱州市",
      "招远市",
      "栖霞市",
      "海阳市"
    ],
    "潍坊市": [
      "潍城区",
      "寒亭区",
      "坊子区",
      "奎文区",
      "临朐县",
      "昌乐县",
      "潍坊滨海经济技术开发区",
      "青州市",
      "诸城市",
      "寿光市",
      "安丘市",
      "高密市",
      "昌邑市"
    ],
    "济宁市": [
      "任城区",
      "兖州区",
      "微山县",
      "鱼台县",
      "金乡县",
      "嘉祥县",
      "汶上县",
      "泗水县",
      "梁山县",
      "济宁高新技术产业开发区",
      "曲阜市",
      "邹城市"
    ],
    "泰安市": [
      "泰山区",
      "岱岳区",
      "宁阳县",
      "东平县",
      "新泰市",
      "肥城市"
    ],
    "威海市": [
      "环翠区",
      "文登区",
      "威海火炬高技术产业开发区",
      "威海经济技术开发区",
      "威海临港经济技术开发区",
      "荣成市",
      "乳山市"
    ],
    "日照市": [
      "东港区",
      "岚山区",
      "五莲县",
      "莒县",
      "日照经济技术开发区"
    ],
    "临沂市": [
      "兰山区",
      "罗庄区",
      "河东区",
      "沂南县",
      "郯城县",
      "沂水县",
      "兰陵县",
      "费县",
      "平邑县",
      "莒南县",
      "蒙阴县",
      "临沭县",
      "临沂高新技术产业开发区"
    ],
    "德州市": [
      "德城区",
      "陵城区",
      "宁津县",
      "庆云县",
      "临邑县",
      "齐河县",
      "平原县",
      "夏津县",
      "武城县",
      "德州天衢新区",
      "乐陵市",
      "禹城市"
    ],
    "聊城市": [
      "东昌府区",
      "茌平区",
      "阳谷县",
      "莘县",
      "东阿县",
      "冠县",
      "高唐县",
      "临清市"
    ],
    "滨州市": [
      "滨城区",
      "沾化区",
      "惠民县",
      "阳信县",
      "无棣县",
      "博兴县",
      "邹平市"
    ],
    "菏泽市": [
      "牡丹区",
      "定陶区",
      "曹县",
      "单县",
      "成武县",
      "巨野县",
      "郓城县",
      "鄄城县",
      "东明县",
      "菏泽经济技术开发区",
      "菏泽高新技术开发区"
    ]
  },
  "河南省": {
    "郑州市": [
      "中原区",
      "二七区",
      "管城回族区",
      "金水区",
      "上街区",
      "惠济区",
      "中牟县",
      "郑州经济技术开发区",
      "郑州高新技术产业开发区",
      "郑州航空港经济综合实验区",
      "巩义市",
      "荥阳市",
      "新密市",
      "新郑市",
      "登封市"
    ],
    "开封市": [
      "龙亭区",
      "顺河回族区",
      "鼓楼区",
      "禹王台区",
      "祥符区",
      "杞县",
      "通许县",
      "尉氏县",
      "兰考县"
    ],
    "洛阳市": [
      "老城区",
      "西工区",
      "瀍河回族区",
      "涧西区",
      "偃师区",
      "孟津区",
      "洛龙区",
      "新安县",
      "栾川县",
      "嵩县",
      "汝阳县",
      "宜阳县",
      "洛宁县",
      "伊川县",
      "洛阳高新技术产业开发区"
    ],
    "平顶山市": [
      "新华区",
      "卫东区",
      "石龙区",
      "湛河区",
      "宝丰县",
      "叶县",
      "鲁山县",
      "郏县",
      "平顶山高新技术产业开发区",
      "平顶山市城乡一体化示范区",
      "舞钢市",
      "汝州市"
    ],
    "安阳市": [
      "文峰区",
      "北关区",
      "殷都区",
      "龙安区",
      "安阳县",
      "汤阴县",
      "滑县",
      "内黄县",
      "安阳高新技术产业开发区",
      "林州市"
    ],
    "鹤壁市": [
      "鹤山区",
      "山城区",
      "淇滨区",
      "浚县",
      "淇县",
      "鹤壁经济技术开发区"
    ],
    "新乡市": [
      "红旗区",
      "卫滨区",
      "凤泉区",
      "牧野区",
      "新乡县",
      "获嘉县",
      "原阳县",
      "延津县",
      "封丘县",
      "新乡高新技术产业开发区",
      "新乡经济技术开发区",
      "新乡市平原城乡一体化示范区",
      "卫辉市",
      "辉县市",
      "长垣市"
    ],
    "焦作市": [
      "解放区",
      "中站区",
      "马村区",
      "山阳区",
      "修武县",
      "博爱县",
      "武陟县",
      "温县",
      "焦作城乡一体化示范区",
      "沁阳市",
      "孟州市"
    ],
    "濮阳市": [
      "华龙区",
      "清丰县",
      "南乐县",
      "范县",
      "台前县",
      "濮阳县",
      "河南濮阳工业园区",
      "濮阳经济技术开发区"
    ],
    "许昌市": [
      "魏都区",
      "建安区",
      "鄢陵县",
      "襄城县",
      "许昌经济技术开发区",
      "禹州市",
      "长葛市"
    ],
    "漯河市": [
      "源汇区",
      "郾城区",
      "召陵区",
      "舞阳县",
      "临颍县",
      "漯河经济技术开发区"
    ],
    "三门峡市": [
      "湖滨区",
      "陕州区",
      "渑池县",
      "卢氏县",
      "河南三门峡经济开发区",
      "义马市",
      "灵宝市"
    ],
    "南阳市": [
      "宛城区",
      "卧龙区",
      "南召县",
      "方城县",
      "西峡县",
      "镇平县",
      "内乡县",
      "淅川县",
      "社旗县",
      "唐河县",
      "新野县",
      "桐柏县",
      "南阳高新技术产业开发区",
      "南阳市城乡一体化示范区",
      "邓州市"
    ],
    "商丘市": [
      "梁园区",
      "睢阳区",
      "民权县",
      "睢县",
      "宁陵县",
      "柘城县",
      "虞城县",
      "夏邑县",
      "豫东综合物流产业聚集区",
      "河南商丘经济开发区",
      "永城市"
    ],
    "信阳市": [
      "浉河区",
      "平桥区",
      "罗山县",
      "光山县",
      "新县",
      "商城县",
      "固始县",
      "潢川县",
      "淮滨县",
      "息县",
      "信阳高新技术产业开发区"
    ],
    "周口市": [
      "川汇区",
      "淮阳区",
      "扶沟县",
      "西华县",
      "商水县",
      "沈丘县",
      "郸城县",
      "太康县",
      "鹿邑县",
      "河南周口经济开发区",
      "项城市"
    ],
    "驻马店市": [
      "驿城区",
      "西平县",
      "上蔡县",
      "平舆县",
      "正阳县",
      "确山县",
      "泌阳县",
      "汝南县",
      "遂平县",
      "新蔡县",
      "河南驻马店经济开发区"
    ],
    "省直辖县级行政区划": [
      "济源市"
    ]
  },
  "湖北省": {
    "武汉市": [
      "江岸区",
      "江汉区",
      "硚口区",
      "汉阳区",
      "武昌区",
      "青山区",
      "洪山区",
      "东西湖区",
      "汉南区",
      "蔡甸区",
      "江夏区",
      "黄陂区",
      "新洲区"
    ],
    "黄石市": [
      "黄石港区",
      "西塞山区",
      "下陆区",
      "铁山区",
      "阳新县",
      "大冶市"
    ],
    "十堰市": [
      "茅箭区",
      "张湾区",
      "郧阳区",
      "郧西县",
      "竹山县",
      "竹溪县",
      "房县",
      "丹江口市"
    ],
    "宜昌市": [
      "西陵区",
      "伍家岗区",
      "点军区",
      "猇亭区",
      "夷陵区",
      "远安县",
      "兴山县",
      "秭归县",
      "长阳土家族自治县",
      "五峰土家族自治县",
      "宜都市",
      "当阳市",
      "枝江市"
    ],
    "襄阳市": [
      "襄城区",
      "樊城区",
      "襄州区",
      "南漳县",
      "谷城县",
      "保康县",
      "老河口市",
      "枣阳市",
      "宜城市"
    ],
    "鄂州市": [
      "梁子湖区",
      "华容区",
      "鄂城区"
    ],
    "荆门市": [
      "东宝区",
      "掇刀区",
      "沙洋县",
      "钟祥市",
      "京山市"
    ],
    "孝感市": [
      "孝南区",
      "孝昌县",
      "大悟县",
      "云梦县",
      "应城市",
      "安陆市",
      "汉川市"
    ],
    "荆州市": [
      "沙市区",
      "荆州区",
      "公安县",
      "江陵县",
      "荆州经济技术开发区",
      "石首市",
      "洪湖市",
      "松滋市",
      "监利市"
    ],
    "黄冈市": [
      "黄州区",
      "团风县",
      "红安县",
      "罗田县",
      "英山县",
      "浠水县",
      "蕲春县",
      "黄梅县",
      "龙感湖管理区",
      "麻城市",
      "武穴市"
    ],
    "咸宁市": [
      "咸安区",
      "嘉鱼县",
      "通城县",
      "崇阳县",
      "通山县",
      "赤壁市"
    ],
    "随州市": [
      "曾都区",
      "随县",
      "广水市"
    ],
    "恩施土家族苗族自治州": [
      "恩施市",
      "利川市",
      "建始县",
      "巴东县",
      "宣恩县",
      "咸丰县",
      "来凤县",
      "鹤峰县"
    ],
    "省直辖县级行政区划": [
      "仙桃市",
      "潜江市",
      "天门市",
      "神农架林区"
    ]
  },
  "湖南省": {
    "长沙市": [
      "芙蓉区",
      "天心区",
      "岳麓区",
      "开福区",
      "雨花区",
      "望城区",
      "长沙县",
      "浏阳市",
      "宁乡市"
    ],
    "株洲市": [
      "荷塘区",
      "芦淞区",
      "石峰区",
      "天元区",
      "渌口区",
      "攸县",
      "茶陵县",
      "炎陵县",
      "醴陵市"
    ],
    "湘潭市": [
      "雨湖区",
      "岳塘区",
      "湘潭县",
      "湖南湘潭高新技术产业园区",
      "湘潭昭山示范区",
      "湘潭九华示范区",
      "湘乡市",
      "韶山市"
    ],
    "衡阳市": [
      "珠晖区",
      "雁峰区",
      "石鼓区",
      "蒸湘区",
      "南岳区",
      "衡阳县",
      "衡南县",
      "衡山县",
      "衡东县",
      "祁东县",
      "衡阳综合保税区",
      "湖南衡阳高新技术产业园区",
      "湖南衡阳松木经济开发区",
      "耒阳市",
      "常宁市"
    ],
    "邵阳市": [
      "双清区",
      "大祥区",
      "北塔区",
      "新邵县",
      "邵阳县",
      "隆回县",
      "洞口县",
      "绥宁县",
      "新宁县",
      "城步苗族自治县",
      "武冈市",
      "邵东市"
    ],
    "岳阳市": [
      "岳阳楼区",
      "云溪区",
      "君山区",
      "岳阳县",
      "华容县",
      "湘阴县",
      "平江县",
      "岳阳市屈原管理区",
      "汨罗市",
      "临湘市"
    ],
    "常德市": [
      "武陵区",
      "鼎城区",
      "安乡县",
      "汉寿县",
      "澧县",
      "临澧县",
      "桃源县",
      "石门县",
      "常德市西洞庭管理区",
      "津市市"
    ],
    "张家界市": [
      "永定区",
      "武陵源区",
      "慈利县",
      "桑植县"
    ],
    "益阳市": [
      "资阳区",
      "赫山区",
      "南县",
      "桃江县",
      "安化县",
      "益阳市大通湖管理区",
      "湖南益阳高新技术产业园区",
      "沅江市"
    ],
    "郴州市": [
      "北湖区",
      "苏仙区",
      "桂阳县",
      "宜章县",
      "永兴县",
      "嘉禾县",
      "临武县",
      "汝城县",
      "桂东县",
      "安仁县",
      "资兴市"
    ],
    "永州市": [
      "零陵区",
      "冷水滩区",
      "东安县",
      "双牌县",
      "道县",
      "江永县",
      "宁远县",
      "蓝山县",
      "新田县",
      "江华瑶族自治县",
      "永州经济技术开发区",
      "永州市回龙圩管理区",
      "祁阳市"
    ],
    "怀化市": [
      "鹤城区",
      "中方县",
      "沅陵县",
      "辰溪县",
      "溆浦县",
      "会同县",
      "麻阳苗族自治县",
      "新晃侗族自治县",
      "芷江侗族自治县",
      "靖州苗族侗族自治县",
      "通道侗族自治县",
      "怀化市洪江管理区",
      "洪江市"
    ],
    "娄底市": [
      "娄星区",
      "双峰县",
      "新化县",
      "冷水江市",
      "涟源市"
    ],
    "湘西土家族苗族自治州": [
      "吉首市",
      "泸溪县",
      "凤凰县",
      "花垣县",
      "保靖县",
      "古丈县",
      "永顺县",
      "龙山县"
    ]
  },
  "广东省": {
    "广州市": [
      "荔湾区",
      "越秀区",
      "海珠区",
      "天河区",
      "白云区",
      "黄埔区",
      "番禺区",
      "花都区",
      "南沙区",
      "从化区",
      "增城区"
    ],
    "韶关市": [
      "武江区",
      "浈江区",
      "曲江区",
      "始兴县",
      "仁化县",
      "翁源县",
      "乳源瑶族自治县",
      "新丰县",
      "乐昌市",
      "南雄市"
    ],
    "深圳市": [
      "罗湖区",
      "福田区",
      "南山区",
      "宝安区",
      "龙岗区",
      "盐田区",
      "龙华区",
      "坪山区",
      "光明区"
    ],
    "珠海市": [
      "香洲区",
      "斗门区",
      "金湾区"
    ],
    "汕头市": [
      "龙湖区",
      "金平区",
      "濠江区",
      "潮阳区",
      "潮南区",
      "澄海区",
      "南澳县"
    ],
    "佛山市": [
      "禅城区",
      "南海区",
      "顺德区",
      "三水区",
      "高明区"
    ],
    "江门市": [
      "蓬江区",
      "江海区",
      "新会区",
      "台山市",
      "开平市",
      "鹤山市",
      "恩平市"
    ],
    "湛江市": [
      "赤坎区",
      "霞山区",
      "坡头区",
      "麻章区",
      "遂溪县",
      "徐闻县",
      "廉江市",
      "雷州市",
      "吴川市"
    ],
    "茂名市": [
      "茂南区",
      "电白区",
      "高州市",
      "化州市",
      "信宜市"
    ],
    "肇庆市": [
      "端州区",
      "鼎湖区",
      "高要区",
      "广宁县",
      "怀集县",
      "封开县",
      "德庆县",
      "四会市"
    ],
    "惠州市": [
      "惠城区",
      "惠阳区",
      "博罗县",
      "惠东县",
      "龙门县"
    ],
    "梅州市": [
      "梅江区",
      "梅县区",
      "大埔县",
      "丰顺县",
      "五华县",
      "平远县",
      "蕉岭县",
      "兴宁市"
    ],
    "汕尾市": [
      "城区",
      "海丰县",
      "陆河县",
      "陆丰市"
    ],
    "河源市": [
      "源城区",
      "紫金县",
      "龙川县",
      "连平县",
      "和平县",
      "东源县"
    ],
    "阳江市": [
      "江城区",
      "阳东区",
      "阳西县",
      "阳春市"
    ],
    "清远市": [
      "清城区",
      "清新区",
      "佛冈县",
      "阳山县",
      "连山壮族瑶族自治县",
      "连南瑶族自治县",
      "英德市",
      "连州市"
    ],
    "东莞市": [
      "东城街道",
      "南城街道",
      "万江街道",
      "莞城街道",
      "石碣镇",
      "石龙镇",
      "茶山镇",
      "石排镇",
      "企石镇",
      "横沥镇",
      "桥头镇",
      "谢岗镇",
      "东坑镇",
      "常平镇",
      "寮步镇",
      "樟木头镇",
      "大朗镇",
      "黄江镇",
      "清溪镇",
      "塘厦镇",
      "凤岗镇",
      "大岭山镇",
      "长安镇",
      "虎门镇",
      "厚街镇",
      "沙田镇",
      "道滘镇",
      "洪梅镇",
      "麻涌镇",
      "望牛墩镇",
      "中堂镇",
      "高埗镇",
      "松山湖",
      "东莞港",
      "东莞生态园",
      "东莞滨海湾新区"
    ],
    "中山市": [
      "石岐街道",
      "东区街道",
      "中山港街道",
      "西区街道",
      "南区街道",
      "五桂山街道",
      "民众街道",
      "南朗街道",
      "黄圃镇",
      "东凤镇",
      "古镇镇",
      "沙溪镇",
      "坦洲镇",
      "港口镇",
      "三角镇",
      "横栏镇",
      "南头镇",
      "阜沙镇",
      "三乡镇",
      "板芙镇",
      "大涌镇",
      "神湾镇",
      "小榄镇"
    ],
    "潮州市": [
      "湘桥区",
      "潮安区",
      "饶平县"
    ],
    "揭阳市": [
      "榕城区",
      "揭东区",
      "揭西县",
      "惠来县",
      "普宁市"
    ],
    "云浮市": [
      "云城区",
      "云安区",
      "新兴县",
      "郁南县",
      "罗定市"
    ]
  },
  "广西壮族自治区": {
    "南宁市": [
      "兴宁区",
      "青秀区",
      "江南区",
      "西乡塘区",
      "良庆区",
      "邕宁区",
      "武鸣区",
      "隆安县",
      "马山县",
      "上林县",
      "宾阳县",
      "横州市"
    ],
    "柳州市": [
      "城中区",
      "鱼峰区",
      "柳南区",
      "柳北区",
      "柳江区",
      "柳城县",
      "鹿寨县",
      "融安县",
      "融水苗族自治县",
      "三江侗族自治县"
    ],
    "桂林市": [
      "秀峰区",
      "叠彩区",
      "象山区",
      "七星区",
      "雁山区",
      "临桂区",
      "阳朔县",
      "灵川县",
      "全州县",
      "兴安县",
      "永福县",
      "灌阳县",
      "龙胜各族自治县",
      "资源县",
      "平乐县",
      "恭城瑶族自治县",
      "荔浦市"
    ],
    "梧州市": [
      "万秀区",
      "长洲区",
      "龙圩区",
      "苍梧县",
      "藤县",
      "蒙山县",
      "岑溪市"
    ],
    "北海市": [
      "海城区",
      "银海区",
      "铁山港区",
      "合浦县"
    ],
    "防城港市": [
      "港口区",
      "防城区",
      "上思县",
      "东兴市"
    ],
    "钦州市": [
      "钦南区",
      "钦北区",
      "灵山县",
      "浦北县"
    ],
    "贵港市": [
      "港北区",
      "港南区",
      "覃塘区",
      "平南县",
      "桂平市"
    ],
    "玉林市": [
      "玉州区",
      "福绵区",
      "容县",
      "陆川县",
      "博白县",
      "兴业县",
      "北流市"
    ],
    "百色市": [
      "右江区",
      "田阳区",
      "田东县",
      "德保县",
      "那坡县",
      "凌云县",
      "乐业县",
      "田林县",
      "西林县",
      "隆林各族自治县",
      "靖西市",
      "平果市"
    ],
    "贺州市": [
      "八步区",
      "平桂区",
      "昭平县",
      "钟山县",
      "富川瑶族自治县"
    ],
    "河池市": [
      "金城江区",
      "宜州区",
      "南丹县",
      "天峨县",
      "凤山县",
      "东兰县",
      "罗城仫佬族自治县",
      "环江毛南族自治县",
      "巴马瑶族自治县",
      "都安瑶族自治县",
      "大化瑶族自治县"
    ],
    "来宾市": [
      "兴宾区",
      "忻城县",
      "象州县",
      "武宣县",
      "金秀瑶族自治县",
      "合山市"
    ],
    "崇左市": [
      "江州区",
      "扶绥县",
      "宁明县",
      "龙州县",
      "大新县",
      "天等县",
      "凭祥市"
    ]
  },
  "海南省": {
    "海口市": [
      "秀英区",
      "龙华区",
      "琼山区",
      "美兰区"
    ],
    "三亚市": [
      "海棠区",
      "吉阳区",
      "天涯区",
      "崖州区"
    ],
    "三沙市": [
      "西沙群岛",
      "南沙群岛",
      "中沙群岛的岛礁及其海域"
    ],
    "儋州市": [
      "那大镇",
      "和庆镇",
      "南丰镇",
      "大成镇",
      "雅星镇",
      "兰洋镇",
      "光村镇",
      "木棠镇",
      "海头镇",
      "峨蔓镇",
      "王五镇",
      "白马井镇",
      "中和镇",
      "排浦镇",
      "东成镇",
      "新州镇",
      "洋浦经济开发区",
      "华南热作学院"
    ],
    "省直辖县级行政区划": [
      "五指山市",
      "琼海市",
      "文昌市",
      "万宁市",
      "东方市",
      "定安县",
      "屯昌县",
      "澄迈县",
      "临高县",
      "白沙黎族自治县",
      "昌江黎族自治县",
      "乐东黎族自治县",
      "陵水黎族自治县",
      "保亭黎族苗族自治县",
      "琼中黎族苗族自治县"
    ]
  },
  "重庆市": {
    "市辖区": [
      "万州区",
      "涪陵区",
      "渝中区",
      "大渡口区",
      "江北区",
      "沙坪坝区",
      "九龙坡区",
      "南岸区",
      "北碚区",
      "綦江区",
      "大足区",
      "渝北区",
      "巴南区",
      "黔江区",
      "长寿区",
      "江津区",
      "合川区",
      "永川区",
      "南川区",
      "璧山区",
      "铜梁区",
      "潼南区",
      "荣昌区",
      "开州区",
      "梁平区",
      "武隆区"
    ],
    "县": [
      "城口县",
      "丰都县",
      "垫江县",
      "忠县",
      "云阳县",
      "奉节县",
      "巫山县",
      "巫溪县",
      "石柱土家族自治县",
      "秀山土家族苗族自治县",
      "酉阳土家族苗族自治县",
      "彭水苗族土家族自治县"
    ]
  },
  "四川省": {
    "成都市": [
      "锦江区",
      "青羊区",
      "金牛区",
      "武侯区",
      "成华区",
      "龙泉驿区",
      "青白江区",
      "新都区",
      "温江区",
      "双流区",
      "郫都区",
      "新津区",
      "金堂县",
      "大邑县",
      "蒲江县",
      "都江堰市",
      "彭州市",
      "邛崃市",
      "崇州市",
      "简阳市"
    ],
    "自贡市": [
      "自流井区",
      "贡井区",
      "大安区",
      "沿滩区",
      "荣县",
      "富顺县"
    ],
    "攀枝花市": [
      "东区",
      "西区",
      "仁和区",
      "米易县",
      "盐边县"
    ],
    "泸州市": [
      "江阳区",
      "纳溪区",
      "龙马潭区",
      "泸县",
      "合江县",
      "叙永县",
      "古蔺县"
    ],
    "德阳市": [
      "旌阳区",
      "罗江区",
      "中江县",
      "广汉市",
      "什邡市",
      "绵竹市"
    ],
    "绵阳市": [
      "涪城区",
      "游仙区",
      "安州区",
      "三台县",
      "盐亭县",
      "梓潼县",
      "北川羌族自治县",
      "平武县",
      "江油市"
    ],
    "广元市": [
      "利州区",
      "昭化区",
      "朝天区",
      "旺苍县",
      "青川县",
      "剑阁县",
      "苍溪县"
    ],
    "遂宁市": [
      "船山区",
      "安居区",
      "蓬溪县",
      "大英县",
      "射洪市"
    ],
    "内江市": [
      "市中区",
      "东兴区",
      "威远县",
      "资中县",
      "隆昌市"
    ],
    "乐山市": [
      "市中区",
      "沙湾区",
      "五通桥区",
      "金口河区",
      "犍为县",
      "井研县",
      "夹江县",
      "沐川县",
      "峨边彝族自治县",
      "马边彝族自治县",
      "峨眉山市"
    ],
    "南充市": [
      "顺庆区",
      "高坪区",
      "嘉陵区",
      "南部县",
      "营山县",
      "蓬安县",
      "仪陇县",
      "西充县",
      "阆中市"
    ],
    "眉山市": [
      "东坡区",
      "彭山区",
      "仁寿县",
      "洪雅县",
      "丹棱县",
      "青神县"
    ],
    "宜宾市": [
      "翠屏区",
      "南溪区",
      "叙州区",
      "江安县",
      "长宁县",
      "高县",
      "珙县",
      "筠连县",
      "兴文县",
      "屏山县"
    ],
    "广安市": [
      "广安区",
      "前锋区",
      "岳池县",
      "武胜县",
      "邻水县",
      "华蓥市"
    ],
    "达州市": [
      "通川区",
      "达川区",
      "宣汉县",
      "开江县",
      "大竹县",
      "渠县",
      "万源市"
    ],
    "雅安市": [
      "雨城区",
      "名山区",
      "荥经县",
      "汉源县",
      "石棉县",
      "天全县",
      "芦山县",
      "宝兴县"
    ],
    "巴中市": [
      "巴州区",
      "恩阳区",
      "通江县",
      "南江县",
      "平昌县"
    ],
    "资阳市": [
      "雁江区",
      "安岳县",
      "乐至县"
    ],
    "阿坝藏族羌族自治州": [
      "马尔康市",
      "汶川县",
      "理县",
      "茂县",
      "松潘县",
      "九寨沟县",
      "金川县",
      "小金县",
      "黑水县",
      "壤塘县",
      "阿坝县",
      "若尔盖县",
      "红原县"
    ],
    "甘孜藏族自治州": [
      "康定市",
      "泸定县",
      "丹巴县",
      "九龙县",
      "雅江县",
      "道孚县",
      "炉霍县",
      "甘孜县",
      "新龙县",
      "德格县",
      "白玉县",
      "石渠县",
      "色达县",
      "理塘县",
      "巴塘县",
      "乡城县",
      "稻城县",
      "得荣县"
    ],
    "凉山彝族自治州": [
      "西昌市",
      "会理市",
      "木里藏族自治县",
      "盐源县",
      "德昌县",
      "会东县",
      "宁南县",
      "普格县",
      "布拖县",
      "金阳县",
      "昭觉县",
      "喜德县",
      "冕宁县",
      "越西县",
      "甘洛县",
      "美姑县",
      "雷波县"
    ]
  },
  "贵州省": {
    "贵阳市": [
      "南明区",
      "云岩区",
      "花溪区",
      "乌当区",
      "白云区",
      "观山湖区",
      "开阳县",
      "息烽县",
      "修文县",
      "清镇市"
    ],
    "六盘水市": [
      "钟山区",
      "六枝特区",
      "水城区",
      "盘州市"
    ],
    "遵义市": [
      "红花岗区",
      "汇川区",
      "播州区",
      "桐梓县",
      "绥阳县",
      "正安县",
      "道真仡佬族苗族自治县",
      "务川仡佬族苗族自治县",
      "凤冈县",
      "湄潭县",
      "余庆县",
      "习水县",
      "赤水市",
      "仁怀市"
    ],
    "安顺市": [
      "西秀区",
      "平坝区",
      "普定县",
      "镇宁布依族苗族自治县",
      "关岭布依族苗族自治县",
      "紫云苗族布依族自治县"
    ],
    "毕节市": [
      "七星关区",
      "大方县",
      "金沙县",
      "织金县",
      "纳雍县",
      "威宁彝族回族苗族自治县",
      "赫章县",
      "黔西市"
    ],
    "铜仁市": [
      "碧江区",
      "万山区",
      "江口县",
      "玉屏侗族自治县",
      "石阡县",
      "思南县",
      "印江土家族苗族自治县",
      "德江县",
      "沿河土家族自治县",
      "松桃苗族自治县"
    ],
    "黔西南布依族苗族自治州": [
      "兴义市",
      "兴仁市",
      "普安县",
      "晴隆县",
      "贞丰县",
      "望谟县",
      "册亨县",
      "安龙县"
    ],
    "黔东南苗族侗族自治州": [
      "凯里市",
      "黄平县",
      "施秉县",
      "三穗县",
      "镇远县",
      "岑巩县",
      "天柱县",
      "锦屏县",
      "剑河县",
      "台江县",
      "黎平县",
      "榕江县",
      "从江县",
      "雷山县",
      "麻江县",
      "丹寨县"
    ],
    "黔南布依族苗族自治州": [
      "都匀市",
      "福泉市",
      "荔波县",
      "贵定县",
      "瓮安县",
      "独山县",
      "平塘县",
      "罗甸县",
      "长顺县",
      "龙里县",
      "惠水县",
      "三都水族自治县"
    ]
  },
  "云南省": {
    "昆明市": [
      "五华区",
      "盘龙区",
      "官渡区",
      "西山区",
      "东川区",
      "呈贡区",
      "晋宁区",
      "富民县",
      "宜良县",
      "石林彝族自治县",
      "嵩明县",
      "禄劝彝族苗族自治县",
      "寻甸回族彝族自治县",
      "安宁市"
    ],
    "曲靖市": [
      "麒麟区",
      "沾益区",
      "马龙区",
      "陆良县",
      "师宗县",
      "罗平县",
      "富源县",
      "会泽县",
      "宣威市"
    ],
    "玉溪市": [
      "红塔区",
      "江川区",
      "通海县",
      "华宁县",
      "易门县",
      "峨山彝族自治县",
      "新平彝族傣族自治县",
      "元江哈尼族彝族傣族自治县",
      "澄江市"
    ],
    "保山市": [
      "隆阳区",
      "施甸县",
      "龙陵县",
      "昌宁县",
      "腾冲市"
    ],
    "昭通市": [
      "昭阳区",
      "鲁甸县",
      "巧家县",
      "盐津县",
      "大关县",
      "永善县",
      "绥江县",
      "镇雄县",
      "彝良县",
      "威信县",
      "水富市"
    ],
    "丽江市": [
      "古城区",
      "玉龙纳西族自治县",
      "永胜县",
      "华坪县",
      "宁蒗彝族自治县"
    ],
    "普洱市": [
      "思茅区",
      "宁洱哈尼族彝族自治县",
      "墨江哈尼族自治县",
      "景东彝族自治县",
      "景谷傣族彝族自治县",
      "镇沅彝族哈尼族拉祜族自治县",
      "江城哈尼族彝族自治县",
      "孟连傣族拉祜族佤族自治县",
      "澜沧拉祜族自治县",
      "西盟佤族自治县"
    ],
    "临沧市": [
      "临翔区",
      "凤庆县",
      "云县",
      "永德县",
      "镇康县",
      "双江拉祜族佤族布朗族傣族自治县",
      "耿马傣族佤族自治县",
      "沧源佤族自治县"
    ],
    "楚雄彝族自治州": [
      "楚雄市",
      "禄丰市",
      "双柏县",
      "牟定县",
      "南华县",
      "姚安县",
      "大姚县",
      "永仁县",
      "元谋县",
      "武定县"
    ],
    "红河哈尼族彝族自治州": [
      "个旧市",
      "开远市",
      "蒙自市",
      "弥勒市",
      "屏边苗族自治县",
      "建水县",
      "石屏县",
      "泸西县",
      "元阳县",
      "红河县",
      "金平苗族瑶族傣族自治县",
      "绿春县",
      "河口瑶族自治县"
    ],
    "文山壮族苗族自治州": [
      "文山市",
      "砚山县",
      "西畴县",
      "麻栗坡县",
      "马关县",
      "丘北县",
      "广南县",
      "富宁县"
    ],
    "西双版纳傣族自治州": [
      "景洪市",
      "勐海县",
      "勐腊县"
    ],
    "大理白族自治州": [
      "大理市",
      "漾濞彝族自治县",
      "祥云县",
      "宾川县",
      "弥渡县",
      "南涧彝族自治县",
      "巍山彝族回族自治县",
      "永平县",
      "云龙县",
      "洱源县",
      "剑川县",
      "鹤庆县"
    ],
    "德宏傣族景颇族自治州": [
      "瑞丽市",
      "芒市",
      "梁河县",
      "盈江县",
      "陇川县"
    ],
    "怒江傈僳族自治州": [
      "泸水市",
      "福贡县",
      "贡山独龙族怒族自治县",
      "兰坪白族普米族自治县"
    ],
    "迪庆藏族自治州": [
      "香格里拉市",
      "德钦县",
      "维西傈僳族自治县"
    ]
  },
  "西藏自治区": {
    "拉萨市": [
      "城关区",
      "堆龙德庆区",
      "达孜区",
      "林周县",
      "当雄县",
      "尼木县",
      "曲水县",
      "墨竹工卡县",
      "格尔木藏青工业园区",
      "拉萨经济技术开发区",
      "西藏文化旅游创意园区",
      "达孜工业园区"
    ],
    "日喀则市": [
      "桑珠孜区",
      "南木林县",
      "江孜县",
      "定日县",
      "萨迦县",
      "拉孜县",
      "昂仁县",
      "谢通门县",
      "白朗县",
      "仁布县",
      "康马县",
      "定结县",
      "仲巴县",
      "亚东县",
      "吉隆县",
      "聂拉木县",
      "萨嘎县",
      "岗巴县"
    ],
    "昌都市": [
      "卡若区",
      "江达县",
      "贡觉县",
      "类乌齐县",
      "丁青县",
      "察雅县",
      "八宿县",
      "左贡县",
      "芒康县",
      "洛隆县",
      "边坝县"
    ],
    "林芝市": [
      "巴宜区",
      "工布江达县",
      "米林县",
      "墨脱县",
      "波密县",
      "察隅县",
      "朗县"
    ],
    "山南市": [
      "乃东区",
      "扎囊县",
      "贡嘎县",
      "桑日县",
      "琼结县",
      "曲松县",
      "措美县",
      "洛扎县",
      "加查县",
      "隆子县",
      "错那县",
      "浪卡子县"
    ],
    "那曲市": [
      "色尼区",
      "嘉黎县",
      "比如县",
      "聂荣县",
      "安多县",
      "申扎县",
      "索县",
      "班戈县",
      "巴青县",
      "尼玛县",
      "双湖县"
    ],
    "阿里地区": [
      "普兰县",
      "札达县",
      "噶尔县",
      "日土县",
      "革吉县",
      "改则县",
      "措勤县"
    ]
  },
  "陕西省": {
    "西安市": [
      "新城区",
      "碑林区",
      "莲湖区",
      "灞桥区",
      "未央区",
      "雁塔区",
      "阎良区",
      "临潼区",
      "长安区",
      "高陵区",
      "鄠邑区",
      "蓝田县",
      "周至县"
    ],
    "铜川市": [
      "王益区",
      "印台区",
      "耀州区",
      "宜君县"
    ],
    "宝鸡市": [
      "渭滨区",
      "金台区",
      "陈仓区",
      "凤翔区",
      "岐山县",
      "扶风县",
      "眉县",
      "陇县",
      "千阳县",
      "麟游县",
      "凤县",
      "太白县"
    ],
    "咸阳市": [
      "秦都区",
      "杨陵区",
      "渭城区",
      "三原县",
      "泾阳县",
      "乾县",
      "礼泉县",
      "永寿县",
      "长武县",
      "旬邑县",
      "淳化县",
      "武功县",
      "兴平市",
      "彬州市"
    ],
    "渭南市": [
      "临渭区",
      "华州区",
      "潼关县",
      "大荔县",
      "合阳县",
      "澄城县",
      "蒲城县",
      "白水县",
      "富平县",
      "韩城市",
      "华阴市"
    ],
    "延安市": [
      "宝塔区",
      "安塞区",
      "延长县",
      "延川县",
      "志丹县",
      "吴起县",
      "甘泉县",
      "富县",
      "洛川县",
      "宜川县",
      "黄龙县",
      "黄陵县",
      "子长市"
    ],
    "汉中市": [
      "汉台区",
      "南郑区",
      "城固县",
      "洋县",
      "西乡县",
      "勉县",
      "宁强县",
      "略阳县",
      "镇巴县",
      "留坝县",
      "佛坪县"
    ],
    "榆林市": [
      "榆阳区",
      "横山区",
      "府谷县",
      "靖边县",
      "定边县",
      "绥德县",
      "米脂县",
      "佳县",
      "吴堡县",
      "清涧县",
      "子洲县",
      "神木市"
    ],
    "安康市": [
      "汉滨区",
      "汉阴县",
      "石泉县",
      "宁陕县",
      "紫阳县",
      "岚皋县",
      "平利县",
      "镇坪县",
      "白河县",
      "旬阳市"
    ],
    "商洛市": [
      "商州区",
      "洛南县",
      "丹凤县",
      "商南县",
      "山阳县",
      "镇安县",
      "柞水县"
    ]
  },
  "甘肃省": {
    "兰州市": [
      "城关区",
      "七里河区",
      "西固区",
      "安宁区",
      "红古区",
      "永登县",
      "皋兰县",
      "榆中县",
      "兰州新区"
    ],
    "嘉峪关市": [
      "雄关街道",
      "钢城街道",
      "新城镇",
      "峪泉镇",
      "文殊镇"
    ],
    "金昌市": [
      "金川区",
      "永昌县"
    ],
    "白银市": [
      "白银区",
      "平川区",
      "靖远县",
      "会宁县",
      "景泰县"
    ],
    "天水市": [
      "秦州区",
      "麦积区",
      "清水县",
      "秦安县",
      "甘谷县",
      "武山县",
      "张家川回族自治县"
    ],
    "武威市": [
      "凉州区",
      "民勤县",
      "古浪县",
      "天祝藏族自治县"
    ],
    "张掖市": [
      "甘州区",
      "肃南裕固族自治县",
      "民乐县",
      "临泽县",
      "高台县",
      "山丹县"
    ],
    "平凉市": [
      "崆峒区",
      "泾川县",
      "灵台县",
      "崇信县",
      "庄浪县",
      "静宁县",
      "华亭市"
    ],
    "酒泉市": [
      "肃州区",
      "金塔县",
      "瓜州县",
      "肃北蒙古族自治县",
      "阿克塞哈萨克族自治县",
      "玉门市",
      "敦煌市"
    ],
    "庆阳市": [
      "西峰区",
      "庆城县",
      "环县",
      "华池县",
      "合水县",
      "正宁县",
      "宁县",
      "镇原县"
    ],
    "定西市": [
      "安定区",
      "通渭县",
      "陇西县",
      "渭源县",
      "临洮县",
      "漳县",
      "岷县"
    ],
    "陇南市": [
      "武都区",
      "成县",
      "文县",
      "宕昌县",
      "康县",
      "西和县",
      "礼县",
      "徽县",
      "两当县"
    ],
    "临夏回族自治州": [
      "临夏市",
      "临夏县",
      "康乐县",
      "永靖县",
      "广河县",
      "和政县",
      "东乡族自治县",
      "积石山保安族东乡族撒拉族自治县"
    ],
    "甘南藏族自治州": [
      "合作市",
      "临潭县",
      "卓尼县",
      "舟曲县",
      "迭部县",
      "玛曲县",
      "碌曲县",
      "夏河县"
    ]
  },
  "青海省": {
    "西宁市": [
      "城东区",
      "城中区",
      "城西区",
      "城北区",
      "湟中区",
      "大通回族土族自治县",
      "湟源县"
    ],
    "海东市": [
      "乐都区",
      "平安区",
      "民和回族土族自治县",
      "互助土族自治县",
      "化隆回族自治县",
      "循化撒拉族自治县"
    ],
    "海北藏族自治州": [
      "门源回族自治县",
      "祁连县",
      "海晏县",
      "刚察县"
    ],
    "黄南藏族自治州": [
      "同仁市",
      "尖扎县",
      "泽库县",
      "河南蒙古族自治县"
    ],
    "海南藏族自治州": [
      "共和县",
      "同德县",
      "贵德县",
      "兴海县",
      "贵南县"
    ],
    "果洛藏族自治州": [
      "玛沁县",
      "班玛县",
      "甘德县",
      "达日县",
      "久治县",
      "玛多县"
    ],
    "玉树藏族自治州": [
      "玉树市",
      "杂多县",
      "称多县",
      "治多县",
      "囊谦县",
      "曲麻莱县"
    ],
    "海西蒙古族藏族自治州": [
      "格尔木市",
      "德令哈市",
      "茫崖市",
      "乌兰县",
      "都兰县",
      "天峻县",
      "大柴旦行政委员会"
    ]
  },
  "宁夏回族自治区": {
    "银川市": [
      "兴庆区",
      "西夏区",
      "金凤区",
      "永宁县",
      "贺兰县",
      "灵武市"
    ],
    "石嘴山市": [
      "大武口区",
      "惠农区",
      "平罗县"
    ],
    "吴忠市": [
      "利通区",
      "红寺堡区",
      "盐池县",
      "同心县",
      "青铜峡市"
    ],
    "固原市": [
      "原州区",
      "西吉县",
      "隆德县",
      "泾源县",
      "彭阳县"
    ],
    "中卫市": [
      "沙坡头区",
      "中宁县",
      "海原县"
    ]
  },
  "新疆维吾尔自治区": {
    "乌鲁木齐市": [
      "天山区",
      "沙依巴克区",
      "新市区",
      "水磨沟区",
      "头屯河区",
      "达坂城区",
      "米东区",
      "乌鲁木齐县"
    ],
    "克拉玛依市": [
      "独山子区",
      "克拉玛依区",
      "白碱滩区",
      "乌尔禾区"
    ],
    "吐鲁番市": [
      "高昌区",
      "鄯善县",
      "托克逊县"
    ],
    "哈密市": [
      "伊州区",
      "巴里坤哈萨克自治县",
      "伊吾县"
    ],
    "昌吉回族自治州": [
      "昌吉市",
      "阜康市",
      "呼图壁县",
      "玛纳斯县",
      "奇台县",
      "吉木萨尔县",
      "木垒哈萨克自治县"
    ],
    "博尔塔拉蒙古自治州": [
      "博乐市",
      "阿拉山口市",
      "精河县",
      "温泉县"
    ],
    "巴音郭楞蒙古自治州": [
      "库尔勒市",
      "轮台县",
      "尉犁县",
      "若羌县",
      "且末县",
      "焉耆回族自治县",
      "和静县",
      "和硕县",
      "博湖县",
      "库尔勒经济技术开发区"
    ],
    "阿克苏地区": [
      "阿克苏市",
      "库车市",
      "温宿县",
      "沙雅县",
      "新和县",
      "拜城县",
      "乌什县",
      "阿瓦提县",
      "柯坪县"
    ],
    "克孜勒苏柯尔克孜自治州": [
      "阿图什市",
      "阿克陶县",
      "阿合奇县",
      "乌恰县"
    ],
    "喀什地区": [
      "喀什市",
      "疏附县",
      "疏勒县",
      "英吉沙县",
      "泽普县",
      "莎车县",
      "叶城县",
      "麦盖提县",
      "岳普湖县",
      "伽师县",
      "巴楚县",
      "塔什库尔干塔吉克自治县"
    ],
    "和田地区": [
      "和田市",
      "和田县",
      "墨玉县",
      "皮山县",
      "洛浦县",
      "策勒县",
      "于田县",
      "民丰县"
    ],
    "伊犁哈萨克自治州": [
      "伊宁市",
      "奎屯市",
      "霍尔果斯市",
      "伊宁县",
      "察布查尔锡伯自治县",
      "霍城县",
      "巩留县",
      "新源县",
      "昭苏县",
      "特克斯县",
      "尼勒克县"
    ],
    "塔城地区": [
      "塔城市",
      "乌苏市",
      "沙湾市",
      "额敏县",
      "托里县",
      "裕民县",
      "和布克赛尔蒙古自治县"
    ],
    "阿勒泰地区": [
      "阿勒泰市",
      "布尔津县",
      "富蕴县",
      "福海县",
      "哈巴河县",
      "青河县",
      "吉木乃县"
    ],
    "自治区直辖县级行政区划": [
      "石河子市",
      "阿拉尔市",
      "图木舒克市",
      "五家渠市",
      "北屯市",
      "铁门关市",
      "双河市",
      "可克达拉市",
      "昆玉市",
      "胡杨河市",
      "新星市"
    ]
  }
};
const fruits = [observable("西瓜,柠檬,草莓,荔枝,橘子,菠萝,香蕉,柚子,苹果,龙眼".split(","))];
const frutisEn = "watermelon,lemon,strawberry,litchi,orange,pineapple,banana,grapefruit,apple,longan".split(",");
const frutiData = observable(fruits[0]().map((name, idx) => ({
  text: name,
  value: frutisEn[idx]
})));
const vegetables = "香菜,青菜,芦笋,萝卜,水芹,黄瓜,冬瓜,番茄,茄子,土豆".split(",");
const vegetablesEn = "parsley,celery,asparagus,carrot,celery,cucumber,melon,tomato,eggplant,potato".split(",");
const vegetableData = observable(vegetables.map((name, idx) => ({
  text: name,
  value: vegetablesEn[idx]
})));
const mv = [observable("lemon"), observable("carrot")];
const mtv = [observable(), observable()];
let defaultProv = Object.keys(data)[0];
const keys = Object.keys(data);
Object.keys(data).forEach((k) => {
  keys[k] = Object.keys(data[k]);
  Object.keys(data[k]).forEach((kk) => {
    keys[k][kk] = data[k][kk];
  });
});
const sv = [observable("草莓")];
const stv = [observable()];
effect(() => console.log("Single changed", sv[0]()));
effect(() => console.log("Multiple changed", mv[0](), mv[1]()));
const dt = [
  observable(Object.keys(data)),
  //state
  observable(keys[defaultProv]),
  //Object.keys(data[defaultProv]), //city
  observable(keys[defaultProv][keys[defaultProv][0]])
  //data[defaultProv][Object.keys(data[defaultProv])[0]] //district
];
const dv = [observable(), observable(), observable()];
const tempValue = [observable(), observable(), observable()];
const empty = [];
effect(() => {
  console.log("tempValue", tempValue[0](), tempValue[1](), tempValue[2]());
});
effect(() => {
  console.log("dv", dv[0](), dv[1](), dv[2]());
});
render$1(/* @__PURE__ */ jsx("div", { children: [
  /* @__PURE__ */ jsx("h1", { children: "WheelPicker" }),
  /* @__PURE__ */ jsx("p", { children: "仿 iOS UIPickerView 的滚动选择器" }),
  /* @__PURE__ */ jsx("h3", { children: "单列" }),
  /* @__PURE__ */ jsx(
    WheelPicker,
    {
      title: /* @__PURE__ */ jsx("h1", { children: [
        " 单列选择器 ",
        /* @__PURE__ */ jsx("button", { onClick: (e) => stv[0]("香蕉"), children: " 香蕉" })
      ] }),
      data: fruits,
      value: sv,
      tempValue: stv,
      rows: 6,
      hideOnBackdrop: true
    }
  ),
  /* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx("label", { for: "demo2", children: "两列带默认值" }) }),
  /* @__PURE__ */ jsx(
    WheelPicker,
    {
      data: [frutiData, vegetableData],
      value: mv,
      tempValue: mtv
    }
  ),
  /* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx("label", { for: "demo3", children: "城市联动" }) }),
  /* @__PURE__ */ jsx(
    WheelPicker,
    {
      hideOnBackdrop: true,
      data: dt,
      value: dv,
      tempValue,
      resetSelectedOnDataChanged: true,
      onShow: () => {
        console.log("onShow");
      },
      onCancel: () => {
        console.log("onCancel");
      },
      formatValue: (value) => {
        return value.join(" ");
      }
    }
  )
] }), document.getElementById("voby"));
effect(() => {
  var _a2, _b2, _c, _d, _e;
  let l1 = keys[((_a2 = tempValue[0]()) == null ? void 0 : _a2.value) ?? tempValue[0]()] ?? empty;
  if (!(((_b2 = tempValue[1]()) == null ? void 0 : _b2.value) ?? tempValue[1]()))
    tempValue[1](l1[0]);
  let l2 = l1[((_c = tempValue[1]()) == null ? void 0 : _c.value) ?? tempValue[1]()] ?? empty;
  const d = dt;
  if (d[1]() !== l1 || d[2]() !== l2) {
    if (d[1]() !== l1 || d[2]() !== l2) {
      d[1](l1);
      if (d[2] !== l2)
        d[2](l2);
      const i1 = d[1]().indexOf(((_d = tempValue[1]()) == null ? void 0 : _d.value) ?? tempValue[1]()) === -1;
      const i2 = d[2]().indexOf(((_e = tempValue[2]()) == null ? void 0 : _e.value) ?? tempValue[2]()) === -1;
      if (i1 || i2) {
        dv[0](tempValue[0]());
        if (i1)
          dv[1](tempValue[1](d[1]()[0]));
        if (i2)
          dv[2](tempValue[2](d[2]()[0]));
      }
    }
  }
});
//# sourceMappingURL=index.es.js.map
