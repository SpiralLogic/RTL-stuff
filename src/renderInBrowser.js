import { exec } from 'child_process';
import http from 'http';

const executeAtCommandLine = () => {
    switch (process.platform) {
        case 'darwin':
            return 'open';
        case 'win32':
            return 'start';
        default:
            return 'xdg-open';
    }
};

function addCharsetToDocument(doc) {
    const meta = doc.createElement('meta');
    meta.setAttribute('charset', 'UTF-8');
    doc.head.appendChild(meta);
}

function populateFormValues(doc) {
    const inputFields = doc.querySelectorAll('input');
    Array.from(inputFields).forEach(e => e.setAttribute('value', e.value));
}

function reorderStyles(doc) {
    Array.from(doc.querySelectorAll('[data-styled]')).forEach(e => doc.head.append(e));
    doc.body.classList.add('app');
}

/**
 * This is a helper method that can render the component under test in its current form and open it in the browser.
 * this lets you see and also inspect the DOM to understand what you have and what you are looking for.
 * It will render with any JS, only styles so that there are no side effects on it's state
 *
 * This should help devs in finding the best way to query the element they are looking for
 * and show them quickly if and where the element has been rendered.
 *
 * example:
 * it(`does something`, () => {
 *   render(<Component {...props}>);
 *
 *   renderInBrowser(); <--- browser will open and serve the current component render
 *
 *   expect(...) ...
 * }
 *
 */
global.renderInBrowser = () => {
    if (document === undefined)
        throw Error(
            'No current global document, call this method after react testing library has rendered in a test'
        );
    const doc = document.cloneNode(true);

    addCharsetToDocument(doc);
    reorderStyles(doc);
    populateFormValues(doc);

    const html = doc.documentElement.outerHTML;
    const server = http
        .createServer((req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': html.length,
                Expires: new Date().toUTCString(),
            });
            res.end(html);
            res.destroy();
            server.close();
        })
        .listen(5705);

    exec(`${executeAtCommandLine()} http://localhost:5705`);
};
