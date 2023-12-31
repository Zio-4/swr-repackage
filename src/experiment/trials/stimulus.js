/* eslint-disable import/no-cycle */
import jsPsychHTMLMultiResponse from "@jspsych-contrib/plugin-html-multi-response";
import store from "store2";
import { isTouchScreen } from "../experimentSetup";
import { cat, cat2, mediaAssets } from "../experiment";
import { jsPsych } from "../jsPsych";

const lexicalityTrialContent = [
  {
    stimulus: () => `
    <div class='stimulus_div'>
      <p class='stimulus'>${jsPsych.timelineVariable("stimulus")}</p>
    </div>`,
    stimulus_duration: () => {
      store.session.transact("practiceIndex", (oldVal) => oldVal + 1);
      if (
        store.session("practiceIndex") >
        store.session.get("config").countSlowPractice
      ) {
        return store.session.get("config").timing.stimulusTime;
      }
      return store.session.get("config").timing.stimulusTimePracticeOnly;
    },
    data: {
      save_trial: true,
      task: "practice_response" /* tag the test trials with this taskname so we can filter data later */,
      word: () => {
        jsPsych.timelineVariable("stimulus");
      },
    },
    on_finish: (data) => {
      const correctResponse = jsPsych.timelineVariable("correct_response");

      if (data.keyboard_response) {
        // eslint-disable-next-line no-param-reassign
        data.correct = jsPsych.pluginAPI.compareKeys(
          data.keyboard_response,
          correctResponse,
        );
      } else if (
        correctResponse === "ArrowLeft" &&
        data.button_response === 0
      ) {
        // eslint-disable-next-line no-param-reassign
        data.correct = true;
      } else if (
        correctResponse === "ArrowRight" &&
        data.button_response === 1
      ) {
        // eslint-disable-next-line no-param-reassign
        data.correct = true;
      } else {
        // eslint-disable-next-line no-param-reassign
        data.correct = false;
      }

      if (data.correct) {
        store.session.set("response", 1);
      } else {
        store.session.set("response", 0);
      }
      store.session.set("currentTrialCorrect", data.correct);

      const isLeftResponse =
        data.keyboard_response === "arrowleft" || data.button_response === 0;
      store.session.set("responseLR", isLeftResponse ? "left" : "right");
      store.session.set("answerRP", isLeftResponse ? "made-up" : "real");
      store.session.set("responseColor", isLeftResponse ? "orange" : "blue");

      const isLeftAnswer =
        jsPsych.timelineVariable("correct_response") === "ArrowLeft";
      store.session.set("correctLR", isLeftAnswer ? "left" : "right");
      store.session.set("correctRP", isLeftAnswer ? "made-up" : "real");
      store.session.set("answerColor", isLeftAnswer ? "orange" : "blue");

      jsPsych.data.addDataToLastTrial({
        correct: store.session("response"),
        correctResponse: jsPsych.timelineVariable("correct_response"),
        realpseudo: jsPsych.timelineVariable("realpseudo"),
        block: "Practice",
        corpusId: "Practice",
        trialNumPractice: store.session("practiceIndex"),
        pid: store.session.get("config").pid,
      });

      jsPsych.setProgressBar(0);
    },
  },
  {
    stimulus: () => `
    <div class='stimulus_div'>
      <p id="stimulus-word" class='stimulus'>
        ${store.session("nextStimulus").stimulus}
      </p>
    </div>`,
    stimulus_duration: () => store.session.get("config").timing.stimulusTime,
    data: {
      save_trial: true,
      task: "test_response" /* tag the test trials with this taskname so we can filter data later */,
    },
    on_finish: (data) => {
      const nextStimulus = store.session("nextStimulus");

      if (data.keyboard_response) {
        // eslint-disable-next-line no-param-reassign
        data.correct = jsPsych.pluginAPI.compareKeys(
          data.keyboard_response,
          nextStimulus.correct_response,
        );
      } else if (
        nextStimulus.correct_response === "ArrowLeft" &&
        data.button_response === 0
      ) {
        // eslint-disable-next-line no-param-reassign
        data.correct = true;
      } else if (
        nextStimulus.correct_response === "ArrowRight" &&
        data.button_response === 1
      ) {
        // eslint-disable-next-line no-param-reassign
        data.correct = true;
      } else {
        // eslint-disable-next-line no-param-reassign
        data.correct = false;
      }

      store.session.set("currentTrialCorrect", data.correct);

      if (data.correct) {
        store.session.set("response", 1);
      } else {
        store.session.set("response", 0);
      }

      if (nextStimulus.corpus_src !== "corpusNew") {
        cat.updateAbilityEstimate(
          { a: 1, b: nextStimulus.difficulty, c: 0.5, d: 1 },
          store.session("response"),
        );
      }

      cat2.updateAbilityEstimate(
        { a: 1, b: nextStimulus.difficulty, c: 0.5, d: 1 },
        store.session("response"),
      );

      jsPsych.data.addDataToLastTrial({
        block: store.session("currentBlockIndex"),
        corpusId: nextStimulus.corpus_src,
        word: nextStimulus.stimulus,
        correct: store.session("response"),
        correctResponse: nextStimulus.correct_response,
        responseInput: data.keyboard_response ? "keyboard" : "touch",
        realpseudo: nextStimulus.realpseudo,
        difficulty: nextStimulus.difficulty,
        thetaEstimate: cat.theta,
        thetaSE:
          cat.seMeasurement === Infinity ? Number.MAX_VALUE : cat.seMeasurement,
        thetaEstimate2: cat2.theta,
        thetaSE2:
          cat2.seMeasurement === Infinity
            ? Number.MAX_VALUE
            : cat2.seMeasurement,
        stimulusRule: cat.itemSelect,
        trialNumTotal: store.session("trialNumTotal"),
        trialNumBlock: store.session("trialNumBlock"),
        pid: store.session.get("config").pid,
      });

      const config = store.session.get("config");

      // Does this do anything?
      // const trials = jsPsych.data.get().filter({ task: "test_response" });
      // trials.filter({ correct: true });

      const currProgressBar = jsPsych.getProgressBarCompleted();
      jsPsych.setProgressBar(
        currProgressBar +
          1 / config.stimulusCountList.reduce((a, b) => a + b, 0),
      );
    },
  },
];

