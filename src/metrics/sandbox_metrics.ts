import fs from 'fs';

export interface SandboxMetricsOptions {
    /**
     * Path to the metrics output file. Set to "stdout" to write to STDOUT.
     * If undefined, metrics collection is disabled.
     */
    outputPath?: string;
}

/**
 * Lightweight metrics helper that containers can use to collect
 * key-value metrics and write them either to a JSON file or stdout.
 *
 * Metrics collection can be enabled by providing an output path.
 * Set `SANDBOX_METRICS_PATH` environment variable to either a file
 * path or the string "stdout" to enable collection. If the variable
 * is not set, metrics recording is disabled.
 */
export class SandboxMetrics {
    private metrics: Record<string, unknown> = {};

    constructor(private readonly options: SandboxMetricsOptions = {}) {}

    /**
     * Create a metrics instance using environment variables.
     *
     * If `SANDBOX_METRICS_PATH` is not defined the instance will be
     * disabled and calls to {@link record} and {@link flush} will be no-ops.
     */
    static fromEnv(): SandboxMetrics {
        const outputPath = process.env.SANDBOX_METRICS_PATH;
        return new SandboxMetrics({ outputPath });
    }

    /**
     * Whether metrics collection is enabled.
     */
    get enabled(): boolean {
        return !!this.options.outputPath;
    }

    /**
     * Record a metric value under the provided key. When metrics
     * collection is disabled this method is a no-op.
     */
    record(key: string, value: unknown): void {
        if (!this.enabled) return;
        this.metrics[key] = value;
    }

    /**
     * Flush collected metrics to the configured destination. When
     * metrics collection is disabled this method is a no-op.
     */
    flush(): void {
        if (!this.enabled) return;
        const json = JSON.stringify(this.metrics, null, 2);
        if (this.options.outputPath === 'stdout') {
            process.stdout.write(`${json}\n`);
        } else if (this.options.outputPath) {
            fs.writeFileSync(this.options.outputPath, json, { encoding: 'utf-8' });
        }
    }
}

export default SandboxMetrics;
