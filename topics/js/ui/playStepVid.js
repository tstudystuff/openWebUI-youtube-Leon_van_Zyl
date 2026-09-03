// playStepVid.js
let playing = false;
function updatePlayButton(vid) {
    if (!vid) return;

    const stepVid = vid.closest('.step-vid');
    const playBtn = stepVid?.querySelector('.playbtn');

    if (!playBtn) return;

    if (vid.paused) {
        playBtn.textContent = '▶';
        playBtn.classList.remove('is-playing');
        playBtn.setAttribute('aria-label', 'Play video');
    } else {
        playBtn.textContent = '❚❚';
        playBtn.classList.add('is-playing');
        playBtn.setAttribute('aria-label', 'Pause video');
    }
}
export function pauseAllVideos({ allVids }) {
    if (!allVids || !allVids.forEach) return;
    allVids.forEach(vid => {
        vid.classList.remove("enlarge");
        vid.classList.remove("first-vid-enlarge");
        if (!vid.paused) {
            vid.pause();
        }
    });
}
export function videoControls({ vid, e }) {
    if (!vid) return
    let key = e.keyCode;
    if (e.type == 'keydown') {
        vidKeyCntrl({ vid, e, key })
    }
    if (e.type == 'click') {
        toggleVideoSizeClick({ vid, e })
    }
}
function vidKeyCntrl({ vid, e, key }) {
    if (!vid) return;

    const stepVid = vid.closest('.step-vid');

    switch (key) {

        case 13: // Enter
            if (stepVid?.classList.contains('enlarge')) {
                playing = true;
            } else {
                playing = false;
            }
            break;

        case 32: // Space
            e.preventDefault();

            if (vid.currentTime === vid.duration) {
                vid.currentTime = 0;
                playing = false;
            } else {
                playing = !playing;
            }
            break;

        case 37: // Left arrow
            vid.currentTime -= 0.5;
            playing = true;
            break;

        case 39: // Right arrow
            vid.currentTime += 0.5;
            playing = true;
            break;
    }

    playPauseVideo({ vid, playing });
}
export function toggleVideoSizeClick({ vid, e }) {
    if (!vid) return;

    const stepVid = vid.closest('.step-vid');
    if (!stepVid) return;

    stepVid.classList.toggle('enlarge');

    if (stepVid.classList.contains('enlarge')) {
        playing = true;
    } else {
        playing = false;
    }

    playPauseVideo({ vid, playing });
}
function playPauseVideo({ vid, playing }) {
    if (!vid) return;

    if (playing) {
        vid.play()
            .then(() => {
                updatePlayButton(vid);
            })
            .catch(() => {
                updatePlayButton(vid);
            });
    } else {
        vid.pause();
        updatePlayButton(vid);
    }
}