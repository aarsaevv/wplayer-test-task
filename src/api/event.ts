import type { PlaybackState } from './playback-state';

export type EmitterEvent = {
    playbackState: PlaybackState;
    error: Error;
};