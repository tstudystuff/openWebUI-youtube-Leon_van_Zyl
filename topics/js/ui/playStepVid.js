// js/ui/playStepVid.js

let playing = false;

const ACTIVE_CLASS = "control-active";
const CONTROL_FLASH_TIME = 180;


/* =========================================================
   CONTROL BUTTON HELPERS
   ========================================================= */

function getStepVid(vid) {
    return vid?.closest(".step-vid");
}

function getControls(vid) {
    const stepVid = getStepVid(vid);

    if (!stepVid) {
        return {
            rewindBtn: null,
            playBtn: null,
            forwardBtn: null
        };
    }

    return {
        rewindBtn: stepVid.querySelector(".fwdBtn"),
        playBtn: stepVid.querySelector(".playbtn"),
        forwardBtn: stepVid.querySelector(".rwdBtn")
    };
}


/* =========================================================
   BUTTON FEEDBACK
   ========================================================= */

function flashButton(button) {
    if (!button) return;

    button.classList.add(ACTIVE_CLASS);

    window.setTimeout(() => {
        button.classList.remove(ACTIVE_CLASS);
    }, CONTROL_FLASH_TIME);
}


/* =========================================================
   PLAY BUTTON STATE
   ========================================================= */

export function updatePlayButton(vid) {
    if (!vid) return;

    const { playBtn } = getControls(vid);

    if (!playBtn) return;

    if (vid.paused) {
        playBtn.textContent = "▶";
        playBtn.classList.remove("is-playing");
        playBtn.setAttribute("aria-label", "Play video");
    } else {
        playBtn.textContent = "❚❚";
        playBtn.classList.add("is-playing");
        playBtn.setAttribute("aria-label", "Pause video");
    }
}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

function playVideo(vid) {
    if (!vid) return;

    playing = true;

    vid.play()
        .then(() => {
            updatePlayButton(vid);
        })
        .catch(() => {
            playing = false;
            updatePlayButton(vid);
        });
}

function pauseVideo(vid) {
    if (!vid) return;

    playing = false;

    vid.pause();

    updatePlayButton(vid);
}

function togglePlayPause(vid) {
    if (!vid) return;

    const { playBtn } = getControls(vid);

    flashButton(playBtn);

    if (vid.paused) {
        playVideo(vid);
    } else {
        pauseVideo(vid);
    }
}


/* =========================================================
   REWIND / FORWARD
   ========================================================= */

function rewindVideo(vid) {
    if (!vid) return;

    const { rewindBtn } = getControls(vid);

    flashButton(rewindBtn);

    vid.currentTime = Math.max(
        0,
        vid.currentTime - 0.5
    );
}

function forwardVideo(vid) {
    if (!vid) return;

    const { forwardBtn } = getControls(vid);

    flashButton(forwardBtn);

    const nextTime = vid.currentTime + 0.5;

    if (Number.isFinite(vid.duration)) {
        vid.currentTime = Math.min(
            vid.duration,
            nextTime
        );
    } else {
        vid.currentTime = nextTime;
    }
}


/* =========================================================
   PAUSE ALL VIDEOS
   ========================================================= */

export function pauseAllVideos({ allVids }) {
    if (!allVids?.forEach) return;

    allVids.forEach(vid => {

        const stepVid = getStepVid(vid);

        stepVid?.classList.remove("enlarge");
        stepVid?.classList.remove("first-vid-enlarge");

        if (!vid.paused) {
            vid.pause();
        }

        updatePlayButton(vid);
    });

    playing = false;
}


/* =========================================================
   VIDEO CLICK
   Clicking the VIDEO itself toggles enlarge.
   Control buttons do NOT come through here.
   ========================================================= */

export function toggleVideoSizeClick({ vid }) {
    if (!vid) return;

    const stepVid = getStepVid(vid);

    if (!stepVid) return;

    stepVid.classList.toggle("enlarge");

    if (stepVid.classList.contains("enlarge")) {
        playVideo(vid);
    } else {
        pauseVideo(vid);
    }
}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

function videoKeyControl({ vid, e }) {
    if (!vid || !e) return;

    switch (e.key) {

        case "Enter": {
            const stepVid = getStepVid(vid);

            if (stepVid?.classList.contains("enlarge")) {
                playVideo(vid);
            } else {
                pauseVideo(vid);
            }

            break;
        }


        case " ":
            e.preventDefault();

            if (
                Number.isFinite(vid.duration) &&
                vid.currentTime >= vid.duration
            ) {
                vid.currentTime = 0;
            }

            togglePlayPause(vid);

            break;


        case "ArrowLeft":
            e.preventDefault();

            rewindVideo(vid);

            break;


        case "ArrowRight":
            e.preventDefault();

            forwardVideo(vid);

            break;
    }
}


/* =========================================================
   CUSTOM CONTROL BUTTON CLICKS
   ========================================================= */

function controlButtonClick({ vid, e }) {
    const button = e.target.closest(
        ".vid-cntrl-btns button"
    );

    if (!button) return false;

    e.preventDefault();
    e.stopPropagation();

    if (button.classList.contains("playbtn")) {
        togglePlayPause(vid);
        return true;
    }

    if (button.classList.contains("fwdBtn")) {
        rewindVideo(vid);
        return true;
    }

    if (button.classList.contains("rwdBtn")) {
        forwardVideo(vid);
        return true;
    }

    return false;
}


/* =========================================================
   MAIN ENTRY
   ========================================================= */

export function videoControls({ vid, e }) {
    if (!vid || !e) return;

    if (e.type === "keydown") {
        videoKeyControl({
            vid,
            e
        });

        return;
    }

    if (e.type === "click") {

        // Custom control button click
        if (
            controlButtonClick({
                vid,
                e
            })
        ) {
            return;
        }

        // Only clicking the VIDEO itself should enlarge
        if (e.target === vid) {
            toggleVideoSizeClick({
                vid,
                e
            });
        }
    }
}