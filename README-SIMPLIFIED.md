# Simplified Product Info Processor MCP

This is a simplified version of the Product Info Processor MCP that follows a cleaner two-step workflow:

1. **Step 1**: AI model analyzes raw text using markdown template → generates structured JSON
2. **Step 2**: Simple script converts JSON → formatted HTML

## Architecture Overview

### Original vs Simplified Approach

**Original (Complex)**:
- Single MCP with complex parsing logic
- Multiple tools with overlapping functionality
- Heavy processing within MCP server
- Difficult to maintain and extend

**Simplified (Clean)**:
- Two focused tools: `parse_raw_text_to_json` and `convert_json_to_html`
- Clear separation of concerns
- AI model does the heavy lifting for parsing
- Simple, maintainable codebase

## Workflow

### Step 1: Raw Text → JSON
The calling AI model uses the markdown template (`example/processed_products.md`) to analyze raw product text and generate structured JSON:

```json
{
  "products": [
    {
      "name": "产品名称",
      "attributes": {
        "属性名1": "属性值1",
        "属性名2": "属性值2"
      }
    }
  ]
}
```

### Step 2: JSON → HTML
Convert the structured JSON to formatted HTML using either:
- MCP tool: `convert_json_to_html`
- Standalone script: `scripts/json-to-html.js`

## Usage

### Using MCP Tools

```javascript
// Step 1: Parse raw text to JSON
const jsonResult = await mcpClient.callTool('parse_raw_text_to_json', {
  rawText: "商品名称：硅胶洗漱包\n规格：单支装\n材质：硅胶..."
});

// Step 2: Convert JSON to HTML
const htmlResult = await mcpClient.callTool('convert_json_to_html', {
  productsJson: jsonResult.content[0].text
});
```

### Using Standalone Script

```bash
# Convert JSON file to HTML
node scripts/json-to-html.js products.json output.html

# Use with pipes
cat products.json | node scripts/json-to-html.js - output.html
```

## Files Structure

```
├── src/
│   ├── index.ts              # Original complex implementation
│   └── simplified-index.ts   # New simplified implementation
├── scripts/
│   └── json-to-html.js      # Standalone JSON→HTML converter
├── example/
│   ├── processed_products.md     # Markdown template for AI model
│   ├── products-example.json     # Example JSON structure
│   └── product-info-formatted-output.html  # HTML template
└── test_output/
    └── simplified-test.html  # Generated test output
```

## JSON Schema

The intermediate JSON format follows this schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "products": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Product name (商品名称)"
          },
          "attributes": {
            "type": "object",
            "patternProperties": {
              "^.*$": {
                "type": "string"
              }
            },
            "description": "Product attributes as key-value pairs"
          }
        },
        "required": ["name", "attributes"]
      }
    }
  },
  "required": ["products"]
}
```

## Benefits of Simplified Approach

1. **Cleaner Code**: Reduced complexity from ~600 lines to ~300 lines
2. **Better Separation**: AI handles parsing, script handles formatting
3. **Easier Testing**: Each component can be tested independently
4. **More Flexible**: JSON intermediate format allows different output formats
5. **Maintainable**: Simple, focused functions are easier to debug and extend

## Building and Running

```bash
# Build the simplified server
npm run build

# The simplified server will be available as an alternative implementation
# To use it, you would need to update the MCP configuration to point to:
# node build/simplified-index.js
```

## Example Workflow

1. **AI Model Task**: "Analyze this raw product text using the markdown template and generate JSON"
   - Input: Raw product text
   - Template: `example/processed_products.md`
   - Output: Structured JSON

2. **Script Conversion**: "Convert JSON to HTML"
   - Input: Structured JSON
   - Template: `example/product-info-formatted-output.html`
   - Output: Formatted HTML

This approach leverages the AI model's natural language processing capabilities while keeping the MCP server simple and focused.

## 📚 Usage Documentation

**For Users and AI Assistants**:
- **[QUICK-START-PROMPTS.md](QUICK-START-PROMPTS.md)** - Ready-to-copy prompts for immediate use
- **[USAGE-GUIDE.md](USAGE-GUIDE.md)** - Comprehensive guide with troubleshooting

**Important**: When sharing this MCP with others, make sure they use the provided prompts to ensure their AI follows the correct workflow.

## 🤖 Recommended Prompt for Others

When sharing this MCP, include this prompt:

```
IMPORTANT: This MCP requires a specific two-step workflow. Please follow exactly:

STEP 1 - MANDATORY: Access the template first
- Use access_mcp_resource with file://example/processed_products.md
- Study the format to understand how product data should be structured

STEP 2: Parse my raw text to JSON
- Use parse_raw_text_to_json tool with the raw text I provide below
- Generate structured JSON following the template format

STEP 3: Convert JSON to HTML
- Use convert_json_to_html tool with the JSON from step 2
- Show me the final formatted HTML

DO NOT skip steps. DO NOT try to do everything at once. Follow the workflow exactly.

Here's my raw product text:
[PASTE YOUR PRODUCT TEXT HERE]
```
