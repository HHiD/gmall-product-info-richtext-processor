# Product Info Processor MCP Server

A Model Context Protocol (MCP) server for processing product information from raw text to formatted HTML. This server automates the workflow of parsing product descriptions and generating professional-looking HTML output.

## Features

- **Format Product Text**: Convert raw product text into structured markdown format
- **Generate HTML**: Transform structured product markdown into styled HTML
- **Complete Workflow**: Process raw text and generate HTML in one step
- **Chinese Product Support**: Optimized for Chinese product information with attributes like 商品名称, 规格, 材质, etc.

## Tools Available

### 1. `format_product_text`
Formats raw product text into structured markdown format.

**Parameters:**
- `rawText` (string, required): Raw text containing product information

**Example:**
```javascript
{
  "rawText": "商品名称：正畸咬胶 包装方式：盒装 材质：食品级硅胶..."
}
```

### 2. `generate_product_html`
Generates formatted HTML from structured product markdown.

**Parameters:**
- `markdownContent` (string, required): Structured markdown content with product information

### 3. `process_product_workflow`
Complete workflow: formats raw text and generates HTML in one step.

**Parameters:**
- `rawText` (string, required): Raw text containing product information

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Step 1: Clone or Download
```bash
git clone <repository-url>
cd product-info-processor
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
Add the server to your Cline MCP settings file located at:
`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "product-info-processor": {
      "command": "node",
      "args": ["/path/to/product-info-processor/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Step 5: Restart Cline
Restart Cline to load the new MCP server.

## Usage Examples

Once installed, you can use the server through Cline:

### Format Product Text
```
Please format this product information:
商品名称：正畸咬胶 包装方式：盒装 材质：食品级硅胶 执行标准：GB4806.11-2016 合格
```

### Generate Complete HTML
```
Please process this product information and generate HTML:
商品名称：正畸咬胶 包装方式：盒装 材质：食品级硅胶 保质期：3年 型号规格：HR-008
```

## Supported Product Attributes

The server recognizes and processes the following Chinese product attributes:

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
- 备案人 (Record Holder)
- 包装方式 (Packaging Method)
- 型号规格 (Model Specifications)
- 成分 (Ingredients)
- 功效成分 (Active Ingredients)
- 总经销 (General Distributor)
- 服务热线 (Service Hotline)
- 化妆品生产许可证编号 (Cosmetics Production License Number)
- 产地 (Origin)
- 制造商 (Manufacturer)
- 电话 (Phone)
- 产品型号 (Product Model)
- 额定功率 (Rated Power)
- 额定电压 (Rated Voltage)
- 额定电流 (Rated Current)
- 产品尺寸 (Product Dimensions)
- 产品净重 (Net Weight)
- 清洗槽容积 (Cleaning Tank Capacity)

## HTML Output Style

The generated HTML includes professional styling with:
- Clean card-based layout
- Rounded borders and proper spacing
- Professional color scheme
- Responsive design elements
- Easy-to-read typography

## Development

### Scripts
- `npm run build`: Build the TypeScript code
- `npm run dev`: Watch mode for development
- `npm start`: Start the server

### Project Structure
```
product-info-processor/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
