/**
 * Responsive grid break points.
 */
export interface Breakpoints<T = any> {
    /**
     * Extra small.
     */
    xs?: T;

    /**
     * Small.
     */
    sm?: T;

    /**
     * Medium.
     */
    md?: T;

    /**
     * Large.
     */
    lg?: T;

    /**
     * Extra large.
     */
    xl?: T;
}

export enum BreakpointValues {
    xs = 0,
    sm = 576,
    md = 768,
    lg = 992,
    xl = 1200
}