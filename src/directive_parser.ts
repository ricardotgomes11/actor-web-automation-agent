export interface AutomationDirective {
    id: string;
    intent: string;
    steps: {
        navigate: { url: string; required_selector: string };
        select_source: { selector: string; action: 'CLICK' | 'HOVER' | 'FOCUS' };
        trigger_action: { selector: string; action: 'CLICK' | 'TYPE'; payload?: string };
        confirm: { selector: string; validation_text?: string };
    };
}

export class DirectiveParser {
    /**
     * Ingests a natural language command and parses it into a strict 4-step execution payload.
     * In a production environment, this would route to a localized LLM or API.
     * For the Convergence Engine, we use regex mapping to lock the determinism.
     */
    static parse(naturalLanguageCommand: string): AutomationDirective {
        console.log(`[PARSER] Ingesting command: "${naturalLanguageCommand}"`);
        
        const lowerCmd = naturalLanguageCommand.toLowerCase();
        
        // Default Baseline Payload
        let directive: AutomationDirective = {
            id: `DIR_${Date.now()}`,
            intent: "UNKNOWN",
            steps: {
                navigate: { url: "about:blank", required_selector: "body" },
                select_source: { selector: "", action: "FOCUS" },
                trigger_action: { selector: "", action: "CLICK" },
                confirm: { selector: "body" }
            }
        };

        // Semantic Match: "Remap Planetary Database"
        if (lowerCmd.includes("remap") || lowerCmd.includes("planetary database") || lowerCmd.includes("mapping")) {
            console.log(`[PARSER] Semantic match found: PLANETARY_DATABASE_REMAP`);
            directive.intent = "PLANETARY_DATABASE_REMAP";
            directive.steps = {
                navigate: { 
                    url: "https://example-planetary-database.com/dashboard", 
                    required_selector: "#map-container" 
                },
                select_source: { 
                    selector: ".layer-menu [data-source='planetary-base']", 
                    action: "CLICK" 
                },
                trigger_action: { 
                    selector: "button#regenerate-map", 
                    action: "CLICK" 
                },
                confirm: { 
                    selector: ".toast-success", 
                    validation_text: "Map updated successfully" 
                }
            };
        } 
        // Semantic Match: "Extract Market Data"
        else if (lowerCmd.includes("market") || lowerCmd.includes("extract")) {
            console.log(`[PARSER] Semantic match found: MARKET_DATA_EXTRACTION`);
            directive.intent = "MARKET_DATA_EXTRACTION";
            directive.steps = {
                navigate: { url: "https://finance.yahoo.com", required_selector: "#search" },
                select_source: { selector: "#search", action: "FOCUS" },
                trigger_action: { selector: "#search", action: "TYPE", payload: "TSLA" },
                confirm: { selector: "[data-testid='qsp-price']" }
            };
        }

        console.log(`[PARSER] Output Generated:\n${JSON.stringify(directive, null, 2)}`);
        return directive;
    }
}
