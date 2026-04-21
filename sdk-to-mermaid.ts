import pkg from '@serverlessworkflow/sdk';
const { convertToMermaidCode } = pkg;
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'yaml';

// Read YAML file
const yamlContent = readFileSync('workflow.yaml', 'utf8');

// Parse YAML to plain object
const workflow = parse(yamlContent);

// Convert to Mermaid
const mermaidCode = convertToMermaidCode(workflow);

console.log('Generated Mermaid Diagram:');
console.log(mermaidCode);

