import { QuestCreate } from "jsQUEST";
import Papa from "papaparse";

/* set user mode */
// "beginner": block A only with random words, a new block with 28 new words;
// "regular":  3 blocks in random order with one block consisting 56 adaptive words and 28 new words
const queryString = new URL(window.location).search;
const urlParams = new URLSearchParams(queryString);
const userMode = urlParams.get("mode");

const stimulusRuleLists = {
  beginner: ["random", "adaptive"],
  regular: ["adaptive", "random", "random"],
  test: ["adaptive", "random", "random"],
};

const stimulusCountLists = {
  beginner: [84, 28],
  regular: [84, 84, 84],
  test: [10, 4, 4],
};

const numAdaptiveTrials = {
  beginner: 0,
  regular: 60,
  test: 8,
};

// Stimulus timing options in milliseconds
const stimulusTimeOptions = [null, 350, 1000, 2000];
// Fixation presentation time options in milliseconds
const fixationTimeOptions = [1000, 2000, 25000];
// Trial completion time options in milliseconds
const trialTimeOptions = [null, 5000, 8000, 100000];

export const config = {
  userMode,
  pid: urlParams.get("pid"),
  sessionId: urlParams.get("sessionId"),
  testingOnly: urlParams.get("test") ? urlParams.get("test") === "true" : false,
  // set order and rule for the experiment
  stimulusRuleList: stimulusRuleLists[userMode],
  // Number of trials in each block of the experiment
  stimulusCountList: stimulusCountLists[userMode],
  // number of adaptive trials
  totalAdaptiveTrials: numAdaptiveTrials[userMode],
  timing: {
    stimulusTimePracticeOnly: stimulusTimeOptions[0], // null as default for practice trial only
    stimulusTime: stimulusTimeOptions[1],
    fixationTime: fixationTimeOptions[0],
    trialTimePracticeOnly: trialTimeOptions[0],
    trialTime: trialTimeOptions[0],
  },
};

/* set number of trials for practice block */
var totalTrials_Practice = 5; //default: 5
var practiceIndex = 0;
var countSlowPractice = 2; //number of practice trials that will keep stimulus on screen untill participant's input

/* set number of difficulty levels for the adaptive block of the experiment  */
var difficultyLevels = 6;

/* Counting vairables */
var count_adaptive_trials = 0;
var newword_index = 0;
var block_new;
var currentBlockIndex;
var stimulusRule;
var stimulusIndex = { blockA: 0, blockB: 0, blockC: 0 };
var nextStimulus = [];
var response;

/* variables used in practice feedbacks */
const practiceFeedback = (data) => {};

var responseLR;
var answerRP;
var correctRP;
var answerColor;
var responseColor;
var currentPracStimulus;
var arrowDisplay;
var correctLR;
var practiceIndex = 0;
var practiceFeedbackAudio;

/* variables to track current state of the experiment*/
var currentStimulus;
var currentBlock;
var currentTrialCorrect; //return true or false

/* list of three stimuli blocks*/
var stimulusLists;

var trialCorrectAns; //for storing the correct answer on a given trial
var staircaseChecker = []; //for assessing whether the span should move up/down/stay
var staircaseIndex = 0; //index for the current staircase

var startingDifficulty = 0; //where we begin in terms of difficulty
var currentDifficulty = 0; //to reference where participants currently are
var difficultyHistory = []; //easy logging of the participant's trajectory

var roarTrialNum = 1; //counter for trials

var coinTrackingIndex = 0;

/* feedback */
//let feedback = True;

/* record date */
export const startTime = new Date();

/* simple variable for calculating sum of an array */
const arrSum = (arr) => arr.reduce((a, b) => a + b, 0);

/* csv helper function */
export const readCSV = (url) => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        var csv_stimuli = results.data;
        resolve(csv_stimuli);
      },
    });
  });
};

/* set QUEST param */
export const questConfig = {
  tGuess: 2,
  tGuessSd: 1,
  pThreshold: 0.75,
  beta: 1,
  delta: 0.05,
  gamma: 0.5,
};

export const myquest = QuestCreate(
  questConfig.tGuess,
  questConfig.tGuessSd,
  questConfig.pThreshold,
  questConfig.beta,
  questConfig.delta,
  questConfig.gamma
);

var response;

export const getClosest = (arr, val1, val2, target) => {
  if (target - arr[val1].difficulty >= arr[val2].difficulty - target)
    return val2;
  else return val1;
};

export const findClosest = (arr, target) => {
  let n = arr.length;
  // Corner cases
  if (target <= arr[0].difficulty) return 0;
  if (target >= arr[n - 1].difficulty) return n - 1;
  // Doing binary search
  let i = 0,
    j = n,
    mid = 0;
  while (i < j) {
    mid = Math.ceil((i + j) / 2);
    if (arr[mid].difficulty == target) return mid;
    // If target is less than array
    // element,then search in left
    if (target < arr[mid].difficulty) {
      // If target is greater than previous
      // to mid, return closest of two
      if (mid > 0 && target > arr[mid - 1].difficulty)
        return getClosest(arr, mid - 1, mid, target);
      // Repeat for left half
      j = mid;
    }
    // If target is greater than mid
    else {
      if (mid < n - 1 && target < arr[mid + 1].difficulty)
        return getClosest(arr, mid, mid + 1, target);
      i = mid + 1; // update i
    }
  }
  // Only single element left after search
  return mid;
};

export const updateProgressBar = () => {
  const curr_progress_bar_value = jsPsych.getProgressBarCompleted();
  jsPsych.setProgressBar(
    curr_progress_bar_value + 1 / arrSum(config["stimulusCountList"])
  );
};
