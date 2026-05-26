const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'artifacts/chargeback-pilot/src/pages/Wizard.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Define exactly what to add
const newImports = `
import { 
  PAYMENT_METHODS, 
  PROBLEM_TYPES, 
  MERCHANT_RESPONSE_OPTIONS, 
  EVIDENCE_GROUPS, 
  STEP_TITLES, 
  STRUCTURED_QUESTIONS 
} from "@/components/wizard/wizard-constants";
import { 
  buildDescription, 
  buildMerchantResponse, 
  getDisputedPercent, 
  extractSubject, 
  extractBody 
} from "@/components/wizard/wizard-helpers";
import { 
  GeneratorLoader, 
  StrategyIndicator, 
  LockedTeaser, 
  CopyableTemplate, 
  MerchantQuickSelect, 
  ContentLocker, 
  QuestionField 
} from "@/components/wizard/WizardComponents";
`;

// Find where constants start
const constStart = content.indexOf('// ---------------------------------------------------------------------------');
// Find where the main component starts
const mainStart = content.indexOf('interface FormData {');

if (constStart === -1 || mainStart === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

// We need to keep the imports that were mixed in at line 841
const mixedImportsMatch = content.match(/import \{ ErrorBoundary \}[\s\S]*?import \{ Lock as LockIcon \} from "lucide-react";/);
const mixedImports = mixedImportsMatch ? mixedImportsMatch[0] : '';

// The new content will be:
// 1. Original top imports
// 2. newImports
// 3. mixedImports
// 4. Everything from 'interface FormData {' to the end

const topImports = content.substring(0, constStart);
const mainComponent = content.substring(mainStart);

const finalContent = topImports + newImports + mixedImports + '\n\n' + mainComponent;

fs.writeFileSync(filePath, finalContent);
console.log("Rewrite successful");
