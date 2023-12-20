export interface IProfile {
    /**
     * The list of profile nodes. First item is the root node.
     */
    nodes: IProfileNode[];

    /**
     * Profiling start timestamp in microseconds.
     */
    startTime: number;

    /**
     * Profiling end timestamp in microseconds.
     */
    endTime: number;

    /**
     * Ids of samples top nodes.
     */
    samples: number[];

    /**
     * Time intervals between adjacent samples in microseconds. The first delta is relative to the profile startTime.
     */
    timeDeltas: number[];
}

export interface IProfileCallFrame {
    /**
     * JavaScript function name.
     */
    functionName: string;

    /**
     * Unique id of the script.
     */
    scriptId: number;

    /**
     * File path.
     */
    url: string;

    /**
     * JavaScript script line number (0-based).
     */
    lineNumber: number;

    /**
     * JavaScript script column number (0-based).
     */
    columnNumber: number;
}

export interface IProfileNode {
    /**
     * Unique id of the node.
     */
    id: number;

    /**
     * Function location.
     */
    callFrame: IProfileCallFrame;

    /**
     * Number of samples where this node was on top of the call stack.
     */
    hitCount: number;

    /**
     * Child node ids.
     */
    children?: number[];

    /**
     * The reason of being not optimized. The function may be deoptimized or marked as don't optimize.
     */
    deoptReason?: string;

    /**
     * An array of source position ticks.
     */
    positionTicks: IProfileTickInfo[];
}

export interface IProfileTickInfo {
    /**
     * Source line number (1-based).
     */
    line: number;

    /**
     * Number of samples attributed to the source line.
     */
    ticks: number;
}
