# MCP Resources Documentation

## Overview

This MCP server exposes example files as resources that AI modules can reference to understand the expected input and output formats for product information processing.

## Available Resources

### 1. Example Processed Products (Markdown)
- **URI**: `file://example/processed_products.md`
- **MIME Type**: `text/markdown`
- **Description**: Example of structured markdown output showing properly formatted product information
- **Purpose**: Shows the expected format for structured product data after processing raw text

### 2. Example Product HTML Output
- **URI**: `file://example/product-info-formatted-output.html`
- **MIME Type**: `text/html`
- **Description**: Example of final HTML output showing formatted product information with styling
- **Purpose**: Shows the expected HTML format for displaying product information with proper styling

## How AI Modules Can Use These Resources

### 1. Understanding Expected Output Format
AI modules can access these resources to understand:
- The structured markdown format used for product information
- The HTML template and styling used for final output
- The attribute naming conventions and organization

### 2. Using Resources in MCP Clients
```javascript
// List available resources
const resources = await client.listResources();

// Read the markdown example
const markdownExample = await client.readResource('file://example/processed_products.md');

// Read the HTML example
const htmlExample = await client.readResource('file://example/product-info-formatted-output.html');
```

### 3. Reference for Processing
When processing product information, AI modules can:
- Reference the markdown example to understand the expected structure
- Use the HTML example to understand the final presentation format
- Follow the attribute naming patterns shown in the examples
- Maintain consistency with the formatting standards

## Benefits for AI Modules

1. **Consistency**: Ensures all AI modules produce output in the same format
2. **Reference**: Provides concrete examples of expected input/output
3. **Standards**: Establishes clear formatting and naming conventions
4. **Quality**: Helps maintain high-quality, structured output

## Integration Example

```javascript
// AI module can reference these resources when processing
const exampleFormat = await client.readResource('file://example/processed_products.md');

// Use the example to understand structure and format new product data accordingly
const processedData = formatProductData(rawInput, exampleFormat);
```

## Resource Content Summary

The example files contain:
- **Markdown**: 5 different product examples with various attribute types
- **HTML**: Complete styled HTML document with proper formatting
- **Attributes**: Common product attributes like 商品名称, 规格, 材质, etc.
- **Structure**: Numbered list format with consistent attribute-value pairs

These resources serve as the definitive reference for how product information should be structured and presented by this MCP server.
