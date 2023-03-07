import Bus from '../utils/bus';
import { formatConversion } from '../utils/common';

export default {
  created() {
    this.subscribe = this.$emitter_create_subscribe();
    const defaultEmit = this.$emit;
    const componentName = formatConversion(this.$options.name).replace(
      'sh-',
      ''
    );
    this.$emit = (eventName, ...args) => {
      defaultEmit.call(this, eventName, ...args);
      this.subscribe &&
        this.subscribe.$emit(`${componentName}:${eventName}`, ...args);
    };
  },
  methods: {
    $emitter_create_subscribe() {
      const subscribe = {};
      const preStr = this.emitterId ? `${this.emitterId}:` : '';
      subscribe.$emit = (name, ...args) => {
        const eventName = `${preStr}${name}`;
        Bus.$emit(eventName, ...args);
      };
      subscribe.$on = (name, callback) => {
        let eventName;
        if (name instanceof Array) {
          eventName = name.map((ele) => `${preStr}${ele}`);
        } else {
          eventName = `${preStr}${name}`;
        }
        Bus.$on(eventName, callback);
      };
      subscribe.$once = (name, callback) => {
        const eventName = `${preStr}${name}`;
        Bus.$once(eventName, callback);
      };
      subscribe.$off = (name, callback) => {
        let eventName;
        if (name instanceof Array) {
          eventName = name.map((ele) => `${preStr}${ele}`);
        } else {
          eventName = `${preStr}${name}`;
        }
        Bus.$off(eventName, callback);
      };

      return subscribe;
    }
  }
};
