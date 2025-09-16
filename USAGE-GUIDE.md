# Product Info Processor MCP - Usage Guide

This guide helps AI assistants and users understand how to properly use the Product Info Processor MCP server.

## 🎯 Intended Workflow

This MCP follows a **two-step process** for converting raw product text into formatted HTML:

1. **Step 1**: AI analyzes raw text using markdown template → generates structured JSON
2. **Step 2**: Convert JSON to formatted HTML using MCP tool or script

## 📋 Step-by-Step Instructions for AI Assistants

### Step 1: Analyze Raw Text and Generate JSON

**What to do**: Use the markdown template to understand the expected format, then parse the raw product text into structured JSON.

**Required Actions**:
1. First, access the markdown template to understand the format:
   ```
   access_mcp_resource: file://example/processed_products.md
   ```

2. Then use the parsing tool with the raw text:
   ```
   use_mcp_tool: parse_raw_text_to_json
   arguments: { "rawText": "your raw product text here" }
   ```

**Expected Output**: Structured JSON following this schema:
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

### Step 2: Convert JSON to HTML

**What to do**: Take the JSON from Step 1 and convert it to formatted HTML.

**Required Actions**:
```
use_mcp_tool: convert_json_to_html
arguments: { "productsJson": "JSON string from step 1" }
```

**Expected Output**: Properly formatted HTML matching the template style.

## 🤖 Example AI Prompt Templates

### For Users to Copy-Paste:

**Template 1 - Complete Workflow**:
```
Please use the Product Info Processor MCP to convert this raw product text into formatted HTML. Follow these steps:

1. First, access the markdown template: file://example/processed_products.md
2. Use parse_raw_text_to_json tool with this raw text: [PASTE YOUR RAW TEXT HERE]
3. Then use convert_json_to_html tool with the resulting JSON
4. Show me the final HTML output

Raw product text:
[PASTE YOUR PRODUCT TEXT HERE]
```

**Template 2 - Step-by-Step**:
```
I need help processing product information using the MCP server. Please:

Step 1: Access the template file://example/processed_products.md to understand the format
Step 2: Parse this raw text using parse_raw_text_to_json: [YOUR TEXT]
Step 3: Convert the JSON result to HTML using convert_json_to_html
Step 4: Show me both the JSON and final HTML

Here's my raw product data:
[PASTE YOUR DATA HERE]
```

## 🔧 Alternative: Standalone Script Usage

If MCP tools aren't working, users can also use the standalone script:

1. Save the JSON output to a file (e.g., `products.json`)
2. Run: `node scripts/json-to-html.js products.json output.html`

## 📖 Available Resources

The MCP provides these resources for reference:

1. **Markdown Template**: `file://example/processed_products.md`
   - Shows expected format for product information
   - Use this to understand how to structure the data

2. **HTML Template**: `file://example/product-info-formatted-output.html`
   - Shows the final HTML output format
   - Reference for styling and structure

3. **JSON Schema**: `file://schema/product-schema.json`
   - Defines the JSON structure requirements
   - Use for validation

## ⚠️ Common Issues and Solutions

### Issue 1: AI skips the two-step process
**Solution**: Emphasize that this is a **required two-step workflow**. The AI must:
1. First generate JSON using the template
2. Then convert JSON to HTML

### Issue 2: AI doesn't access the template
**Solution**: Make accessing the template mandatory in your prompt:
```
IMPORTANT: You MUST first access file://example/processed_products.md to understand the format before processing any data.
```

### Issue 3: AI tries to do everything in one step
**Solution**: Use explicit step numbering in your prompt and require confirmation after each step.

## 📝 Recommended Prompt for Sharing

When sharing this MCP with others, include this prompt template:

```
This MCP requires a specific two-step workflow. Please follow exactly:

STEP 1 - MANDATORY: Access the template first
- Use: access_mcp_resource with file://example/processed_products.md
- Study the format to understand how product data should be structured

STEP 2: Parse raw text to JSON
- Use: parse_raw_text_to_json tool
- Input: Your raw product text
- Output: Structured JSON following the template format

STEP 3: Convert JSON to HTML
- Use: convert_json_to_html tool  
- Input: The JSON from step 2
- Output: Formatted HTML

DO NOT skip steps. DO NOT try to do everything at once. Follow the workflow exactly as designed.
```

## 🎯 Success Criteria

A successful workflow should produce:
1. ✅ Structured JSON with proper product names and attributes
2. ✅ Clean HTML output matching the template style
3. ✅ All product attributes properly formatted and displayed

By following this guide, any AI assistant should be able to use the MCP server correctly and produce consistent results.
