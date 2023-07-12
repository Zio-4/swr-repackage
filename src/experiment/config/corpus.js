/* eslint-disable no-plusplus */
import {
  config, shuffle,
} from "./config";
import Papa from 'papaparse'
import i18next from "i18next";
import '../i18n'
import { wordlist } from "../i18n";

/* csv helper function */
const readCSV = (url) =>
  new Promise((resolve) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        const csv_stimuli = results.data;
        resolve(csv_stimuli);
      },
    });
  });

const realpseudo2arrow = (realpseudo) =>
  (realpseudo === "real" ? "ArrowRight" : "ArrowLeft");

// addAsset :: (k, Promise a) -> Promise (k, a)
const addAsset = ([name, assetPromise]) =>
  assetPromise.then((asset) => [name, asset]);

// loadAll :: {k: Promise a} -> Promise {k: a}
const loadAll = (assets) =>
  Promise.all(Object.entries(assets).map(addAsset)).then(Object.fromEntries);  

const csvPromises = {
  practice: readCSV(wordlist[i18next.language].dataPracticeURL),
  validated: readCSV(wordlist[i18next.language].dataValidatedURL),
  new: readCSV(wordlist[i18next.language].dataNewURL),
};

const csvAssets = await loadAll(csvPromises);

const transformCSV = (csvInput, isPractice) => csvInput.reduce((accum, row) => {
  const newRow = {
    stimulus: row.word,
    correct_response: realpseudo2arrow(row.realpseudo),
    difficulty: isPractice ? row.difficulty : row.b,
    corpus_src: isPractice ? row.block : row.corpusId,
    realpseudo: row.realpseudo,
  };
  accum.push(newRow);
  return accum;
}, []);

const csvTransformed = {
  practice: transformCSV(csvAssets.practice, true),
  validated: transformCSV(csvAssets.validated, false),
  new: shuffle(transformCSV(csvAssets.new, false)), // csvAssets.new,
};

export const corpusAll = {
  name: "corpusAll",
  corpus_pseudo: csvTransformed.validated.filter((row) => row.realpseudo === "pseudo"),
  corpus_real: csvTransformed.validated.filter((row) => row.realpseudo === "real"),
};

export const blockPractice = ({ totalTrialsPractice }) => csvTransformed.practice.slice(0, totalTrialsPractice);

export const corpusNew = {
  name: "corpusNew",
  corpus_pseudo: csvTransformed.new.filter((row) => row.realpseudo === "pseudo"),
  corpus_real: csvTransformed.new.filter((row) => row.realpseudo === "real"),
};
