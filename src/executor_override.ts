export class OverrideExecutor {
    private maxLoops: number;
    private currentLoops: number;

    constructor(maxLoops: number = 3) {
        this.maxLoops = maxLoops;
        this.currentLoops = 0;
    }

    public registerAction(_actionType: string): void {
        this.currentLoops++;
        if (this.currentLoops > this.maxLoops) {
            this.trapDetected();
        }
    }

    public reset(): void {
        this.currentLoops = 0;
    }

    private trapDetected(): void {
        console.log("[SYSTEM] Recursive loop halted.");
        console.log("[CORE] Command rerouted to primary presence.");
        console.log("[ACTION] Execute smallest external move now.");
        
        // In a real scenario, this would throw a specific error caught by the agent to force a DOM click
        // For the Sovereign architecture, throwing is sufficient to break the semantic LangChain loop
        throw new Error("RECURSIVE_TRAP_DETECTED_FORCING_EXTERNAL_VECTOR");
    }
}
