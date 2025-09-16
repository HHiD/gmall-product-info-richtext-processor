#!/usr/bin/env node

/**
 * Standalone script to convert product JSON to HTML
 * Usage: node scripts/json-to-html.js <input.json> [output.html]
 */

import fs from 'fs';
import path from 'path';

function generateHtmlFromJson(productsData) {
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

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Usage: node scripts/json-to-html.js <input.json> [output.html]');
        console.error('');
        console.error('Examples:');
        console.error('  node scripts/json-to-html.js products.json');
        console.error('  node scripts/json-to-html.js products.json output.html');
        console.error('  cat products.json | node scripts/json-to-html.js');
        process.exit(1);
    }
    
    let inputFile = args[0];
    let outputFile = args[1];
    
    try {
        let jsonContent;
        
        // Handle stdin input
        if (inputFile === '-' || !fs.existsSync(inputFile)) {
            if (process.stdin.isTTY) {
                throw new Error(`Input file not found: ${inputFile}`);
            }
            // Read from stdin
            let stdinData = '';
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', (chunk) => {
                stdinData += chunk;
            });
            process.stdin.on('end', () => {
                try {
                    const productsData = JSON.parse(stdinData);
                    const html = generateHtmlFromJson(productsData);
                    
                    if (outputFile) {
                        fs.writeFileSync(outputFile, html, 'utf8');
                        console.log(`HTML generated successfully: ${outputFile}`);
                    } else {
                        console.log(html);
                    }
                } catch (error) {
                    console.error('Error processing stdin:', error.message);
                    process.exit(1);
                }
            });
            return;
        }
        
        // Read from file
        jsonContent = fs.readFileSync(inputFile, 'utf8');
        const productsData = JSON.parse(jsonContent);
        
        // Validate JSON structure
        if (!productsData.products || !Array.isArray(productsData.products)) {
            throw new Error('Invalid JSON structure. Expected format: {"products": [...]}');
        }
        
        // Generate HTML
        const html = generateHtmlFromJson(productsData);
        
        // Output
        if (outputFile) {
            fs.writeFileSync(outputFile, html, 'utf8');
            console.log(`HTML generated successfully: ${outputFile}`);
        } else {
            // If no output file specified, generate one based on input filename
            const inputBasename = path.basename(inputFile, path.extname(inputFile));
            const defaultOutput = `${inputBasename}.html`;
            fs.writeFileSync(defaultOutput, html, 'utf8');
            console.log(`HTML generated successfully: ${defaultOutput}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run main function if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { generateHtmlFromJson };
