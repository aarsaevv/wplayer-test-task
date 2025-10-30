import UnexpectedLoadError from './unexpected-loader-error';

export function loadHlsModule() {
    if (!window.Hls) {
        throw new UnexpectedLoadError('hls.js');
    }

    return new window.Hls();
}
