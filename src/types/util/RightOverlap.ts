export type RightOverlap<X, Y> = { [K in keyof X & keyof Y]: Y[K] };
