#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProductData {
  name: string;
  attributes: Record<string, string>;
}

interface ProductsJson {
  products: ProductData[];
}

class SimplifiedProductProcessor {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'product-info-processor',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    
    // Error handling
    this.server.onerror = (error: any) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'parse_raw_text_to_json',
          description: 'Parse raw product text and return structured JSON following the markdown template format',
          inputSchema: {
            type: 'object',
            properties: {
              rawText: {
                type: 'string',
                description: 'Raw text containing product information',
              },
            },
            required: ['rawText'],
          },
        },
        {
          name: 'convert_json_to_html',
          description: 'Convert structured product JSON to formatted HTML',
          inputSchema: {
            type: 'object',
            properties: {
              productsJson: {
                type: 'string',
                description: 'JSON string containing structured product data',
              },
            },
            required: ['productsJson'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      try {
        switch (request.params.name) {
          case 'parse_raw_text_to_json':
            return await this.parseRawTextToJson(request.params.arguments);
          case 'convert_json_to_html':
            return await this.convertJsonToHtml(request.params.arguments);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'file://example/processed_products.md',
          name: 'Example Processed Products (Markdown Template)',
          description: 'Template showing the expected markdown format for product information',
          mimeType: 'text/markdown',
        },
        {
          uri: 'file://example/product-info-formatted-output.html',
          name: 'Example Product HTML Output (HTML Template)',
          description: 'Template showing the expected HTML format for product information',
          mimeType: 'text/html',
        },
        {
          uri: 'file://schema/product-schema.json',
          name: 'Product JSON Schema',
          description: 'JSON schema defining the structure for product data',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
      const uri = request.params.uri;
      
      try {
        if (uri === 'file://example/processed_products.md') {
          const filePath = join(__dirname, '..', 'example', 'processed_products.md');
          const content = readFileSync(filePath, 'utf-8');
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: content,
              },
            ],
          };
        } else if (uri === 'file://example/product-info-formatted-output.html') {
          const filePath = join(__dirname, '..', 'example', 'product-info-formatted-output.html');
          const content = readFileSync(filePath, 'utf-8');
          return {
            contents: [
              {
                uri,
                mimeType: 'text/html',
                text: content,
              },
            ],
          };
        } else if (uri === 'file://schema/product-schema.json') {
          const schema = {
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
                      "description": "Product attributes as key-value pairs (属性名: 属性值)"
                    }
                  },
                  "required": ["name", "attributes"]
                }
              }
            },
            "required": ["products"]
          };
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(schema, null, 2),
              },
            ],
          };
        } else {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown resource: ${uri}`
          );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to read resource ${uri}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async parseRawTextToJson(args: any) {
    if (!args || typeof args.rawText !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'rawText parameter is required and must be a string');
    }

    // Simple parsing logic - the AI model should do the heavy lifting
    const products = this.basicParseRawText(args.rawText);
    const result: ProductsJson = { products };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async convertJsonToHtml(args: any) {
    if (!args || typeof args.productsJson !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'productsJson parameter is required and must be a string');
    }

    try {
      const productsData: ProductsJson = JSON.parse(args.productsJson);
      const html = this.generateHtmlFromJson(productsData);
      
      return {
        content: [
          {
            type: 'text',
            text: html,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private basicParseRawText(rawText: string): ProductData[] {
    // This is a minimal parser - the AI model should do the real parsing
    // This method just provides a fallback structure
    const products: ProductData[] = [];
    
    // Clean and split lines
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check if this is line-by-line format (alternating attribute names and values)
    const hasColonFormat = lines.some(line => line.includes('：') || line.includes(':'));
    
    if (!hasColonFormat && lines.length > 1 && lines.length % 2 === 0) {
      // Line-by-line format: attribute name on one line, value on next line
      const product: ProductData = {
        name: "收纳桶", // Default name, will be updated if we find specific attributes
        attributes: {}
      };
      
      for (let i = 0; i < lines.length; i += 2) {
        const attrName = lines[i];
        const attrValue = lines[i + 1];
        
        if (attrName && attrValue) {
          // Determine product name from key attributes
          if (attrName === '用途' || attrName === '商品名称' || attrName === '产品名称') {
            product.name = attrValue;
          } else if (attrName === '品牌' && product.name === "收纳桶") {
            product.name = `${attrValue} 收纳桶`;
          }
          
          product.attributes[attrName] = attrValue;
        }
      }
      
      products.push(product);
    } else {
      // Traditional colon-separated format or numbered format
      const productBlocks = rawText.split(/\n\s*\d+\.\s*/).filter(block => block.trim());
      
      if (productBlocks.length === 0) {
        // Single product without numbering
        const product: ProductData = {
          name: "产品信息",
          attributes: {}
        };
        
        lines.forEach(line => {
          const match = line.match(/([^：:]+)[：:]\s*(.+)/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            if (key === '商品名称' || key === '产品名称' || key === '用途') {
              product.name = value;
            } else {
              product.attributes[key] = value;
            }
          }
        });
        
        products.push(product);
      } else {
        // Multiple numbered products
        productBlocks.forEach((block, index) => {
          const blockLines = block.split('\n').map(line => line.trim()).filter(line => line);
          const product: ProductData = {
            name: `产品 ${index + 1}`,
            attributes: {}
          };
          
          blockLines.forEach(line => {
            const match = line.match(/([^：:]+)[：:]\s*(.+)/);
            if (match) {
              const key = match[1].trim();
              const value = match[2].trim();
              if (key === '商品名称' || key === '产品名称') {
                product.name = value;
              } else {
                product.attributes[key] = value;
              }
            }
          });
          
          products.push(product);
        });
      }
    }
    
    return products;
  }

  private generateHtmlFromJson(productsData: ProductsJson): string {
    const htmlTemplate = `<html>
<head>
    <meta charset="UTF-8">
    <title>Product Information</title>
</head>
<body>
    <div class="rich-text-content">
        {products_html}
    </div>
</body>
</html>`;

    const productTemplate = `        <div class="product-info" style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: #333; margin-bottom: 12px; font-size: 16px;">{product_name}</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
{attributes_html}
            </ul>
        </div>`;
    
    const attributeTemplate = `                <p style="margin: 6px 0;"> <strong style="color: #666;">{attr_name}:</strong> <span style="color: #333;">{attr_value}</span> </p>`;
    
    let productsHtml = '';
    for (const product of productsData.products) {
      let attributesHtml = '';
      for (const [attrName, attrValue] of Object.entries(product.attributes)) {
        attributesHtml += attributeTemplate
          .replace('{attr_name}', attrName)
          .replace('{attr_value}', attrValue) + '\n';
      }
      
      productsHtml += productTemplate
        .replace('{product_name}', product.name)
        .replace('{attributes_html}', attributesHtml.trim()) + '\n';
    }
    
    return htmlTemplate.replace('{products_html}', productsHtml.trim());
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Simplified Product Info Processor MCP server running on stdio');
  }
}

const server = new SimplifiedProductProcessor();
server.run().catch(console.error);
