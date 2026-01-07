import { PlaybackState } from '../../../api/playback-state';
import type { DashErrorMetadata } from '../../../api/error-metadata';
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
    ERROR = 'error',
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
    ON_ERROR = 'onError',
}

type DashEventHandlers = Pick<VideoPlayerEventHandlers, DashInstanceHandler>;

export class DashVideoPlayerInstance extends VideoPlayerInstance {
    declare protected eventHandlers: DashEventHandlers | null;

    private tech: typeof window.dashjs.MediaPlayerClass;

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
                this.emit('playbackState', { state: PlaybackState.LOADING });
            },
            onCanPlay: () => {
                this.emit('playbackState', { state: PlaybackState.READY });
            },
            onPlaybackPlaying: () => {
                this.emit('playbackState', { state: PlaybackState.PLAYING });
            },
            onPlaybackPaused: () => {
                this.emit('playbackState', { state: PlaybackState.PAUSED });
            },
            onPlaybackSeeking: () => {
                this.emit('playbackState', { state: PlaybackState.SEEKING });
            },
            onFragmentLoadingStarted: () => {
                this.emit('playbackState', { state: PlaybackState.BUFFERING });
            },
            onPlaybackEnded: () => {
                this.emit('playbackState', { state: PlaybackState.ENDED });
            },
            onPlaybackTimeUpdated: () => {
                this.emit('playbackState', { state: PlaybackState.TIMEUPDATE });
            },
            onError: (event: unknown) => {
                const errorData: DashErrorMetadata = {
                    type: event.error?.code || 'UNKNOWN_ERROR',
                    details: event.error?.message || 'An error occurred',
                    fatal: true,
                    error: event.error,
                };
                this.emit('error', errorData);
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
        this.tech.on(DashInstanceEvent.ERROR, this.eventHandlers.onError);
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
        this.tech.off(DashInstanceEvent.ERROR, this.eventHandlers.onError);

        this.eventHandlers = null;
    }
}
