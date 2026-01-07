export enum PlaybackState {
    // контента нет, видеотэг пуст
    IDLE = 'IDLE',
    // контент загружается, воспроизведение не начали
    LOADING = 'LOADING',
    // контент загрузился, готовы к воспроизведению
    READY = 'READY',
    // воспроизводим
    PLAYING = 'PLAYING',
    // пауза
    PAUSED = 'PAUSED',
    // перемотка
    SEEKING = 'SEEKING',
    // буфферизация
    BUFFERING = 'BUFFERING',
    // воспроизведение окончено
    ENDED = 'ENDED',
    // время воспроизведения изменилось
    TIMEUPDATE = 'TIMEUPDATE',
}

export type VideoPlayerPlaybackMetadata = {
    state: PlaybackState;
};
