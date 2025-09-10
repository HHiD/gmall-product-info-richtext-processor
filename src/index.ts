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

interface ParseResult {
  structuredData: string;
  unrecognizedContent: string[];
  hasUnrecognizedContent: boolean;
  processingHints: string[];
}

interface AttributeMatch {
  name: string;
  value: string;
  startIndex: number;
  endIndex: number;
}

interface AttributePattern {
  pattern: RegExp;
  name: string;
  frequency: number;
  lastUsed: Date;
}

interface CustomTemplate {
  name: string;
  attributes: string[];
  industry: string;
  createdAt: Date;
}

class ProductInfoProcessor {
  private server: Server;
  private learnedPatterns: AttributePattern[] = [];
  private customTemplates: CustomTemplate[] = [];
  private attributeUsageStats: Map<string, number> = new Map();

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
        {
          name: 'analyze_unstructured_content',
          description: 'AI协助分析和结构化未识别的产品信息',
          inputSchema: {
            type: 'object',
            properties: {
              unstructuredText: {
                type: 'string',
                description: '未结构化的文本内容',
              },
              context: {
                type: 'string',
                description: '已知的产品信息作为上下文',
              },
              industryHint: {
                type: 'string',
                description: '行业提示（如：食品、电子、化妆品等）',
              },
            },
            required: ['unstructuredText'],
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
          case 'analyze_unstructured_content':
            return await this.analyzeUnstructuredContent(request.params.arguments);
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

  private async analyzeUnstructuredContent(args: any) {
    if (!args || typeof args.unstructuredText !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'unstructuredText parameter is required and must be a string');
    }

    const { unstructuredText, context = '', industryHint = '' } = args;
    
    // Analyze the unstructured content with enhanced pattern recognition
    const analysisResult = this.performIntelligentAnalysis(unstructuredText, context, industryHint);
    
    return {
      content: [
        {
          type: 'text',
          text: analysisResult,
        },
      ],
    };
  }

  private parseRawTextToMarkdown(rawText: string): string {
    const parseResult = this.enhancedParseRawText(rawText);
    
    if (parseResult.hasUnrecognizedContent) {
      return this.generateSmartParsingResult(parseResult);
    }
    
    return parseResult.structuredData;
  }

  private enhancedParseRawText(rawText: string): ParseResult {
    const knownAttributes = [
      '商品名称', '规格', '包装方式', '材质', '保质期', '生产日期', '执行标准', 
      '产品特点', '注意事项', '生产商', '备案人/生产商', '生产商地址', '备案人/生产商地址',
      '型号规格', '成分', '功效成分', '总经销', '服务热线', '化妆品生产许可证编号',
      '产地', '制造商', '电话', '产品型号', '额定功率', '额定电压', '额定电流',
      '产品尺寸', '产品净重', '清洗槽容积'
    ];

    // Extract known attributes
    const extractedMatches: AttributeMatch[] = [];
    let structuredResult = '1.  ';

    for (const attr of knownAttributes) {
      const pattern = new RegExp(`${attr}[：:]\\s*([^${knownAttributes.join('')}]*?)(?=\\s*(?:${knownAttributes.join('|')})[：:]|$)`, 'g');
      const match = pattern.exec(rawText);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value) {
          structuredResult += `${attr}：${value}\n    `;
          extractedMatches.push({
            name: attr,
            value: value,
            startIndex: match.index,
            endIndex: match.index + match[0].length
          });
        }
      }
    }

    // Detect unrecognized content
    const unrecognizedContent = this.detectUnrecognizedContent(rawText, extractedMatches);
    const processingHints = this.generateProcessingHints(unrecognizedContent, rawText);

