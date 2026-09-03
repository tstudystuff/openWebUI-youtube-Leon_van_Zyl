// js/nav/m-key-handler.js

import {
    lastStep,
    lastFocusedMainEl
} from "./step-nav.js";

import {
    mainTargetDiv
} from "./main-content-nav.js";


export function handleMKey({ e, focusZone }) {
    if (!e) return;

    e.preventDefault();
    e.stopPropagation();


    /* =========================================================
       1. ANYTHING INSIDE A STEP-FLOAT
       M always returns focus to that step
       ========================================================= */

    const currentStep = e.target.closest?.(".step-float");

    if (
        currentStep &&
        e.target !== currentStep
    ) {
        currentStep.focus();
        return;
    }


    /* =========================================================
       2. CURRENTLY ON STEP-FLOAT
       M moves back to mainTargetDiv
       ========================================================= */

    if (
        currentStep &&
        e.target === currentStep
    ) {

        if (mainTargetDiv) {
            mainTargetDiv.focus();

            mainTargetDiv.scrollIntoView({
                behavior: "instant",
                block: "start"
            });
        }

        return;
    }


    /* =========================================================
       3. CURRENTLY ON MAIN TARGET
       M returns to last step
       ========================================================= */

    if (e.target === mainTargetDiv) {

        if (lastStep) {
            lastStep.focus();
        }

        return;
    }


    /* =========================================================
       4. OUTSIDE MAIN TARGET
       Return to last step if one exists
       ========================================================= */

    if (focusZone !== "mainTargetDiv") {

        if (lastStep) {
            lastStep.focus();
            return;
        }

        if (
            mainTargetDiv &&
            document.contains(mainTargetDiv)
        ) {
            mainTargetDiv.focus();
        }
    }
}