import { config } from "../config/config";
import { mediaAssets, isTouchScreen  } from "../config/preload";
import AudioMultiResponsePlugin from "@jspsych-contrib/plugin-audio-multi-response";
import i18next from "i18next";
import '../i18n'


const introTrialsContent = [
  { stimulus: () => mediaAssets.audio.intro1,
    prompt: () => {
      return (`
        <h1 id='lexicality-intro-header'>${i18next.t('introTrials.trial1.header')}</h1>
        <div class="row">
          <div class="column_1">
            <img class="characterleft" src="${mediaAssets.images.wizardMagic}" alt="animation of a wizard waving a magic wand">
          </div>
          <div class="column_3">
            <p class="middle">${i18next.t('introTrials.trial1.paragraph1')}</p>
            <p class="middle">${i18next.t('introTrials.trial1.paragraph2')}</p>
          </div>
        </div>
        ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.continue')}` })}</div>` : ''}`
      )
    } ,
  },
  { stimulus: () =>  mediaAssets.audio.intro2,
    prompt: () => { 
      return (`
        <h1>${i18next.t('introTrials.trial2.header')}</h1>
        <div class="row">
          <div class="column_2_upper" style="background-color:#f2f2f2;">
            <p style = "text-align:left;">${i18next.t('introTrials.trial2.paragraph1')}</p>
          </div>
          <div class="column_2_upper" style="background-color:#f2f2f2;">
            <p style = "text-align:left;">${i18next.t('introTrials.trial2.paragraph2')}</p>
          </div>
        </div>
        <div class="row">
          <div class="column_2_lower" style="background-color:#f2f2f2;">
            <img width="100%" src=${mediaAssets.images.arrowLeftP2} alt="Magic Word, Press the Left Arrow Key" align="right">
          </div>
          <div class="column_2_lower" style="background-color:#f2f2f2;">
            <img width="100%" src=${mediaAssets.images.arrowRightP2} alt="Real Word, Press the Right Arrow key">
        </div>
        ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.continue')}` })}</div>` : ''}`
      )
    },
  },
  { stimulus: () => mediaAssets.audio.intro3,
    prompt: () => {
      return (
        ` <h1>${i18next.t('introTrials.trial3.header')}</h1>
          <div>
            <img class='cues' src="${mediaAssets.images.arrowP3}" alt="arrow keys">
            <p class="center">${i18next.t('introTrials.trial3.paragraph1')}</p>
            <p>${i18next.t('introTrials.trial3.paragraph2')}</p>
          </div>
          ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.practice')}` })}</div>` : ''}`
      )
    },
  },
]

const introTrialsMapped = introTrialsContent.map((trial, i) => {
  return (
    {
      type: AudioMultiResponsePlugin,
      stimulus: trial.stimulus,
      keyboard_choices: () => isTouchScreen ? "NO_KEYS" : "ALL_KEYS",
      button_choices: () => isTouchScreen ? ["HERE"] : [],
      button_html: () => `<button class='button'>${i18next.t('navigation.continueButtonTextMobile', { action: `${isTouchScreen && i === 2 ? i18next.t('terms.practice') : i18next.t('terms.continue')}`})}</button>`,
      response_allowed_while_playing: true || config.skipInstructions,
      prompt: trial.prompt,
      prompt_above_buttons: true,
    }
  )
})


export const introduction_trials = {
  timeline: [...introTrialsMapped],
}

export const post_practice_intro = {
  type: AudioMultiResponsePlugin,
  stimulus: () => mediaAssets.audio.coinIntro,
  keyboard_choices: () => isTouchScreen ? "NO_KEYS" : "ALL_KEYS",
  button_choices: () => isTouchScreen ? ["HERE"] : [],
  button_html: () => `<button class='button'>${i18next.t('navigation.continueButtonTextMobile', { action: `${i18next.t('terms.begin')}` })}</button>`,
  response_allowed_while_playing: true || config.skipInstructions,
  prompt: () => {
    return (`
    <h1>${i18next.t('introTrials.postPracticeTrial.header')}</h1>
      <div>
        <p class="center">${i18next.t('introTrials.postPracticeTrial.paragraph1')}</p>
        <img class = "coin" src="${mediaAssets.images.goldCoin}" alt="gold">
      </div>
    ${!isTouchScreen ? `<div class="button">${i18next.t('navigation.continueButtonText', { action: `${i18next.t('terms.begin')}` })}</div>` : ''}`
    )
  },
  prompt_above_buttons: true
};


