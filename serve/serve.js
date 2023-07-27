import { RoarAppkit, initializeFirebaseProject } from "@bdelab/roar-firekit";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import RoarSWR from "../src/index";
import { roarConfig } from "./firebaseConfig";
import { setRandomUserMode } from "../src/experiment/config/config";

// Import necessary for async in the top level of the experiment script
import "regenerator-runtime/runtime";

const queryString = new URL(window.location).search;
const urlParams = new URLSearchParams(queryString);
const userMode = setRandomUserMode(urlParams.get("mode"));
const taskVariant = urlParams.get("variant");
const pid = urlParams.get("PROLIFIC_PID") || urlParams.get("participant");
const schoolId = urlParams.get("schoolId");
const studyId = urlParams.get("studyId");
const classId = urlParams.get("classId");
const skipInstructions = urlParams.get("skip");
const audioFeedback = urlParams.get("feedback");
const consent = urlParams.get("consent");
const numAdaptive = urlParams.get("numAdaptive");
const numNew = urlParams.get("numNew");
const numValidated = urlParams.get("numValidated");
export const labId = urlParams.get("labId");

// @ts-ignore
const appKit = await initializeFirebaseProject(
  roarConfig.firebaseConfig,
  "assessmentApp",
  "none",
);

onAuthStateChanged(appKit.auth, (user) => {
  if (user) {
    const userInfo = {
      assessmentPid: pid || "test-pid",
      assessmentUid: user.uid,
      userMetadata: {
        classId,
        schoolId,
        districtId: "",
        studyId,
      },
    };

    const userParams = {
      pid,
      studyId,
      classId,
      schoolId,
      labId,
    }

    const gameParams = {
      userMode,
      taskVariant,
      skipInstructions,
      consent,
      audioFeedback,
      numAdaptive,
      numNew,
      numValidated,
    };

    const taskInfo = {
      taskId: "swr",
      variantParams: gameParams,
    };

    const firekit = new RoarAppkit({
      firebaseProject: appKit,
      taskInfo,
      userInfo,
    });

    const roarApp = new RoarSWR(firekit, gameParams, userParams);

    roarApp.run();
  }
});

await signInAnonymously(appKit.auth);
