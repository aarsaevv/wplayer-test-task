type ThrottledFunction<T extends (...args: any) => any> = (...args: Parameters<T>) => ReturnType<T>;
export function throttle<T extends (...args: any) => any>(func: T, limit: number): ThrottledFunction<T> {
    let inThrottle: boolean;
    let lastResult: ReturnType<T>;

    return function (this: any): ReturnType<T> {
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        const context = this;

        if (!inThrottle) {
            inThrottle = true;

            window.setTimeout(() => (inThrottle = false), limit);

            // @ts-ignore
            lastResult = func.apply(context, args);
        }

        return lastResult;
    };
}

export const debounce = <F extends (...args: any[]) => any>(
    func: F,
    waitFor: number
): ((...args: Parameters<F>) => ReturnType<F>) => {
    let timeout = 0;

    const debounced = (...args: any[]): void => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), waitFor);
    };

    return debounced as unknown as (...args: Parameters<F>) => ReturnType<F>;
};

export function timeout(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
