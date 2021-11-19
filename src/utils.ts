export const map = (n: number, start1: number, stop1: number, start2: number, stop2: number) => {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

export const toRGB = (cols: [number, number, number]) => {
    return (cols[0] << 16) + (cols[1] << 8) + cols[2];
};
