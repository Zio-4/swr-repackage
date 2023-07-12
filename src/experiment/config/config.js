import { initJsPsych } from "jspsych";
import Papa from "papaparse";
import store from "store2";
import i18next from "i18next";
import '../i18n';
// import { firekit } from "../experimentSetup";
import { getUserDataTimeline } from "../trials/getUserData";
import { preloadTrials } from "./preload";
import { enter_fullscreen } from "../trials/fullScreen";


const makePid = () => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 16; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

const initStore = (config) => {
  if (store.session.has("initialized") && store.local("initialized")) {
    return store.session;
  }
  if ((userMode === 'fullAdaptive') || (userMode === 'testAdaptive') || (userMode === "shortAdaptive") || ((userMode === "longAdaptive"))) {
    store.session.set("itemSelect", "mfi");
  } else {
    store.session.set("itemSelect", "random");
  }
  store.session.set("practiceIndex", 0);
  // Counting variables
  store.session.set("currentBlockIndex", 0);
  store.session.set("trialNumBlock", 0); // counter for trials in block
  store.session.set("trialNumTotal", 0); // counter for trials in experiment
  store.session.set("demoCounter", 0);
  store.session.set("nextStimulus", null);
  store.session.set("response", "");

  // variables to track current state of the experiment
  store.session.set("currentTrialCorrect", true); // return true or false
  store.session.set("coinTrackingIndex", 0);

  store.session.set("initialized", true);

  return store.session;
};

const setRandomUserMode = (mode) => {
  if (mode === "test") {
    return (Math.random() < 0.5) ? 'testAdaptive' : 'testRandom';
  } if (mode === "full") {
    return (Math.random() < 0.5) ? 'fullAdaptive' : 'fullRandom';
  } 
  return mode;
};

const stimulusRuleLists = {
  fullRandom: ["random", "random", "random"],
  fullAdaptive: ["adaptive", "adaptive", "adaptive"],
  shortAdaptive: ["adaptive", "adaptive", "adaptive"],
  longAdaptive: ["adaptive", "adaptive", "adaptive"],
  fullItemBank: ['random', 'random', 'random'],
  demo: ["demo"],
  testAdaptive: ["adaptive", "adaptive", "adaptive"],
  testRandom: ["adaptive", "adaptive", "adaptive"],
};

// Stimulus timing options in milliseconds
const stimulusTimeOptions = [null, 350, 1000, 2000];
// Fixation presentation time options in milliseconds
const fixationTimeOptions = [1000, 2000, 25000];
// Trial completion time options in milliseconds
const trialTimeOptions = [null, 5000, 8000, 100000];


// eslint-disable-next-line max-len
const divideTrial2Block = (n1, n2, nBlock) => {
  const n = parseInt(n1, 10) + parseInt(n2, 10);
  return [Math.floor(n / nBlock), Math.floor(n / nBlock), n - (2 * Math.floor(n / nBlock))];
};

export const stimulusCountLists = (userMode, numNew, numAdaptive) => {
  const modeList = {fullAdaptive: [82, 82, 81],
    fullRandom: [25, 25, 25],
    shortAdaptive: divideTrial2Block(numAdaptive, numNew, 3),
    longAdaptive: divideTrial2Block(numAdaptive, numNew, 3),
    fullItemBank: divideTrial2Block(numValidated, numNew, 3),
    demo: [84],
    testAdaptive: [6, 4, 4],
    testRandom: [6, 4, 4]
  }

  return modeList[userMode]
};

export const shuffle = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements array[i] and array[j]
    // use "destructuring assignment" syntax
    // eslint-disable-next-line no-param-reassign
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};


export const initConfig = async (firekit, params, displayElement) => {
  const { userMode,
          pid, 
          labId, 
          schoolId, 
          taskVariant, 
          userMetadata, 
          skipInstructions, 
          studyId, 
          classId, 
          urlParams,
          consent,
          audioFeedback,
          language,
          numAdaptive,
          numNew,
          numValidated,
  } = params

  const config = {
          userMode: setRandomUserMode(userMode) || 'shortAdaptive',
          pid, 
          labId, 
          schoolId, 
          taskVariant: taskVariant || "pilot", 
          userMetadata, 
          skipInstructions: skipInstructions || false, 
          studyId, 
          classId, 
          urlParams,
          consent: consent || true,
          audioFeedback: audioFeedback || 'binary',
          language,
          // using somewhere else?
          numAdaptive: numAdaptive || (userMode === "shortAdaptive" ? 85 : 150),
          numNew: numNew || (userMode === "shortAdaptive" ? 15 : 25),
          numValidated: numValidated || (userMode === "fullItemBank" ? 246 : 100),
          //
          adaptive2new: Math.floor(numAdaptive / numNew),
          stimulusRuleList: stimulusRuleLists[userMode],
          stimulusCountList: stimulusCountLists(userMode, numNew, numAdaptive),
          totalTrialsPractice: 5,
          countSlowPractice: 2,
          nRandom: 5,

          timing: {
            stimulusTimePracticeOnly: stimulusTimeOptions[0], // null as default for practice trial only
            stimulusTime: stimulusTimeOptions[1],
            fixationTime: fixationTimeOptions[0],
            trialTimePracticeOnly: trialTimeOptions[0],
            trialTime: trialTimeOptions[0],
          },
          startTime: new Date(),
          userMetadata: {},
          firekit,
          displayElement: displayElement || null
  }

  if (config.pid !== null) {
    // const userInfo = {
    //   id: config.pid,
    //   studyId: config.studyId || null,
    //   classId: config.classId || null,
    //   schoolId: config.schoolId || null,
    //   userMetadata: config.userMetadata,
    // };

    await config.firekit.updateUser({ assessmentPid: config.pid, ...userMetadata });
  }

  return config;
}

