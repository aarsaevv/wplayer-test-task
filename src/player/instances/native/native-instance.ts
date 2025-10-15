import { VideoPlaybackState } from '../../../api/playback-state';
import VideoPlayerInstance from '../instance';

export class NativeVideoPlayerInstance extends VideoPlayerInstance {
    constructor() {
        super();
    }

    public init() {
        return Promise.resolve(undefined);
    }

    public attachMedia(element: HTMLVideoElement): void {
        super.attachMedia(element);

        this.registerListeners();
    }

    public destroy(): Promise<void> {
        this.detachMedia();
        this.unregisterListeners();

        return Promise.resolve(undefined);
    }

    public load(url: string) {
        this.videoEl.src = url;
    }

    public play(): Promise<void> {
        return this.videoEl.play();
    }

    public pause() {
        return this.videoEl.pause();
    }

    public seekTo(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    protected registerListeners() {
        const onLoadstart = () => {
            console.warn(VideoPlaybackState.LOADING);
        };

        const onCanplay = () => {
            console.warn(VideoPlaybackState.READY);
        };

        const onPlay = () => {
            console.warn(VideoPlaybackState.PLAYING);
        };

        const onPause = () => {
            console.warn(VideoPlaybackState.PAUSED);
        };

        const onSeeking = () => {
            console.warn(VideoPlaybackState.SEEKING);
        };

        const onWaiting = () => {
            console.warn(VideoPlaybackState.BUFFERING);
        };

        const onEnded = () => {
            console.warn(VideoPlaybackState.ENDED);
        };

        this.videoEl.addEventListener('loadstart', onLoadstart);
        this.videoEl.addEventListener('canplay', onCanplay);
        this.videoEl.addEventListener('play', onPlay);
        this.videoEl.addEventListener('pause', onPause);
        this.videoEl.addEventListener('seeking', onSeeking);
        this.videoEl.addEventListener('waiting', onWaiting);
        this.videoEl.addEventListener('ended', onEnded);
    }

    protected unregisterListeners() {
        throw new Error('Method not implemented.');
    }
}
