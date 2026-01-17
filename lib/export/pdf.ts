/**
 * PDF Export Utilities
 * Generates PDF from markdown content using browser print
 */

/**
 * Convert markdown to styled HTML for PDF
 */
export function markdownToHTML(markdown: string, title?: string): string {
    // Basic markdown to HTML conversion
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold and italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*-\s+(.*)$/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Line breaks and paragraphs
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title || 'CEO Personal OS Export'}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'Georgia', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        h1 {
            font-size: 24pt;
            color: #111;
            border-bottom: 2px solid #0071e3;
            padding-bottom: 10px;
            margin-top: 0;
        }
        h2 {
            font-size: 18pt;
            color: #333;
            margin-top: 30px;
        }
        h3 {
            font-size: 14pt;
            color: #555;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        strong {
            color: #0071e3;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .header h1 {
            border: none;
            margin-bottom: 5px;
        }
        .header .date {
            color: #666;
            font-size: 10pt;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 9pt;
            color: #888;
        }
        @media print {
            body { print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title || 'Export'}</h1>
        <div class="date">Generated on ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</div>
    </div>
    <div class="content">
        <p>${html}</p>
    </div>
    <div class="footer">
        CEO Personal OS - Executive Operating System
    </div>
</body>
</html>`;
}

/**
 * Export content as PDF using browser print dialog
 */
export function exportToPDF(markdown: string, title?: string): void {
    const html = markdownToHTML(markdown, title);

    // Open new window with styled content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
}

/**
 * Export review to PDF
 */
export async function exportReviewToPDF(path: string): Promise<void> {
    try {
        const response = await fetch(`/api/files?type=file&path=${encodeURIComponent(path)}`);
        const data = await response.json();

        if (!data.content) {
            throw new Error('Review content not found');
        }

        // Extract title from path
        const filename = path.split('/').pop()?.replace('.md', '') || 'Review';
        const type = path.includes('daily') ? 'Daily Review'
            : path.includes('weekly') ? 'Weekly Review'
                : path.includes('quarterly') ? 'Quarterly Review'
                    : path.includes('yearly') ? 'Yearly Review'
                        : 'Review';

        exportToPDF(data.content, `${type} - ${filename}`);
    } catch (error) {
        console.error('Failed to export review:', error);
        throw error;
    }
}
