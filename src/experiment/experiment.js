/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import store from "store2";

// Import necessary for async in the top level of the experiment script
import "regenerator-runtime/runtime";

// Local modules
import { blockPractice } from "./config/corpus";

// trials
import { audio_response } from "./trials/audioFeedback";
import { introduction_trials, post_practice_intro,} from "./trials/introduction";
import { practice_feedback } from "./trials/practiceFeedback";
import { mid_block_page_list, post_block_page_list, final_page, } from "./trials/gameBreak";
import { if_not_fullscreen, exit_fullscreen } from './trials/fullScreen';
import { setup_fixation_test, setup_fixation_practice } from './trials/setupFixation';
import { lexicalityTest, leixcalityPractice } from './trials/stimulus'
import { countdown_trials } from "./trials/countdown";
import { if_coin_tracking } from "./trials/coinFeedback";

// Create these functions
import { initRoarJsPsych, initRoarTimeline } from './config';

// CSS imports
// import "./css/game.css";


export function buildExperiment(config) {

  console.log('config in store2: ', store.get('config'))

  // Initialize jsPsych and timeline
  const jsPsych = initRoarJsPsych(config);
  let timeline = initRoarTimeline(config);

  timeline = [...timeline, introduction_trials, if_not_fullscreen, countdown_trials]

  // the core procedure
  const pushPracticeTotimeline = (array) => {
    array.forEach((element) => {
      const block = {
        timeline: [
          setup_fixation_practice,
          leixcalityPractice,
          audio_response,
          practice_feedback,
        ],
        timeline_variables: [element],
      };
      timeline.push(block);
    });
  }

  const blockPracticeStimuli = blockPractice(config);

  pushPracticeTotimeline(blockPracticeStimuli);
  timeline.push(post_practice_intro);
  timeline.push(if_not_fullscreen);

  const core_procedure = {
    timeline: [
      setup_fixation_test,
      lexicalityTest,
      audio_response,
      if_coin_tracking,
    ],
  };

  const pushTrialsTotimeline = (stimulusCounts) => {
    for (let i = 0; i < stimulusCounts.length; i++) {
      // for each block: add trials
      /* add first half of block */
      const roar_mainproc_block_half_1 = {
        timeline: [core_procedure],
        conditional_function: () => {
          if (stimulusCounts[i] === 0) {
            return false;
          }
          store.session.set("currentBlockIndex", i);
          return true;
        },
        repetitions: Math.floor(stimulusCounts[i] / 2) + 1,
      };
      /* add second half of block */
      const roar_mainproc_block_half_2 = {
        timeline: [core_procedure],
        conditional_function: () => {
          return stimulusCounts[i] !== 0;
        },
        repetitions: stimulusCounts[i] - 1 - Math.floor(stimulusCounts[i] / 2),
      };
      const total_roar_mainproc_line = {
        timeline: [
          countdown_trials,
          roar_mainproc_block_half_1,
          mid_block_page_list[i],
          if_not_fullscreen,
          countdown_trials,
          roar_mainproc_block_half_2,
        ],
      };
      timeline.push(total_roar_mainproc_line);
      if (i < stimulusCounts.length - 1) {
        timeline.push(post_block_page_list[i]);
        timeline.push(if_not_fullscreen)
      }
    }
  }
  pushTrialsTotimeline(config.stimulusCountList);
  timeline.push(final_page, exit_fullscreen);

  return { jsPsych, timeline }
}


