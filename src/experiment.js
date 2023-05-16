/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
import store from "store2";

// Import necessary for async in the top level of the experiment script
import "regenerator-runtime/runtime";

// Local modules
import {
  jsPsych,
  config,
} from "./config";
import { audio_response } from "./trials/audioFeedback";
import { preload_trials } from "./preload";
import {
  introduction_trials,
  post_practice_intro,
  countdown_trials,
  if_coin_tracking,
} from "./introduction";
import { practice_feedback } from "./practice";
import {
  mid_block_page_list,
  post_block_page_list,
  final_page,
} from "./gameBreak";
import { blockPractice } from "./corpus";
import { if_consent_form, if_get_survey, if_get_pid } from './experimentSetup';
import { if_not_fullscreen, enter_fullscreen, exit_fullscreen } from './trials/fullScreen';
import { setup_fixation } from './trials/setupFixation';
import { lexicality, leixcalityPractice } from './trials/lexicality'

// CSS imports
import "./css/game.css";


const timeline = [
  ...preload_trials,
  if_get_pid, 
  if_consent_form, 
  if_get_survey, 
  enter_fullscreen, 
  introduction_trials,
  if_not_fullscreen, 
  countdown_trials
];


async function roarBlocks() {
  // the core procedure
  const pushPracticeTotimeline = (array) => {
    array.forEach((element) => {
      const block = {
        timeline: [
          setup_fixation,
          leixcalityPractice,
          audio_response,
          practice_feedback,
        ],
        timeline_variables: [element],
      };
      timeline.push(block);
    });
  }

  pushPracticeTotimeline(blockPractice);
  timeline.push(post_practice_intro);
  timeline.push(if_not_fullscreen)

  const core_procedure = {
    timeline: [
      setup_fixation,
      lexicality,
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
  jsPsych.run(timeline);
}

roarBlocks();
