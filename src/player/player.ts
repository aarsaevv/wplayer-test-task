export default class VideoPlayer {
    protected videoEl: HTMLVideoElement;

    constructor(videoEl: HTMLVideoElement) {
        this.videoEl = videoEl;
    }

    load(url: string) {
        // TODO: Проверка урла и возможности проиграть поток
        // В зависимости от типа видео, использовать тот или иной инстанс: dash | hls | mp4

        switch (true) {
            case url.includes('mp4'):
                console.warn('native');
                this.videoEl.src = url;
                this.videoEl.play();
                return;
            case url.includes('mpd'):
                console.warn('dash');
                return;
            case url.includes('m3u8'):
                console.warn('hls');
                return;
        }
    }
}
