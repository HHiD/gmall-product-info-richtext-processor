# Quick Start Prompts for Product Info Processor MCP

Copy and paste these prompts to ensure AI assistants follow the correct workflow.

## 🚀 Ready-to-Use Prompts

### Prompt 1: Complete Workflow (Recommended)
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

### Prompt 2: For Line-by-Line Format
```
I have product information in line-by-line format (attribute name on one line, value on next line). Please use the Product Info Processor MCP with this exact workflow:

1. FIRST: Access file://example/processed_products.md to see the expected format
2. SECOND: Use parse_raw_text_to_json with my raw text below
3. THIRD: Use convert_json_to_html with the resulting JSON
4. Show me both the JSON and final HTML

My product data (line-by-line format):
[PASTE YOUR LINE-BY-LINE DATA HERE]
```

### Prompt 3: For Colon-Separated Format
```
I have product information with colon-separated attributes. Please process it using the Product Info Processor MCP:

Step 1: Access the template file://example/processed_products.md
Step 2: Parse this data using parse_raw_text_to_json
Step 3: Convert to HTML using convert_json_to_html
Step 4: Show me the results

Raw product text (colon-separated):
[PASTE YOUR COLON-SEPARATED DATA HERE]
```

## 🔧 Troubleshooting Prompts

### If AI Skips Steps:
```
STOP! You must follow the exact workflow for this MCP:

1. You MUST access file://example/processed_products.md FIRST
2. You MUST use parse_raw_text_to_json to generate JSON
3. You MUST use convert_json_to_html to create HTML

Please start over and follow each step in order. Do not skip any steps.
```

### If AI Doesn't Access Template:
```
Before processing any data, you MUST first access the template:
- Use: access_mcp_resource
- URI: file://example/processed_products.md

This is MANDATORY to understand the expected format. Please do this first, then proceed with parsing.
```

## 📋 Verification Checklist

After running the workflow, verify:
- [ ] AI accessed the markdown template first
- [ ] AI used parse_raw_text_to_json tool
- [ ] AI generated valid JSON with "products" array
- [ ] AI used convert_json_to_html tool
- [ ] Final HTML has proper styling and structure

## 💡 Pro Tips for Users

1. **Always include the workflow steps** in your prompt
2. **Use "MANDATORY" or "MUST"** for critical steps
3. **Number your steps clearly** (Step 1, Step 2, etc.)
4. **Ask for confirmation** after each step if needed
5. **Share this file** with others using your MCP

## 📤 Sharing Template

When sharing your MCP server, send this message:

```
I'm sharing a Product Info Processor MCP server with you. 

IMPORTANT: This MCP has a specific workflow that must be followed exactly. Please use the prompts from this file: QUICK-START-PROMPTS.md

The workflow is:
1. Access template first (mandatory)
2. Parse raw text to JSON
3. Convert JSON to HTML

Do not skip steps or try to do everything at once.
```

## 🎯 Expected Results

A successful workflow should produce:
1. **JSON Output**: Structured data with product names and attributes
2. **HTML Output**: Clean, formatted HTML with proper styling
3. **All Attributes**: Every piece of product information properly organized

Copy these prompts and share them with anyone using your MCP server!
