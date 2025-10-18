import { PlaybackEvent } from '../../../api/playback-event';
import { loadDashModule } from '../../loader/dash-loader';
import VideoPlayerInstance, { type VideoPlayerEventHandlers } from '../base';

export enum DashInstanceEvent {
    MANIFEST_LOADING_STARTED = 'manifestLoadingStarted',
    CAN_PLAY = 'canPlay',
    PLAYBACK_PLAYING = 'playbackPlaying',
    PLAYBACK_PAUSED = 'playbackPaused',
    PLAYBACK_SEEKING = 'playbackSeeking',
    FRAGMENT_LOADING_STARTED = 'fragmentLoadingStarted',
    PLAYBACK_ENDED = 'playbackEnded',
    PLAYBACK_TIME_UPDATED = 'playbackTimeUpdated',
}

export enum DashInstanceHandler {
    ON_MANIFEST_LOADING_STARTED = 'onManifestLoadingStarted',
    ON_CAN_PLAY = 'onCanPlay',
    ON_PLAYBACK_PLAYING = 'onPlaybackPlaying',
    ON_PLAYBACK_PAUSED = 'onPlaybackPaused',
    ON_PLAYBACK_SEEKING = 'onPlaybackSeeking',
    ON_FRAGMENT_LOADING_STARTED = 'onFragmentLoadingStarted',
    ON_PLAYBACK_ENDED = 'onPlaybackEnded',
    ON_PLAYBACK_TIME_UPDATED = 'onPlaybackTimeUpdated',
}

type DashEventHandlers = Pick<VideoPlayerEventHandlers, DashInstanceHandler>;

export class DashVideoPlayerInstance extends VideoPlayerInstance {
    declare protected eventHandlers: DashEventHandlers | null;

    private tech: typeof dashjs.MediaPlayerClass;

    public get buffer() {
        const bufferLength = this.tech.getBufferLength('video');

        return { length: bufferLength };
    }

    public init() {
        this.tech = loadDashModule();
    }

    public destroy() {
        this.unregisterListeners();

        this.tech.destroy();

        this.detachMedia();
    }

    public load(src: string) {
        this.tech.initialize(this.videoEl, src);

        this.registerListeners();
    }

    public play(): Promise<void> {
        return this.tech.play();
    }

    public pause() {
        return this.tech.pause();
    }

    public seekTo(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    protected registerListeners() {
        this.eventHandlers = {
            onManifestLoadingStarted: () => {
                this.emit(PlaybackEvent.LOADING);
            },
            onCanPlay: () => {
                this.emit(PlaybackEvent.READY);
            },
            onPlaybackPlaying: () => {
                this.emit(PlaybackEvent.PLAYING);
            },
            onPlaybackPaused: () => {
                this.emit(PlaybackEvent.PAUSED);
            },
            onPlaybackSeeking: () => {
                this.emit(PlaybackEvent.SEEKING);
            },
            onFragmentLoadingStarted: () => {
                this.emit(PlaybackEvent.BUFFERING);
            },
            onPlaybackEnded: () => {
                this.emit(PlaybackEvent.ENDED);
            },
            onPlaybackTimeUpdated: () => {
                this.emit(PlaybackEvent.TIMEUPDATE);
            },
        };

        this.tech.on(DashInstanceEvent.MANIFEST_LOADING_STARTED, this.eventHandlers.onManifestLoadingStarted);
        this.tech.on(DashInstanceEvent.CAN_PLAY, this.eventHandlers.onCanPlay);
        this.tech.on(DashInstanceEvent.PLAYBACK_PLAYING, this.eventHandlers.onPlaybackPlaying);
        this.tech.on(DashInstanceEvent.PLAYBACK_PAUSED, this.eventHandlers.onPlaybackPaused);
        this.tech.on(DashInstanceEvent.PLAYBACK_SEEKING, this.eventHandlers.onPlaybackSeeking);
        this.tech.on(DashInstanceEvent.FRAGMENT_LOADING_STARTED, this.eventHandlers.onFragmentLoadingStarted);
        this.tech.on(DashInstanceEvent.PLAYBACK_ENDED, this.eventHandlers.onPlaybackEnded);
        this.tech.on(DashInstanceEvent.PLAYBACK_TIME_UPDATED, this.eventHandlers.onPlaybackTimeUpdated);
    }

    protected unregisterListeners() {
        if (!this.eventHandlers) {
            return;
        }

        this.tech.off(DashInstanceEvent.MANIFEST_LOADING_STARTED, this.eventHandlers.onManifestLoadingStarted);
        this.tech.off(DashInstanceEvent.CAN_PLAY, this.eventHandlers.onCanPlay);
        this.tech.off(DashInstanceEvent.PLAYBACK_PLAYING, this.eventHandlers.onPlaybackPlaying);
        this.tech.off(DashInstanceEvent.PLAYBACK_PAUSED, this.eventHandlers.onPlaybackPaused);
        this.tech.off(DashInstanceEvent.PLAYBACK_SEEKING, this.eventHandlers.onPlaybackSeeking);
        this.tech.off(DashInstanceEvent.FRAGMENT_LOADING_STARTED, this.eventHandlers.onFragmentLoadingStarted);
        this.tech.off(DashInstanceEvent.PLAYBACK_ENDED, this.eventHandlers.onPlaybackEnded);
        this.tech.off(DashInstanceEvent.PLAYBACK_TIME_UPDATED, this.eventHandlers.onPlaybackTimeUpdated);

        this.eventHandlers = null;
    }
}
