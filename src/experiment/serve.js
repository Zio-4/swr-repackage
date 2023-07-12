import { RoarSWR } from "./index";
import { RoarAppkit, initializeFirebaseProject } from '@bdelab/roar-firekit';
import { roarConfig } from "./firebaseConfig";
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'

//@ts-ignore
const queryString = new URL(window.location).search;
const urlParams = new URLSearchParams(queryString);
const userMode = randomAssignment(urlParams.get("mode"));
const taskVariant = urlParams.get("variant");
const pid = urlParams.get("PROLIFIC_PID") || urlParams.get("participant");
const schoolId = urlParams.get("schoolId");
const studyId = urlParams.get('studyId');
const classId = urlParams.get('classId');
const skipInstructions = urlParams.get("skip");
const audioFeedback = urlParams.get("feedback");
const consent = urlParams.get("consent");
const numAdaptive = urlParams.get("numAdaptive");
const numNew = urlParams.get("numNew");
const numValidated = urlParams.get("numValidated");
export const labId = urlParams.get('labId');
const gameId = urlParams.get('gameId');

// @ts-ignore
const appKit = await initializeFirebaseProject(roarConfig.firebaseConfig, 'assessmentApp', 'none');

onAuthStateChanged(appKit.auth, (user) => {
    if (user) {
        const userInfo = {
            assessmentPid: pid || "test-pid",
            assessmentUid: user.uid,
            userMetadata: {
                classId,
                schoolId,
                districtId: '',
                studyId
            },
        };

        const params = { userMode, 
                         pid, 
                         studyId, 
                         classId, 
                         schoolId, 
                         taskVariant,
                         skipInstructions,
                         audioFeedback,
                         consent,
                         numAdaptive,
                         numNew,
                         numValidated,
                         labId,
                         gameId,
                         randomField: 42 
                       };
        const taskInfo = {
            taskId: 'roar-repackage',
            variantParams: params,
        }

        const firekit = new RoarAppkit({
            firebaseProject: appKit,
            taskInfo,
            userInfo,
        })

        const roarApp = new RoarSWR(firekit, params);

        roarApp.run();
    }
});

await signInAnonymously(appKit.auth);