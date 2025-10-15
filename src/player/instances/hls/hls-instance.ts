import { VideoPlaybackState } from '../../../api/playback-state';
import { loadHlsModule } from '../../loaders/hls-loader';
import VideoPlayerInstance from '../instance';

export class HlsVideoPlayerInstance extends VideoPlayerInstance {
    private tech: typeof Hls;

    constructor() {
        super();
    }

    public init() {
        this.tech = loadHlsModule();
    }

    public destroy() {
        this.tech.stopLoad();
        this.tech.detachMedia();
        this.tech.destroy();

        this.unregisterListeners();
    }

    public load(url: string) {
        this.tech.loadSource(url);

        super.attachMedia(this.videoEl);
        this.tech.attachMedia(this.videoEl);

        this.registerListeners();
    }

    public play(): Promise<void> {
        if (!this.videoEl) {
            throw 'unexpected error - videoEl';
        }

        return this.videoEl.play();
    }

    public pause() {
        if (!this.videoEl) {
            throw 'unexpected error - videoEl';
        }

        return this.videoEl.pause();
    }

    public seekTo(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    protected registerListeners() {
        if (!this.videoEl) {
            throw 'unexpected error - videoEl';
        }

        const onManifestLoading = () => {
            console.warn(VideoPlaybackState.LOADING);
        };

        const onManifestParsed = () => {
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

        const onFragLoading = () => {
            console.warn(VideoPlaybackState.BUFFERING);
        };

        const onEnded = () => {
            console.warn(VideoPlaybackState.ENDED);
        };

        this.tech.on('hlsManifestLoading', onManifestLoading);
        this.tech.on('hlsManifestParsed', onManifestParsed);
        this.videoEl.addEventListener('play', onPlay);
        this.videoEl.addEventListener('pause', onPause);
        this.videoEl.addEventListener('seeking', onSeeking);
        this.tech.on('hlsFragLoading', onFragLoading);
        this.videoEl.addEventListener('ended', onEnded);
    }
    protected unregisterListeners() {
        throw new Error('Method not implemented.');
    }
}
