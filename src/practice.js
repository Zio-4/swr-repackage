/* eslint-disable no-param-reassign */
import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychAudioKeyboardResponse from "@jspsych/plugin-audio-keyboard-response";
import jsPsychHTMLSwipeResponse from '@jspsych-contrib/plugin-html-swipe-response';
import jsPsychAudioMultiResponse from '@jspsych-contrib/plugin-audio-multi-response'
import store from "store2";
import { isTouchScreen } from "./introduction";

import { jsPsych, config } from "./config";
import {
  audioContent, camelCase, imgContent,
} from "./preload";

/* For Practice Trial Only */
export const setup_fixation_practice = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: () => `<div class = stimulus_div><p class = 'stimulus'>+</p></div>`,
  prompt: `<img class="lower" src="${imgContent.arrowkeyLex}" alt = "arrow-key">`,
  choices: "NO_KEYS",
  trial_duration: config.timing.fixationTime,
  data: {
    task: "fixation",
  },
  on_load: () => console.log('This is setup fixation practice'),
  on_finish: function () {
    jsPsych.setProgressBar(0);
  },
};

export const lexicality_test_practice = {
  type: jsPsychHTMLSwipeResponse,
  stimulus: () => {
    return (
      `<div class='stimulus_div'>
        <p id="stimulus-word" class='stimulus'>${jsPsych.timelineVariable("stimulus")}</p>
      </div>`
    )
  },
  prompt: `<div><img class="lower" src="${imgContent.arrowkeyLex}" alt="arrow keys"></div>`,
  trial_duration: config.timing.trialTime,
  keyboard_choices: ["ArrowLeft", "ArrowRight"],
  data: {
    save_trial: true,
    task: "practice_response" /* tag the test trials with this taskname so we can filter data later */,
    word: jsPsych.timelineVariable("stimulus"),
  },
  on_load: () => console.log('Practice lexicality trial'),
  on_start: () => {
    let stimulusDuration

    store.session.transact("practiceIndex", (oldVal) => oldVal + 1);
    if (store.session("practiceIndex") > config.countSlowPractice) {
      stimulusDuration = config.timing.stimulusTime;
    } else {
      stimulusDuration = config.timing.stimulusTimePracticeOnly;
    }

    setTimeout(() => {
      if (stimulusDuration) {
        document.getElementById("stimulus-word").style.visibility = 'hidden'
      }
    }, stimulusDuration)
  },
  on_finish: (data) => {
    if (data.keyboard_response) {
      data.correct = jsPsych.pluginAPI.compareKeys(
        data.keyboard_response,
        jsPsych.timelineVariable("correct_response"),
      )
    } else {
      let correctSwipeDirection = jsPsych.timelineVariable("correct_response").toLowerCase().substring(5)
      data.correct = correctSwipeDirection === data.swipe_response
    }

    if (data.correct) {
      store.session.set("response", 1);
    } else {
      store.session.set("response", 0);
    }
    store.session.set("currentTrialCorrect", data.correct);

    const isLeftResponse = data.keyboard_response === 'arrowleft' || data.swipe_response === 'left'   
    store.session.set("responseLR", isLeftResponse ? "left" : "right");
    store.session.set("answerRP", isLeftResponse ? "made-up" : "real");
    store.session.set("responseColor", isLeftResponse ? "orange" : "blue");

    const isLeftAnswer = jsPsych.timelineVariable("correct_response") === "ArrowLeft";
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
      pid: config.pid,
    });

    jsPsych.setProgressBar(0);
  },
};

const feedbackStimulus = () => {
  const previousTrialData = jsPsych.data.get().last(2).values()[0]

  let isCorrect

  if (previousTrialData.keyboard_response) {
    isCorrect = previousTrialData.keyboard_response.toLowerCase() === previousTrialData.correctResponse.toLowerCase()
  } else {
    isCorrect = previousTrialData.swipe_response === previousTrialData.correctResponse.toLowerCase().substring(5)
  }

  if (isCorrect) {
    return audioContent[camelCase(`feedback_${jsPsych.timelineVariable("stimulus")}_correct`)];
  }

  return audioContent[camelCase(`feedback_${jsPsych.timelineVariable("stimulus")}_wrong`)];
};


export const practice_feedback = {
  type: jsPsychAudioMultiResponse,
  response_allowed_while_playing: config.testingOnly,
  prompt_above_buttons: true,
  stimulus: () => feedbackStimulus(),
  prompt: () => {
    return (`<div class = stimulus_div>
      <p class="feedback">
        ${isTouchScreen ? `<span class=${store.session("responseColor")}>You swiped ${store.session("responseLR")} which is for ${store.session("answerRP")} words!</span>` : `<span class=${store.session("responseColor")}>You pressed the ${store.session("responseLR")} arrow key, which is for ${store.session("answerRP")} words! </span>`}
        <br></br>
        ${jsPsych.timelineVariable("stimulus")}
        ${isTouchScreen ? `<span class=${store.session("answerColor")}> is a ${store.session("correctRP")}  word. Press the ${store.session("correctLR")} arrow to continue.</span>` : `<span class=${store.session("answerColor")}> is a ${store.session("correctRP")}  word. Press the ${store.session("correctLR")} arrow key to continue.</span>`}
      </p>
    </div>
    ${!isTouchScreen ? `<img class="lower" src="${store.session("correctRP") === "made-up" ? `${imgContent.arrowkeyLexLeft}` : `${imgContent.arrowkeyLexRight}`}" alt="arrow keys">` : ''}`)
  },
  keyboard_choices: () => store.session("correctRP") === "made-up" ? ["ArrowLeft"] : ["ArrowRight"],
  button_choices: () => isTouchScreen ? store.session("correctRP") === "made-up" ? ["Left"] : ["Right"] : [],
  button_html: () => {
    return (
      `
      <div class='practice-feedback-btn-container'>
        <button class='practice-feedback-btn'>
          <img class='practice-feedback-img' src=${store.session("correctRP") === "made-up" ? `${imgContent.arrowkeyLexLeft}` : `${imgContent.arrowkeyLexRight}`} alt="Arrow choices"/>
        </button
      </div>
      `
    )
  },
};

export const if_node_left = {
  // timeline: [practice_feedback_left],
  conditional_function: () => store.session("correctRP") === "made-up",
};

export const if_node_right = {
  // timeline: [practice_feedback_right],
  conditional_function: () => store.session("correctRP") === "real",
};
