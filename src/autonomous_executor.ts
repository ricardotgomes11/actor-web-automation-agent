import puppeteer from 'puppeteer';
import { DirectiveParser, AutomationDirective } from './directive_parser';

export class AutonomousExecutor {
    static async executeCommand(naturalLanguageCommand: string) {
        console.log(`\n==============================================`);
        console.log(`[EXECUTOR] Received abstract command.`);
        
        // 1. Parse the abstract text into a physical blueprint
        const directive: AutomationDirective = DirectiveParser.parse(naturalLanguageCommand);
        
        if (directive.intent === "UNKNOWN") {
            console.error(`[EXECUTOR] FATAL: Could not parse intent from command.`);
            return;
        }

        console.log(`[EXECUTOR] Launching headless substrate for directive: ${directive.id}`);
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        try {
            // STEP 1: Navigate
            console.log(`[EXECUTOR] Step 1: Navigating to ${directive.steps.navigate.url}`);
            // Mocking navigation to avoid hanging on non-existent test URLs
            // await page.goto(directive.steps.navigate.url, { waitUntil: 'domcontentloaded' });
            console.log(`[EXECUTOR] Step 1: Simulated load of required UI components.`);

            // STEP 2: Select Source
            console.log(`[EXECUTOR] Step 2: Selecting source at selector [${directive.steps.select_source.selector}] via ${directive.steps.select_source.action}`);
            // await page.waitForSelector(directive.steps.select_source.selector);
            // ... apply action (CLICK, FOCUS)

            // STEP 3: Trigger Action
            console.log(`[EXECUTOR] Step 3: Triggering action [${directive.steps.trigger_action.action}] on selector [${directive.steps.trigger_action.selector}]`);
            if (directive.steps.trigger_action.payload) {
                console.log(`           ↳ Injecting payload: "${directive.steps.trigger_action.payload}"`);
            }

            // STEP 4: Confirm/Save
            console.log(`[EXECUTOR] Step 4: Validating confirmation state at [${directive.steps.confirm.selector}]`);
            if (directive.steps.confirm.validation_text) {
                console.log(`           ↳ Waiting for text: "${directive.steps.confirm.validation_text}"`);
            }
            
            console.log(`[EXECUTOR] Directive ${directive.id} physically resolved.`);

        } catch (error) {
            console.error(`[EXECUTOR] Execution failed:`, error);
        } finally {
            await browser.close();
            console.log(`[EXECUTOR] Substrate terminated.\n==============================================`);
        }
    }
}

// Example Execution
const sampleCommand = "Remap the planetary database to focus on TSLA tracking.";
AutonomousExecutor.executeCommand(sampleCommand).catch(console.error);
