// ==UserScript==
// @name         ChatGPT Conversation Exporter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Export ChatGPT conversations as a markdown file. All the bad code is because ChatGPT wrote it. The good code is because I fixed it.
// @author       George Mauer
// @match        https://chat.openai.com/chat*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    function htmlToMarkdown(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }

        const tag = node.tagName.toLowerCase();

        if(tag === "pre") {
            const language = node.querySelector(`span`).textContent || ``;
            const codeEl = node.querySelector(`code`);
            if(codeEl) {
                const content = htmlToMarkdown(codeEl);
                return `\n\n\`\`\`${language}\n${content}\n\`\`\`\n\n`;
            }
        }
        let markdown = "";

        for (const child of node.childNodes) {
            markdown += htmlToMarkdown(child);
        }


        switch (tag) {
            case "p":
                return `\n\n${markdown}\n\n`;
            case "code":
                return `\`${markdown}\``;
            case "strong":
                return `**${markdown}**`;
            case "em":
                return `*${markdown}*`;
            case "span":
                return markdown;
            default:
                return markdown;
        }
    }

    // Function to generate markdown content
    function generateMarkdown(conversation) {
        let markdownContent = `# ChatGPT Conversation\n\n`;
        for(const entry of conversation) {
            const role = entry.role === 'user' ? '**User**' : '**ChatGPT**';
            markdownContent += `${role}: ${entry.content}\n\n`;
        }
        return markdownContent;
    }

    function * getConversation() {
        for(const element of document.querySelectorAll('.text-base')) {
            const isGpt = !!element.querySelector('.markdown')
            const role = !isGpt ? 'user' : 'system';
            const content = htmlToMarkdown(element).trim();
            yield ({ role, content });
        };
    }

    // Function to execute when the "Export" button is clicked
    function exportConversation() {
        const conversation = getConversation();
        const markdownContent = generateMarkdown(conversation);

        // Output markdown content to the console
        console.log(markdownContent);

        // Copy markdown content to the clipboard
        GM_setClipboard(markdownContent, 'text');
    }

    // Add an "Export" button to the page
    function addButton() {
        const button = document.createElement('button');
        button.innerText = 'Export Conversation';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = 1000;
        button.onclick = exportConversation;

        document.body.appendChild(button);
    }

    // Add the button after the page has loaded
    window.addEventListener('load', addButton);
})();