// eslint-disable-next-line no-unused-vars
const lexicalityTrialsMapped = lexicalityTrialContent.map((trial, _i) => ({
  type: jsPsychHTMLMultiResponse,
  stimulus: trial.stimulus,
  prompt: () =>
    !isTouchScreen
      ? `<img class="lower" src="${mediaAssets.images.arrowkeyLex}" alt = "arrow-key">`
      : "",
  stimulus_duration: trial.stimulus_duration,
  trial_duration: () => store.session.get("config").timing.trialTime,
  keyboard_choices: ["ArrowLeft", "ArrowRight"],
  button_choices: () => (isTouchScreen ? ["ArrowLeft", "ArrowRight"] : []),
  // eslint-disable-next-line consistent-return
  button_html: () => {
    if (isTouchScreen) {
      return [
        `<button class="lexicality-trial-arrows">
                    <img class='btn-arrows' src=${mediaAssets.images.staticLeftKey} alt='left arrow' />
                    </button>`,
        `<button class="lexicality-trial-arrows">
                    <img class='btn-arrows' src=${mediaAssets.images.staticRightKey} alt='right arrow' />
                    </button>`,
      ];
    }
  },
  data: trial.data,
  on_load: () => {
    if (isTouchScreen) {
      document.getElementById(
        "jspsych-html-multi-response-button-0",
      ).style.margin = "0rem 5rem 0rem 5rem";
      document.getElementById(
        "jspsych-html-multi-response-button-1",
      ).style.margin = "0rem 5rem 0rem 5rem";
    }
  },
  on_finish: trial.on_finish,
}));

export const leixcalityPractice = lexicalityTrialsMapped[0];
export const lexicalityTest = lexicalityTrialsMapped[1];
