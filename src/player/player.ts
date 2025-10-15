import { DashVideoPlayerInstance } from './instances/dash/dash-instance';
import { HlsVideoPlayerInstance } from './instances/hls/hls-instance';
import { NativeVideoPlayerInstance } from './instances/native/native-instance';
import type VideoPlayerInstance from './instances/instance';

export default class VideoPlayer {
    protected videoEl: HTMLVideoElement;

    public currentInstance: VideoPlayerInstance;

    constructor(videoEl: HTMLVideoElement) {
        this.videoEl = videoEl;
    }

    load(url: string) {
        switch (true) {
            case url.includes('mp4'):
                this.currentInstance = new NativeVideoPlayerInstance();
                break;
            case url.includes('mpd'):
                this.currentInstance = new DashVideoPlayerInstance();
                break;
            case url.includes('m3u8'):
                this.currentInstance = new HlsVideoPlayerInstance();
                break;
        }

        this.currentInstance.init();
        this.currentInstance.attachMedia(this.videoEl);
        this.currentInstance.load(url);
        this.currentInstance.play();
    }
}
