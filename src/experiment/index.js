// index.js
import { initConfig } from './config/config';
import { buildExperiment } from './experiment';
import './css/game.css';
import configStore from '../configStore'
import store from 'store2';

export class RoarSWR {
    constructor (firekit, params, displayElement) {
      // TODO: Add validation of params so that if any are missing, we throw an error
      this.params = params
      this.firekit = firekit
      this.displayElement = displayElement
    }
  
    async init() {
      await this.firekit.startRun();
      const config = await initConfig(this.firekit, this.params, this.displayElement);
      // return buildExperiment(config);
      // const newConfigValues = await initConfig(this.firekit, this.params, this.displayElement);
      // configStore.updateConfig(newConfigValues);
      store.session.set("config", config)
      return buildExperiment(configStore.getConfig());
    }
  
    async run() {
      const { jsPsych, timeline } = await this.init()
      jsPsych.run(timeline);
    }
} 
