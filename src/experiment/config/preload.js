// import jsPsychPreload from "@jspsych/plugin-preload";
// import { deviceType, primaryInput } from 'detect-it';
// import { keyboardPaths, sharedPaths, tabletPaths } from "./audioFileList.js";
// import assets from '../assetPaths.json'
import { generateAssetObject, createPreloadTrials, getDevice } from "@bdelab/roar-utils";
import assets from '../../../assets.json'


const bucketURI = 'https://storage.googleapis.com/storage/v1/b/roar-swr/o'; 
// https://storage.googleapis.com/storage/v1/b/roar-test-bucket/o || https://roar-test-bucket.s3.amazonaws.com

export const isTouchScreen = getDevice() === 'mobile'
export const mediaAssets = generateAssetObject(assets, bucketURI)
export const preloadTrials = createPreloadTrials(assets, bucketURI).default


// console.log('asset obj: ', mediaAssets)
// console.log('preload trials: ', preloadTrials)
