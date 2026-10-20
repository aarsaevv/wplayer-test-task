import VideoPlayer from './player/player';

const videoEl = document.getElementById('root-video') as HTMLVideoElement;
const selectEl = document.getElementById('select-video')!;
const stateEl = document.getElementById('playback-state')!;
const bufferEl = document.getElementById('buffer-duration')!;

const player = new VideoPlayer(videoEl);

player.emitter.on('playbackState', ({ state }) => {
    stateEl.textContent = state;
});

player.emitter.on('bufferInfo', ({ length }) => {
    bufferEl.textContent = length.toFixed(2);
});

selectEl.addEventListener('change', onSourceChange);

function onSourceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const videoSrc = target.value;

    player.load(videoSrc);
}
