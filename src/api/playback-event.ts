export enum PlaybackEvent {
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
    //
    TIMEUPDATE = 'TIMEUPDATE',
}

export type PlaybackEvents = {
    playbackEvent: PlaybackEvent;
};
