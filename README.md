# Product Info Processor MCP Server

A simplified Model Context Protocol (MCP) server for processing product information from raw text to formatted HTML using a clean two-step workflow.

## 🎯 Architecture Overview

This MCP follows a **simplified two-step process**:

1. **Step 1**: AI model analyzes raw text using markdown template → generates structured JSON
2. **Step 2**: Simple script converts JSON → formatted HTML

This approach leverages AI's natural language processing capabilities while keeping the MCP server simple and focused.

## 🚀 Features

- **Clean Two-Step Workflow**: Separation between AI parsing and HTML formatting
- **Multiple Input Formats**: Supports both colon-separated and line-by-line product formats
- **Standalone Script**: Alternative JSON-to-HTML converter for flexibility
- **Template-Driven**: Uses markdown templates to guide AI parsing
- **Chinese Product Support**: Optimized for Chinese product information
- **External Caller Support**: Fixed resource path resolution for reliable external access

## 🛠️ Available Tools

### 1. `parse_raw_text_to_json`
Parses raw product text and returns structured JSON following the markdown template format.

**Parameters:**
- `rawText` (string, required): Raw text containing product information

**Example Input:**
```
品牌
上海品磊
自重
1.5-10
壁厚
2.5
```

**Example Output:**
```json
{
  "products": [
    {
      "name": "收纳桶",
      "attributes": {
        "品牌": "上海品磊",
        "自重": "1.5-10",
        "壁厚": "2.5"
      }
    }
  ]
}
```

### 2. `convert_json_to_html`
Converts structured product JSON to formatted HTML.

**Parameters:**
- `productsJson` (string, required): JSON string containing structured product data

## 📚 Available Resources

The MCP provides template resources for consistent formatting:

1. **`file://example/processed_products.md`** - Markdown template showing expected format
2. **`file://example/product-info-formatted-output.html`** - HTML template showing output format  
3. **`file://schema/product-schema.json`** - JSON schema defining data structure

## 📋 Usage Documentation

**For Users and AI Assistants:**
- **[QUICK-START-PROMPTS.md](QUICK-START-PROMPTS.md)** - Ready-to-copy prompts for immediate use
- **[USAGE-GUIDE.md](USAGE-GUIDE.md)** - Comprehensive guide with troubleshooting
- **[README-SIMPLIFIED.md](README-SIMPLIFIED.md)** - Technical architecture details

## 🤖 Recommended Usage Prompt

When using this MCP, use this prompt to ensure proper workflow:

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

## 🔧 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Step 1: Clone the Repository
```bash
git clone https://github.com/HHiD/gmall-product-info-richtext-processor.git
cd gmall-product-info-richtext-processor
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build the Server
```bash
npm run build
```

### Step 4: Configure MCP Settings
Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "product-info-processor": {
      "command": "node",
      "args": ["/path/to/product-info-processor/build/index.js"],
      "disabled": false
    }
  }
}
```

### Step 5: Restart Your MCP Client
Restart your MCP client (e.g., Cline) to load the new server.

## 💡 Usage Examples

### Example 1: Line-by-Line Format
```
Input:
品牌
上海品磊
自重
1.5-10
用途
收纳桶

Output JSON:
{
  "products": [
    {
      "name": "收纳桶",
      "attributes": {
        "品牌": "上海品磊",
        "自重": "1.5-10",
        "用途": "收纳桶"
      }
    }
  ]
}
```

### Example 2: Colon-Separated Format
```
Input:
商品名称：硅胶洗漱包
规格：单支装
材质：硅胶

Output JSON:
{
  "products": [
    {
      "name": "硅胶洗漱包",
      "attributes": {
        "规格": "单支装",
        "材质": "硅胶"
      }
    }
  ]
}
```

## 🔧 Alternative: Standalone Script

For non-MCP usage, use the standalone converter:

```bash
# Convert JSON file to HTML
node scripts/json-to-html.js products.json output.html

# Use with pipes
cat products.json | node scripts/json-to-html.js - output.html
```

## 📁 Project Structure

```
product-info-processor/
├── src/
│   └── index.ts                    # Main MCP server implementation
├── scripts/
│   └── json-to-html.js            # Standalone JSON→HTML converter
├── example/
│   ├── processed_products.md       # Markdown template for AI
│   ├── products-example.json       # Example JSON structure
│   └── product-info-formatted-output.html  # HTML template
├── test_input/                     # Test data files
├── test_output/                    # Generated test results
├── build/                          # Compiled JavaScript
├── USAGE-GUIDE.md                  # Comprehensive usage guide
├── QUICK-START-PROMPTS.md          # Ready-to-copy prompts
├── README-SIMPLIFIED.md            # Technical architecture details
└── README.md                       # This file
```

## 🎯 Benefits of Simplified Architecture

1. **Cleaner Code**: Reduced complexity from ~600 to ~350 lines
2. **Better Separation**: AI handles parsing, script handles formatting
3. **Easier Testing**: Each component can be tested independently
4. **More Flexible**: JSON intermediate format allows different output formats
5. **Maintainable**: Simple, focused functions are easier to debug and extend
6. **Reliable**: Fixed external caller resource access issues

## 🔍 Supported Product Attributes

The server recognizes and processes common Chinese product attributes:

- 商品名称 (Product Name)
- 规格 (Specifications)  
- 材质 (Material)
- 保质期 (Shelf Life)
- 生产日期 (Production Date)
- 执行标准 (Execution Standard)
- 产品特点 (Product Features)
- 注意事项 (Precautions)
- 生产商 (Manufacturer)
- 生产商地址 (Manufacturer Address)
- 包装方式 (Packaging Method)
- 型号规格 (Model Specifications)
- 成分 (Ingredients)
- 产地 (Origin)
- And many more...

## 🎨 HTML Output Style

The generated HTML includes:
- Clean card-based layout with rounded borders
- Professional color scheme (gray borders, styled text)
- Proper spacing and typography
- Responsive design elements
- Easy-to-read attribute formatting

## 🔧 Development

### Scripts
- `npm run build`: Build the TypeScript code
- `npm run dev`: Watch mode for development (if configured)
- `npm start`: Start the server

### Testing
Test files are included in `test_input/` and `test_output/` directories with real product data examples.

## 🚀 Migration from Complex Version

This simplified version replaces the previous complex implementation with:
- Reduced code complexity (from ~600 to ~350 lines)
- Better error handling and resource path resolution
- Cleaner separation between AI parsing and HTML formatting
- More reliable external caller support

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For issues or questions:
1. Check the [USAGE-GUIDE.md](USAGE-GUIDE.md) for troubleshooting
2. Use the prompts in [QUICK-START-PROMPTS.md](QUICK-START-PROMPTS.md)
3. Submit an issue on GitHub

## 🔗 Repository

GitHub: [HHiD/gmall-product-info-richtext-processor](https://github.com/HHiD/gmall-product-info-richtext-processor)
