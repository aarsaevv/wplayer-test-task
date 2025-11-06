import VideoPlayer from './player/player';

const videoEl = document.getElementById('root-video') as HTMLVideoElement;
const selectEl = document.getElementById('select-video')!;

const player = new VideoPlayer(videoEl);

selectEl.addEventListener('change', onSourceChange);

function onSourceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const videoSrc = target.value;

    player.destroy();
    player.load(videoSrc);
}

// TODO: Выводить длительность буфферизации
// TODO: Выводить изменение состояния воспроизведения
// TODO: Нормальное логгирование ошибок в консоль
// TODO: Исправить ошибку при калькуляции buffered ranges