export const initRoarJsPsych = (config) => {
  // ROAR apps communicate with the participant dashboard by passing parameters
  // through the URL. The dashboard can be made to append a "gameId"
  // parameter, e.g., https://my-roar-app.web.app?gameId=1234.
  // Similarly, at the end of the assessment the ROAR app communicates with the
  // dashboard to let it know that the participant has finished the assessment.
  // The dashboard expects a game token, "g", and a completion
  // status, "c", e.g., https://reading.stanford.edu/?g=1234&c=1. Here we inspect
  // the "gameId" parameter that was passed through the URL query string and
  // construct the appropriate redirect URL.
  const queryString = new URL(window.location).search;
  const urlParams = new URLSearchParams(queryString);
  const gameId = urlParams.get('gameId') || null;

  const redirect = () => {
    if (gameId === null) {
      // If no game token was passed, we refresh the page rather than
      // redirecting back to the dashboard
      // window.location.reload();
      if (taskVariant === 'school') {
        if (userMode === 'shortAdaptive') {
          window.location.href = `https://reading.stanford.edu?g=1154&c=1`;
        } else {
          window.location.href = `https://reading.stanford.edu?g=901&c=1`;
        }
      } else if (taskVariant === 'UCSF') {
        window.location.href = `https://reading.stanford.edu?g=937&c=1`;
      } else if (taskVariant === 'RF') {
        window.location.href = `https://reading.stanford.edu?g=940&c=1`;
      } else if (taskVariant === 'prolific') {
        window.location.href = `https://app.prolific.co/submissions/complete?cc=CK1VQ7DP`; // TO DO: change to prolific redirect
      }
    } else {
      // Else, redirect back to the dashboard with the game token that
      // was originally provided
      window.location.href = `https://reading.stanford.edu/?g=${gameId}&c=1`;
    }
  };

  const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    message_progress_bar: `${i18next.t('progressBar')}`,
    on_finish: () => {
      redirect();
    },
  });

  if (config.displayElement) {
    jsPsych.opts.display_element = config.display_element
  }

  // Extend jsPsych's on_finish and on_data_update lifecycle functions to mark the
  // run as completed and write data to Firestore, respectively.
  const extend = (fn, code) =>
    function () {
      // eslint-disable-next-line prefer-rest-params
      fn.apply(fn, arguments);
      // eslint-disable-next-line prefer-rest-params
      code.apply(fn, arguments);
    };

  jsPsych.opts.on_finish = extend(jsPsych.opts.on_finish, () => {
    config.firekit.finishRun();
  });

  const timingData = {
    start_time_utc0: config.startTime.toISOString(),
    start_time_unix: config.startTime.getTime(),
    start_time_local: config.startTime.toLocaleString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  jsPsych.opts.on_data_update = extend(jsPsych.opts.on_data_update, (data) => {
    if (data.save_trial) {
      config.firekit.writeTrial({
        timingData,
        userInfo: config.firekit.userInfo,
        ...data,
      });
    }
  });

  // Add a special error handler that writes javascript errors to a special trial
  // type in the Firestore database
  window.addEventListener('error', (e) => {
    const { msg, url, lineNo, columnNo, error } = e;

    config.firekit?.writeTrial({
      task: 'error',
      lastTrial: jsPsych.data.getLastTrialData().trials[0],
      message: String(msg),
      source: url || null,
      lineNo: String(lineNo || null),
      colNo: String(columnNo || null),
      error: JSON.stringify(error || null),
      timeStamp: new Date().toISOString(),
    });
  });

  initStore(config);

  return jsPsych;
};

export const initRoarTimeline = (config) => {
  // If the participant's ID was **not** supplied through the query string, then
  // ask the user to fill out a form with their ID, class and school.
  const initialTimeline = [ preloadTrials, enter_fullscreen, ...getUserDataTimeline]
  
  const beginningTimeline = {
    timeline: initialTimeline,
    on_timeline_finish: async () => {
      // eslint-disable-next-line no-param-reassign
      config.pid = config.pid || makePid();
      await config.firekit.updateUser({ assessmentPid: config.pid, labId: config.labId, ...config.userMetadata });
    },
  };

  return beginningTimeline;
};


// export const initializeRoarFireKit = async () => {
//   config.pid = config.pid || makePid();
//   let prefix = config.pid.split("-")[0];
//   if (prefix === config.pid || config.taskVariant !== 'school'){
//     prefix = "pilot";
//   }
//   const userInfo = {
//     id: config.pid,
//     studyId: config.taskVariant + "-" + config.userMode,
//     schoolId: config.schoolId || prefix,
//     userMetadata: config.userMetadata,
//   };

//   firekit = new RoarFirekit({
//     config: roarConfig,
//     userInfo: userInfo,
//     taskInfo,
//   });
//   await firekit.startRun();
// }