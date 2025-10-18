import type VideoPlayerInstance from './base';
import { DashVideoPlayerInstance } from './dash/dash-instance';
import { HlsVideoPlayerInstance } from './hls/hls-instance';
import { NativeVideoPlayerInstance } from './native/native-instance';

type SourceType = 'native' | 'dash' | 'hls' | 'unknown';

export default function createVideoPlayerInstance(type: SourceType): VideoPlayerInstance {
    switch (type) {
        case 'native':
            return new NativeVideoPlayerInstance();
        case 'dash':
            return new DashVideoPlayerInstance();
        case 'hls':
            return new HlsVideoPlayerInstance();
        case 'unknown':
            throw new Error('Unsupported player type');
    }
}
