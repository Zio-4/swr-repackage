// configStore.js
export class Config {
    constructor(initialValues = {}) {
      this.values = initialValues;
    }
  
    update(newValues) {
      this.values = { ...this.values, ...newValues };
    }
  
    get() {
      return this.values;
    }
  }
  

const config = new Config();

export default {
  getConfig: () => config.get(),
  updateConfig: (newValues) => config.update(newValues),
};
