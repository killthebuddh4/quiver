export type LeftOverlap<X, Y> = { [K in keyof X & keyof Y]: X[K] };
