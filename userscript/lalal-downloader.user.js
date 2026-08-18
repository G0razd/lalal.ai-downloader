// ==UserScript==
// @name         Lalal.ai Downloader & Merger
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Download and merge Lalal.ai audio segments directly from the browser! Injects seamlessly into the UI.
// @author       G0razd (and Copilot)
// @match        *://*.lalal.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // We intercept network requests to detect the ID and stems
    const foundStems = new Map(); // e.g. Map("vocals_playlist" -> "fileID")

    const injectAutoDetector = () => {
        const script = document.createElement('script');
        script.textContent = `
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                if (url.includes('d.lalal.ai/media/')) {
                    const match = url.match(/\\/media\\/(?:preview|split)\\/(.*?\\/.*?)\\/(.*?)\\/segment-000\\.mp3/);
                    if (match && match[1] && match[2]) {
                        window.postMessage({ type: 'LALAL_AUTO_ID', id: match[1], path: match[2], url: url }, '*');
                    }
                }
                return originalFetch.apply(this, args);
            };
        `;
        document.documentElement.appendChild(script);
        script.remove();
    };

    // Download functionality
    async function startDownload(fileId, typePath, btnElement) {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = `<span style="font-size: 11px; font-weight: bold; color: #111;">0%</span>`;
        btnElement.style.background = "#fff";
        btnElement.disabled = true;

        try {
            let buffers = [];
            let i = 0;
            
            while(true) {
                const num = i.toString().padStart(3, '0');
                const url = \`https://d.lalal.ai/media/split/\${fileId}/\${typePath}/segment-\${num}.mp3\`;
                
                if(i % 5 === 0) btnElement.innerHTML = \`<span style="font-size: 11px; font-weight: bold; color: #111;">\${i}...</span>\`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    if (i === 0) throw new Error("404");
                    break; 
                }
                
                const arrayBuffer = await response.arrayBuffer();
                buffers.push(arrayBuffer);
                i++;
            }

            btnElement.innerHTML = \`<span style="font-size: 11px; font-weight: bold; color: #111;">OK!</span>\`;
            const blob = new Blob(buffers, { type: 'audio/mpeg' });
            const downloadUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = \`Lalal_AI_\${typePath.replace('_playlist', '')}.mp3\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            setTimeout(() => { btnElement.innerHTML = originalHTML; btnElement.style.background = "#F8D231"; btnElement.disabled = false; }, 3000);
        } catch (e) {
            btnElement.innerHTML = \`<span style="font-size: 11px; font-weight: bold; color: #ff3333;">ERR</span>\`;
            setTimeout(() => { btnElement.innerHTML = originalHTML; btnElement.style.background = "#F8D231"; btnElement.disabled = false; }, 3000);
        }
    }

    // UI Injection via MutationObserver
    const observer = new MutationObserver(() => {
        if (foundStems.size === 0) return;

        const spans = Array.from(document.querySelectorAll('span'));
        
        spans.forEach(span => {
            const text = span.textContent.trim().toLowerCase();
            let matchedPath = null;
            
            if (text === 'vocal' || text === 'vocals') matchedPath = 'vocals_playlist';
            else if (text === 'instrumental' || text === 'no vocals') matchedPath = 'no_vocals_playlist';
            else if (text === 'voice') matchedPath = 'voice_playlist';
            else if (text === 'noise') matchedPath = 'no_voice_playlist';
            else if (text === 'drums') matchedPath = 'drum_playlist';
            else if (text === 'bass') matchedPath = 'bass_playlist';
            else if (text === 'electric guitar') matchedPath = 'electric_guitar_playlist';
            else if (text === 'acoustic guitar') matchedPath = 'acoustic_guitar_playlist';
            else if (text === 'piano') matchedPath = 'piano_playlist';
            else if (text === 'synthesizer') matchedPath = 'synthesizer_playlist';
            else if (text === 'wind') matchedPath = 'wind_playlist';
            else if (text === 'strings') matchedPath = 'strings_playlist';
            
            if (matchedPath && foundStems.has(matchedPath)) {
                let row = span.parentElement;
                
                // Climb up the react tree until we find the track's wrapper div.
                // Lalal track rows are usually generic divs, 2-4 levels up.
                for (let i = 0; i < 3; i++) {
                    if (row && row.parentElement) row = row.parentElement;
                }
                
                if (row && !row.querySelector('.lalal-magic-dl')) {
                    const btn = document.createElement('button');
                    btn.className = 'lalal-magic-dl';
                    btn.innerHTML = \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="#1B191C"/><path d="M4 18H20V20H4V18Z" fill="#1B191C"/></svg>\`;
                    
                    btn.style.cssText = \`
                        background: #F8D231;
                        border: none;
                        border-radius: 8px;
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                        transition: background 0.2s;
                        position: absolute;
                        right: -45px;
                        top: 50%;
                        transform: translateY(-50%);
                        z-index: 100;
                    \`;
                    
                    btn.onmouseenter = () => btn.style.background = "#FFDF4A";
                    btn.onmouseleave = () => btn.style.background = "#F8D231";
                    
                    btn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startDownload(foundStems.get(matchedPath), matchedPath, btn);
                    };
                    
                    row.style.position = 'relative';
                    row.appendChild(btn);
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    injectAutoDetector();

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'LALAL_AUTO_ID') {
            foundStems.set(event.data.path, event.data.id);
        }
    });

})();