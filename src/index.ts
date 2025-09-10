#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

interface Product {
  name: string;
  attributes: Record<string, string>;
}

class ProductInfoProcessor {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'product-info-processor',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
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
          name: 'format_product_text',
          description: 'Format raw product text into structured markdown format',
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
          name: 'generate_product_html',
          description: 'Generate formatted HTML from structured product markdown',
          inputSchema: {
            type: 'object',
            properties: {
              markdownContent: {
                type: 'string',
                description: 'Structured markdown content with product information',
              },
            },
            required: ['markdownContent'],
          },
        },
        {
          name: 'process_product_workflow',
          description: 'Complete workflow: format raw text and generate HTML in one step',
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
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      try {
        switch (request.params.name) {
          case 'format_product_text':
            return await this.formatProductText(request.params.arguments);
          case 'generate_product_html':
            return await this.generateProductHtml(request.params.arguments);
          case 'process_product_workflow':
            return await this.processProductWorkflow(request.params.arguments);
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

  private async formatProductText(args: any) {
    if (!args || typeof args.rawText !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'rawText parameter is required and must be a string');
    }

    const formattedMarkdown = this.parseRawTextToMarkdown(args.rawText);
    
    return {
      content: [
        {
          type: 'text',
          text: `Formatted product information:\n\n${formattedMarkdown}`,
        },
      ],
    };
  }

  private async generateProductHtml(args: any) {
    if (!args || typeof args.markdownContent !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'markdownContent parameter is required and must be a string');
    }

    const products = this.parseMarkdownContent(args.markdownContent);
    const html = this.generateHtml(products);
    
    return {
      content: [
        {
          type: 'text',
          text: html,
        },
      ],
    };
  }

  private async processProductWorkflow(args: any) {
    if (!args || typeof args.rawText !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'rawText parameter is required and must be a string');
    }

    // Step 1: Format raw text to markdown
    const formattedMarkdown = this.parseRawTextToMarkdown(args.rawText);
    
    // Step 2: Generate HTML from markdown
    const products = this.parseMarkdownContent(formattedMarkdown);
    const html = this.generateHtml(products);
    
    return {
      content: [
        {
          type: 'text',
          text: `Complete workflow result:\n\n**Formatted Markdown:**\n${formattedMarkdown}\n\n**Generated HTML:**\n${html}`,
        },
      ],
    };
  }

  private parseRawTextToMarkdown(rawText: string): string {
    // Simple approach: split by spaces and look for attribute patterns
    const attributes = [
      '商品名称', '规格', '包装方式', '材质', '保质期', '生产日期', '执行标准', 
      '产品特点', '注意事项', '生产商', '备案人/生产商', '生产商地址', '备案人/生产商地址',
      '型号规格', '成分', '功效成分', '总经销', '服务热线', '化妆品生产许可证编号',
      '产地', '制造商', '电话', '产品型号', '额定功率', '额定电压', '额定电流',
      '产品尺寸', '产品净重', '清洗槽容积'
    ];

    let result = '1.  ';
    let processedText = rawText;

    for (const attr of attributes) {
      const pattern = new RegExp(`${attr}[：:]\\s*([^${attributes.join('')}]*?)(?=\\s*(?:${attributes.join('|')})[：:]|$)`, 'g');
      const match = pattern.exec(processedText);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value) {
          result += `${attr}：${value}\n    `;
        }
      }
    }

    return result.trim();
  }

  private parseMarkdownContent(markdownContent: string): Product[] {
    const products: Product[] = [];
    
    // Split content into product blocks
    const productBlocks = markdownContent.split(/\n\s*\n/);
    
    for (const block of productBlocks) {
      // Skip empty blocks
      if (!block.trim()) {
        continue;
      }
      
      // Check if this is a product block (starts with number)
      if (/^\d+\./.test(block)) {
        const product: Product = { name: '', attributes: {} };
        const lines = block.split('\n');
        
        // Extract product name from first line
        const firstLine = lines[0].trim();
        const productNameMatch = firstLine.match(/商品名称[：:]\s*(.+)/);
        if (productNameMatch) {
          product.name = productNameMatch[1].trim();
        } else {
          // If no explicit product name, use the first line after the number
          product.name = firstLine.replace(/^\d+\.\s*/, '').trim();
        }
        
        // Extract attributes from remaining lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) {
            continue;
          }
          
          // Match attribute pattern: "属性名: 属性值"
          const attrMatch = line.match(/([^:：]+)[：:]\s*(.+)/);
          if (attrMatch) {
            const attrName = attrMatch[1].trim();
            const attrValue = attrMatch[2].trim();
            product.attributes[attrName] = attrValue;
          }
        }
        
        products.push(product);
      }
    }
    
    return products;
  }

  private generateHtml(products: Product[]): string {
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
    
    const productTemplate = `
        <div class="product-info" style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="color: #333; margin-bottom: 12px; font-size: 16px;">{product_name}</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
                {attributes_html}
            </ul>
        </div>`;
    
    const attributeTemplate = `
                <p style="margin: 6px 0;"> <strong style="color: #666;">{attr_name}:</strong> <span style="color: #333;">{attr_value}</span> </p>`;
    
    let productsHtml = '';
    for (const product of products) {
      let attributesHtml = '';
      for (const [attrName, attrValue] of Object.entries(product.attributes)) {
        attributesHtml += attributeTemplate
          .replace('{attr_name}', attrName)
          .replace('{attr_value}', attrValue);
      }
      
      productsHtml += productTemplate
        .replace('{product_name}', product.name)
        .replace('{attributes_html}', attributesHtml);
    }
    
    return htmlTemplate.replace('{products_html}', productsHtml);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Product Info Processor MCP server running on stdio');
  }
}

const server = new ProductInfoProcessor();
server.run().catch(console.error);
