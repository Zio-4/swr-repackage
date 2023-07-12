import { config } from "../config/config";
import { isTouchScreen, mediaAssets } from "../config/preload";
import AudioMultiResponsePlugin from "@jspsych-contrib/plugin-audio-multi-response";
import i18next from "i18next";
import '../i18n'


const midBlockTrialsContent = [
  {
    stimulus: () => mediaAssets.audio.midBlock1,
    prompt: () => {
      return (
        `<div>
            <h1>${i18next.t('gameBreakTrials.midBlockTrials.trial1.header')}</h1>
            <div>
              <p class="center" style="position: relative; top: 50%; margin-bottom: 1.5rem;">${i18next.t('gameBreakTrials.midBlockTrials.trial1.paragraph1')}</p>
              <p class="center" style="position: relative; top: 50%;">${i18next.t('gameBreakTrials.midBlockTrials.trial1.paragraph2')}</p>  
            </div>
            <div class = "story-scene">
              <img class="scene" src="${mediaAssets.images.halfValley}" alt="background image with hills and trees">
              <img class = 'adventure_mid_break' src="${mediaAssets.images.adventurer1}" alt="adventurer with harp">
            </div>
          </div>
    ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.continue')}` })}</div>` : ''}`
      )
    }
  },
  {
    stimulus: () => mediaAssets.audio.midBlock2,
    prompt: () => {
      return (`
        <div>
          <h1>${i18next.t('gameBreakTrials.midBlockTrials.trial2.header')}</h1>
          <div>
            <p class="center" style="position: relative; top: 50%; margin-bottom: 1.5rem;">${i18next.t('gameBreakTrials.midBlockTrials.trial2.paragraph1')}</p>
            <p class="center" style="position: relative; top: 50%;">${i18next.t('gameBreakTrials.midBlockTrials.trial2.paragraph2')}</p>
          </div>
          <div class="story-scene">
            <img class="scene" src="${mediaAssets.images.valley4}" alt="background with hills and trees">
            <img class = 'adventure_mid_break' src="${mediaAssets.images.adventurer1}" alt="adventurer with harp">
            <img class = 'adventure_mid_break' src="${mediaAssets.images.adventurer3}" alt="adventurer with making heart shapes">
          </div>
        </div>
        ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.continue')}` })}</div>` : ''}`
      )
    }
  },
  {
    stimulus: () => mediaAssets.audio.midBlock3,
    prompt: () => {
      return (`
        <div>
          <h1>${i18next.t('gameBreakTrials.midBlockTrials.trial3.header')}</h1>
          <div>
              <p class="center" style="position: relative; top: 50%; margin-bottom: 1.5rem;">${i18next.t('gameBreakTrials.midBlockTrials.trial3.paragraph1')}</p>
              <p class="center" style="position: relative; top: 50%;">${i18next.t('gameBreakTrials.midBlockTrials.trial3.paragraph2')}</p>
          </div>
          <div class="story-scene">
            <img class="scene" src="${mediaAssets.images.valley3}" alt="backgroun image with hills and trees">
            <img class = 'adventure_mid_break'  src="${mediaAssets.images.adventurer1}" alt="adventurer with harp">
            <img class = 'adventure_mid_break'  src="${mediaAssets.images.adventurer3}" alt="adventurer playing rainbow">
            <img class = 'adventure_mid_break'  src="${mediaAssets.images.adventurer2}" alt="adventurer making heart shapes">
          </div>
        </div>
        ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.continue')}` })}</div>` : ''}
      `
      )
    }
  }
]

const midBlockTrialsMapped = midBlockTrialsContent.map((trial, i) => {
  return (
    {
      type: AudioMultiResponsePlugin,
      stimulus: trial.stimulus,
      keyboard_choices: () => isTouchScreen ? "NO_KEYS" : "ALL_KEYS",
      button_choices: () => isTouchScreen ? ["HERE"] : [],
      button_html: () => `<button class='button'>${i18next.t('navigation.continueButtonTextMobile', { action: `${i18next.t('terms.continue')}` })}</button>`,
      response_allowed_while_playing: true || config.skipInstructions,
      prompt: trial.prompt,
      prompt_above_buttons: true,
    }
  )
})

const mid_block_page_list = [...midBlockTrialsMapped];

