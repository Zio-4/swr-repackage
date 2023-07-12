import { firekit } from "./experimentSetup";
import { jsPsych, config } from "./config/config";
import jsPsychPreload from "@jspsych/plugin-preload";
import { deviceType, primaryInput } from 'detect-it';
import mime from 'mime-types';
import path from 'path-browserify'

// const extend = (fn, code) =>
//   function () {
//     // eslint-disable-next-line prefer-rest-params
//     fn.apply(fn, arguments);
//     // eslint-disable-next-line prefer-rest-params
//     code.apply(fn, arguments);
//   };

// jsPsych.opts.on_finish = extend(jsPsych.opts.on_finish, () => {
//   firekit.finishRun();
// });

// const timingData = {
//   start_time_utc0: config.startTime.toISOString(),
//   start_time_unix: config.startTime.getTime(),
//   start_time_local: config.startTime.toLocaleString(),
//   timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
// };


// jsPsych.opts.on_data_update = extend(jsPsych.opts.on_data_update, (data) => {
//   /*if (data.trial_index >= 10) {
//     firekit?.writeTrial(data);
//   }*/
//   if (data.save_trial) {
//     // firekit?.writeTrial(data);
//     firekit?.writeTrial({
//       timingData,
//       userInfo: firekit?.userInfo,
//       ...data,
//     });
//   }
// });

// window.onerror = function (msg, url, lineNo, columnNo, error) {
//   firekit?.writeTrial({
//       task: "error",
//       lastTrial: jsPsych.data.getLastTrialData().trials[0],
//       message: String(msg),
//       source: url || null,
//       lineNo: String(lineNo || null),
//       colNo: String(columnNo || null),
//       error: JSON.stringify(error || null),
//   })
//   return false;
// };

/* simple variable for calculating sum of an array */
const arrSum = (arr) => arr.reduce((a, b) => a + b, 0);


export const updateProgressBar = () => {
  const curr_progress_bar_value = jsPsych.getProgressBarCompleted();
  jsPsych.setProgressBar(curr_progress_bar_value + 1 / arrSum(config.stimulusCountList));
};


// This is to track correct trials
export const updateCorrectChecker = () => {
  const trials = jsPsych.data.get().filter({ task: "test_response" });
  const correct_trials = trials.filter({ correct: true });
}