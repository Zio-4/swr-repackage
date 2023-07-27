/* eslint-disable import/extensions */
import store from "store2";
import { initConfig } from "./experiment/config/config";
import { buildExperiment } from "./experiment/experiment";
import "./experiment/css/game.css";
import { waitFor } from "./experiment/helperFunctions";

class RoarSWR {
  constructor(firekit, gameParams, userParams, displayElement) {
    // TODO: Add validation of params so that if any are missing, we throw an error
    this.gameParams = gameParams;
    this.userParams = userParams;
    this.firekit = firekit;
    this.displayElement = displayElement;
  }

  async init() {
    await this.firekit.startRun();
    const config = await initConfig(
      this.firekit,
      {...this.gameParams, ...this.userParams},
      this.displayElement,
    );
    // configStore.updateConfig(newConfigValues);
    store.session.set("config", config);
    return buildExperiment(config);
  }

  async run() {
    const { jsPsych, timeline } = await this.init();
    jsPsych.run(timeline);
    await waitFor(() => this.firekit.run.completed === true);
  }
}

export default RoarSWR;
