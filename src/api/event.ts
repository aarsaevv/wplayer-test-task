import type { VideoPlayerPlaybackMetadata } from './playback-state';
import type { VideoPlayerErrorMetadata } from './error-metadata';

export type EmitterEvent = {
    playbackState: VideoPlayerPlaybackMetadata;
    error: VideoPlayerErrorMetadata;
};