// post block page

const postBlockTrialsContent = [
  {
    stimulus: () => mediaAssets.audio.endBlock1,
    prompt: () => {
      return (
        `
        <div>
          <h1>${i18next.t('gameBreakTrials.postBlockTrials.trial1.header')}</h1>
          <div>
            <p class="center" style="margin-bottom: 1.5rem;">${i18next.t('gameBreakTrials.postBlockTrials.trial1.paragraph1')}</p> 
            <p class="center">${i18next.t('gameBreakTrials.postBlockTrials.trial1.paragraph2')}</p>
          </div>
          <div class = "story-scene">
            <img class="scene" src="${mediaAssets.images.valley}" alt="background image of hills and trees">
            <img class='wizard' src="${mediaAssets.images.wizardCoin}" alt="adventure playing rainbow">
            <img class="guardian" src="${mediaAssets.images.guardian1}" alt="adventure making heart shapes">
          </div>
        </div>
        ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.continue')}` })}</div>` : ''}
        `
      )
    }
  },
  {
    stimulus: () => mediaAssets.audio.endBlock2,
    prompt: () => {
      return (
        `
        <div>
          <h1>${i18next.t('gameBreakTrials.postBlockTrials.trial2.header')}</h1>
          <div>
            <p class="center" style="margin-bottom: 1.5rem;">${i18next.t('gameBreakTrials.postBlockTrials.trial2.paragraph1')}</p>

            <p class="center">${i18next.t('gameBreakTrials.postBlockTrials.trial2.paragraph2')}</p>
          </div>
          <div class="story-scene">
            <img class="scene" src="${mediaAssets.images.valley5}" alt="background image of hills and trees">
            <img class='wizard' src="${mediaAssets.images.wizardCoin}" alt="adventure playing rainbow">
            <img class='guardian' src="${mediaAssets.images.guardian2}" alt="adventure making heart shapes">
          </div>
        </div>
        ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.continue')}` })}</div>` : ''}`
      )
    }
  },
]

const postBlockTrialsMapped = postBlockTrialsContent.map(trial => {
  return (
    {
      type: AudioMultiResponsePlugin,
      stimulus: trial.stimulus,
      keyboard_choices: () => isTouchScreen ? "NO_KEYS" : "ALL_KEYS",
      button_choices: () => isTouchScreen ? ["HERE"] : [],
      button_html: () => `<button class='button'>${i18next.t('navigation.continueButtonTextMobile', {  action: `${i18next.t('terms.continue')}` })}</button>`,
      response_allowed_while_playing: true || config.skipInstructions,
      prompt: trial.prompt,
      prompt_above_buttons: true,
    }
  )
})

const post_block_page_list = [...postBlockTrialsMapped];

const final_page = {
  type: AudioMultiResponsePlugin,
  stimulus: () => mediaAssets.audio.endGame,
  keyboard_choices: () => isTouchScreen ? "NO_KEYS" : "ALL_KEYS",
  button_choices: () => isTouchScreen ? ["HERE"] : [],
  button_html: () => `<button class='button'>${i18next.t('navigation.continueButtonTextMobile', {  action: `${i18next.t('terms.save')}` })}</button>`,
  response_allowed_while_playing: true || config.skipInstructions,
  prompt_above_buttons: true,
  prompt: () => {
    return (`
      <div>
        <h1>${i18next.t('gameBreakTrials.finalTrial.header')}</h1>
        <div>
          <p class="center" style="margin-bottom: 1.5rem;">${i18next.t('gameBreakTrials.finalTrial.paragraph1')}</p>
          <p class="center">${i18next.t('gameBreakTrials.finalTrial.paragraph2')}</p>
        </div>
        <div class="story-scene">
          <img class="scene" src="${mediaAssets.images.endingBackground}" alt="background image of gate">
          <img class='guardian' src="${mediaAssets.images.guardian3}" alt="image of a unicorn winking">
          <img class='guardian' id = "gate" src="${mediaAssets.images.endingGateCoinbag}" alt="gate">
        </div>
      </div>
      ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.save')}` })}</div>` : ''}
      `
    )
  },

  on_finish: function () {
    document.body.style.cursor = "auto";
  },
};

export { mid_block_page_list, post_block_page_list, final_page };