    return {
      structuredData: structuredResult.trim(),
      unrecognizedContent,
      hasUnrecognizedContent: unrecognizedContent.length > 0,
      processingHints
    };
  }

  private detectUnrecognizedContent(rawText: string, extractedMatches: AttributeMatch[]): string[] {
    const unrecognized: string[] = [];
    
    // Create a copy of the text to mark processed regions
    let remainingText = rawText;
    
    // Remove all extracted content
    const sortedMatches = extractedMatches.sort((a, b) => b.startIndex - a.startIndex);
    for (const match of sortedMatches) {
      remainingText = remainingText.substring(0, match.startIndex) + 
                    remainingText.substring(match.endIndex);
    }

    // Look for potential attribute patterns in remaining text
    const potentialPatterns = [
      /([^：:，。！？\s]{2,8})[：:]([^：:，。！？]{1,50})/g,  // Standard colon pattern
      /([^，。！？\s]{2,8})\s*为\s*([^，。！？]{1,30})/g,     // "XX为YY" pattern
      /([^，。！？\s]{2,8})\s*是\s*([^，。！？]{1,30})/g,     // "XX是YY" pattern
      /([^，。！？\s]{2,8})\s*有\s*([^，。！？]{1,30})/g      // "XX有YY" pattern
    ];

    for (const pattern of potentialPatterns) {
      let match;
      while ((match = pattern.exec(remainingText)) !== null) {
        const potentialAttr = `${match[1].trim()}：${match[2].trim()}`;
        if (!unrecognized.includes(potentialAttr)) {
          unrecognized.push(potentialAttr);
        }
      }
    }

    // Also capture any remaining meaningful text chunks
    const meaningfulChunks = remainingText
      .split(/[，。！？\s]+/)
      .filter(chunk => chunk.length > 2 && /[\u4e00-\u9fa5]/.test(chunk))
      .filter(chunk => !unrecognized.some(ur => ur.includes(chunk)));

    unrecognized.push(...meaningfulChunks);

    return unrecognized.filter(content => content.trim().length > 0);
  }

  private generateProcessingHints(unrecognizedContent: string[], originalText: string): string[] {
    const hints: string[] = [];
    
    if (unrecognizedContent.length > 0) {
      hints.push("检测到未识别的产品信息，建议AI模型进行进一步处理");
      
      // Analyze content type and provide specific hints
      const hasNumbers = unrecognizedContent.some(content => /\d+/.test(content));
      const hasUnits = unrecognizedContent.some(content => /(克|千克|毫升|升|厘米|米|寸|英寸|瓦|伏|安|赫兹)/.test(content));
      const hasBrands = unrecognizedContent.some(content => /[A-Za-z]+/.test(content));
      
      if (hasNumbers && hasUnits) {
        hints.push("包含数值和单位信息，可能是规格、尺寸或技术参数");
      }
      if (hasBrands) {
        hints.push("包含英文内容，可能是品牌名称或型号信息");
      }
      
      // Industry-specific hints
      if (originalText.includes('食品') || originalText.includes('营养')) {
        hints.push("建议按食品行业标准处理：营养成分、配料表、保质期等");
      }
      if (originalText.includes('电子') || originalText.includes('电器')) {
        hints.push("建议按电子产品标准处理：技术参数、功率、电压等");
      }
      if (originalText.includes('化妆品') || originalText.includes('护肤')) {
        hints.push("建议按化妆品标准处理：成分、功效、适用肌肤等");
      }
    }
    
    return hints;
  }

  private generateSmartParsingResult(parseResult: ParseResult): string {
    let result = parseResult.structuredData;
    
    if (parseResult.hasUnrecognizedContent) {
      result += `\n\n**🤖 AI处理建议:**\n`;
      result += `以下内容需要AI模型进一步分析和结构化：\n\n`;
      
      parseResult.unrecognizedContent.forEach((content, index) => {
        result += `${index + 1}. ${content}\n`;
      });
      
      result += `\n**💡 处理提示:**\n`;
      parseResult.processingHints.forEach(hint => {
        result += `- ${hint}\n`;
      });
      
      result += `\n**📋 建议操作:**\n`;
      result += `- 请将上述内容按照"属性名：属性值"的格式进行结构化\n`;
      result += `- 保持中文表达习惯，确保属性名称准确\n`;
      result += `- 如果无法确定属性结构，请保持原文并标注说明\n`;
    }
    
    return result;
  }

  private performIntelligentAnalysis(unstructuredText: string, context: string, industryHint: string): string {
    let result = `**🔍 智能分析结果:**\n\n`;
    result += `**原始内容:** ${unstructuredText}\n\n`;
    
    // Enhanced pattern detection with industry-specific templates
    const detectedAttributes = this.detectAttributePatterns(unstructuredText, industryHint);
    
    if (detectedAttributes.length > 0) {
      result += `**🎯 检测到的属性模式:**\n`;
      detectedAttributes.forEach((attr, index) => {
        result += `${index + 1}. ${attr}\n`;
      });
      result += `\n`;
    }
    
    // Context-aware suggestions
    if (context) {
      result += `**📋 基于上下文的建议:**\n`;
      const contextSuggestions = this.generateContextualSuggestions(unstructuredText, context);
      contextSuggestions.forEach(suggestion => {
        result += `- ${suggestion}\n`;
      });
      result += `\n`;
    }
    
    // Industry-specific analysis
    if (industryHint) {
      result += `**🏭 行业特定分析 (${industryHint}):**\n`;
      const industryAnalysis = this.performIndustrySpecificAnalysis(unstructuredText, industryHint);
      result += industryAnalysis;
      result += `\n`;
    }
    
    // Generate structured output template
    result += `**📝 建议的结构化格式:**\n`;
    const structuredTemplate = this.generateStructuredTemplate(unstructuredText, detectedAttributes, industryHint);
    result += structuredTemplate;
    
    return result;
  }

  private detectAttributePatterns(text: string, industryHint: string): string[] {
    const detected: string[] = [];
    
    // Enhanced pattern recognition with multiple strategies
    const patterns = [
      // Standard attribute patterns
      /([^：:，。！？\s]{2,10})[：:]([^：:，。！？\n]{1,50})/g,
      // Measurement patterns
      /(\d+(?:\.\d+)?)\s*(克|千克|毫升|升|厘米|米|寸|英寸|瓦|伏|安|赫兹|Hz|V|A|W|kg|g|ml|L|cm|mm|inch)/g,
      // Brand/Model patterns
      /([A-Za-z]+[-\w]*\d+[A-Za-z\d]*)/g,
      // Date patterns
      /(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日]?)/g,
      // Certification patterns
      /(GB\d+(?:\.\d+)*[-\d]*|ISO\d+|3C认证|CE认证|FDA认证)/g
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const matchedText = match[0].trim();
        if (matchedText && !detected.includes(matchedText)) {
          detected.push(matchedText);
        }
      }
    }
    
    // Industry-specific pattern detection
    if (industryHint) {
      const industryPatterns = this.getIndustrySpecificPatterns(industryHint);
      for (const pattern of industryPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const matchedText = match[0].trim();
          if (matchedText && !detected.includes(matchedText)) {
            detected.push(matchedText);
          }
        }
      }
    }
    
    return detected;
  }

  private getIndustrySpecificPatterns(industryHint: string): RegExp[] {
    const patterns: RegExp[] = [];
    
    if (industryHint.includes('食品') || industryHint.includes('营养')) {
      patterns.push(
        /营养成分[:：]\s*([^，。\n]+)/g,
        /配料[:：]\s*([^，。\n]+)/g,
        /热量[:：]\s*(\d+(?:\.\d+)?\s*(?:千焦|kJ|卡路里|kcal))/g
      );
    }
    
    if (industryHint.includes('电子') || industryHint.includes('电器')) {
      patterns.push(
        /功率[:：]\s*(\d+(?:\.\d+)?\s*[WwkK瓦])/g,
        /电压[:：]\s*(\d+(?:\.\d+)?\s*[Vv伏])/g,
        /频率[:：]\s*(\d+(?:\.\d+)?\s*[HhZz赫兹]+)/g
      );
    }
    
    if (industryHint.includes('化妆品') || industryHint.includes('护肤')) {
      patterns.push(
        /适用肌肤[:：]\s*([^，。\n]+)/g,
        /SPF[:：]?\s*(\d+)/g,
        /保湿度[:：]\s*([^，。\n]+)/g
      );
    }
    
    return patterns;
  }

  private generateContextualSuggestions(unstructuredText: string, context: string): string[] {
    const suggestions: string[] = [];
    
    // Analyze context to understand existing product structure
    const contextAttributes = context.match(/([^：:\n]+)[:：]\s*([^：:\n]+)/g) || [];
    
    if (contextAttributes.length > 0) {
      suggestions.push(`已识别到${contextAttributes.length}个现有属性，建议保持一致的命名风格`);
      
      // Suggest similar attribute names based on context
      const existingAttrNames = contextAttributes.map(attr => attr.split(/[:：]/)[0].trim());
      const similarAttrs = this.findSimilarAttributes(unstructuredText, existingAttrNames);
      
      if (similarAttrs.length > 0) {
        suggestions.push(`发现可能相关的属性：${similarAttrs.join('、')}`);
      }
    }
    
    // Content-based suggestions
    if (unstructuredText.includes('适用') || unstructuredText.includes('适合')) {
      suggestions.push('检测到适用性描述，建议创建"适用范围"或"适用人群"属性');
    }
    
    if (/\d+/.test(unstructuredText)) {
      suggestions.push('包含数值信息，建议明确单位和测量标准');
    }
    
    return suggestions;
  }

  private findSimilarAttributes(text: string, existingAttrs: string[]): string[] {
    const similar: string[] = [];
    
    for (const attr of existingAttrs) {
      // Simple similarity check based on common Chinese attribute patterns
      const attrKeywords = attr.split(/[的、]/);
      for (const keyword of attrKeywords) {
        if (keyword.length > 1 && text.includes(keyword)) {
          similar.push(attr);
          break;
        }
      }
    }
    
    return [...new Set(similar)];
  }

  private performIndustrySpecificAnalysis(text: string, industryHint: string): string {
    let analysis = '';
    
    if (industryHint.includes('食品') || industryHint.includes('营养')) {
      analysis += '- 建议关注营养成分表、配料清单、保质期信息\n';
      analysis += '- 检查是否包含过敏原信息\n';
      analysis += '- 验证食品安全标准和认证信息\n';
    } else if (industryHint.includes('电子') || industryHint.includes('电器')) {
      analysis += '- 重点关注技术规格：功率、电压、频率等\n';
      analysis += '- 检查安全认证：3C、CE、FCC等\n';
      analysis += '- 确认产品型号和兼容性信息\n';
    } else if (industryHint.includes('化妆品') || industryHint.includes('护肤')) {
      analysis += '- 关注成分列表和功效说明\n';
      analysis += '- 检查适用肌肤类型和使用方法\n';
      analysis += '- 验证化妆品备案信息\n';
    } else {
      analysis += '- 通用产品信息分析\n';
      analysis += '- 建议明确产品类别以获得更精准的分析\n';
    }
    
    return analysis;
  }

  private generateStructuredTemplate(text: string, detectedAttributes: string[], industryHint: string): string {
    let template = '';
    
    if (detectedAttributes.length > 0) {
      template += '```\n';
      detectedAttributes.forEach((attr, index) => {
        // Try to extract attribute name and value
        const colonMatch = attr.match(/([^：:]+)[：:](.+)/);
        if (colonMatch) {
          template += `${colonMatch[1].trim()}：${colonMatch[2].trim()}\n`;
        } else {
          template += `属性${index + 1}：${attr}\n`;
        }
      });
      template += '```\n';
    } else {
      template += '```\n';
      template += '建议格式：\n';
      template += '属性名称：属性值\n';
      template += '规格型号：具体规格\n';
      template += '技术参数：参数值\n';
      template += '```\n';
    }
    
    return template;
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
