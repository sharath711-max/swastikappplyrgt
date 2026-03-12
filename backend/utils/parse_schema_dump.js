const fs = require('fs');
const path = require('path');

// Helper to split column definitions by commas, respecting parentheses
function splitByCommasOutsideParentheses(s) {
    const parts = [];
    let currentPart = [];
    let parenCount = 0;

    for (const char of s) {
        if (char === '(') {
            parenCount++;
            currentPart.push(char);
        } else if (char === ')') {
            parenCount--;
            currentPart.push(char);
        } else if (char === ',' && parenCount === 0) {
            parts.push(currentPart.join('').trim());
            currentPart = [];
        } else {
            currentPart.push(char);
        }
    }

    if (currentPart.length > 0) {
        parts.push(currentPart.join('').trim());
    }

    return parts;
}

function parseSchemaContent(content) {
    // 1. naive split by <table> tags if strictly present, 
    // but the prompt implies we might just have the raw CREATE TABLE text sometimes.
    // The robust way described is finding CREATE TABLE patterns.

    // We will scan for "CREATE TABLE"
    const tables = [];
    const regex = /CREATE TABLE\s+(\w+)\s*\(/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const tableName = match[1];
        const startIndex = match.index;

        // Find opening parenthesis
        const openParenIndex = content.indexOf('(', startIndex);
        if (openParenIndex === -1) continue;

        // Find matching closing parenthesis
        let stack = 0;
        let closeParenIndex = -1;

        for (let i = openParenIndex; i < content.length; i++) {
            if (content[i] === '(') stack++;
            else if (content[i] === ')') {
                stack--;
                if (stack === 0) {
                    closeParenIndex = i;
                    break;
                }
            }
        }

        if (closeParenIndex === -1) continue;

        // Extract the definition body
        let defBody = content.substring(openParenIndex + 1, closeParenIndex);

        // Clean comments (--)
        // We'll replace -- ... with empty string, but be careful of newlines
        defBody = defBody.replace(/--.*/g, '');
        // Remove newlines and extra spaces
        defBody = defBody.replace(/\s+/g, ' ').trim();

        // Split columns
        const columnDefs = splitByCommasOutsideParentheses(defBody);

        const columns = columnDefs.map(def => {
            const tokens = def.trim().split(/\s+/);
            if (tokens.length < 2) return null;

            const columnName = tokens[0].replace(/"/g, ''); // strip quotes
            const columnType = tokens[1];
            const constraints = tokens.slice(2).join(' ');

            return {
                column_name: columnName,
                column_type: columnType,
                constraints: constraints
            };
        }).filter(c => c !== null);

        tables.push({
            table_name: tableName,
            columns: columns
        });
    }

    return tables;
}

// Main execution if run directly
if (require.main === module) {
    const inputFile = process.argv[2];
    if (!inputFile) {
        console.log("Usage: node parse_schema_dump.js <input_file>");
        // Demo with the snippet from conversation if no file provided
        const demoContent = `
        <table>
        CREATE TABLE credit_history (id TEXT PRIMARY KEY, -- 
        customer_id TEXT NOT NULL, description TEXT NOT NULL, amount REAL, deletedon DATETIME, createdon DATETIME DEFAULT CURRENT_TIMESTAMP )
        </table>
        
        <table>
        CREATE TABLE gold_certificate (id TEXT PRIMARY KEY, -- 
        customer_id TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')), deletedon DATETIME, createdon DATETIME DEFAULT CURRENT_TIMESTAMP, updatedon DATETIME, invoice_number TEXT, total_amount REAL DEFAULT 0)
        </table>
        `;
        console.log("No input file provided. Running demonstration...");
        console.log(JSON.stringify(parseSchemaContent(demoContent), null, 2));
    } else {
        try {
            const content = fs.readFileSync(inputFile, 'utf8');
            const result = parseSchemaContent(content);
            console.log(JSON.stringify(result, null, 2));
        } catch (err) {
            console.error("Error reading file:", err.message);
        }
    }
}

module.exports = { parseSchemaContent };
