import React, { useEffect, useRef } from "react";
// import { EditorState, Compartment } from "@codemirror/state";
// import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { basicSetup } from "codemirror";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { HighlightStyle, indentUnit, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { defaultKeymap, indentWithTab, insertTab } from "@codemirror/commands";

// 🎨 Define syntax highlighting rules
const myHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: "#484349", fontWeight: "bold" }, // DATA, LOGIC
    { tag: t.typeName, color: "#708B75", fontWeight: 'bold' }, 
    { tag: t.strong, color: "#708B75", fontWeight: 'bold' }, // Commands
    { tag: t.string, color: "#30BCED", fontWeight: 'bold'  }, // State names
    { tag: t.typeName, color: "#708B75", fontWeight: 'bold' }, // STACK, QUEUE, etc.
    { tag: t.operator, color: "#484349" }, // Comma, brackets
    { tag: t.comment, color: "#48434988", fontWeight: 'light' }, // Comments
]);
const myTheme = EditorView.theme({
    "&": { 
        backgroundColor: "white", 
        color: "#f8f8f2",
        fontFamily: 'Fira Code'
    },
    '.cm-gutters':  {
        backgroundColor: 'white',
        // color: '#6272a4', /* Change line number color */
        // borderRight: '1px solid #444', /* Optional: Add a subtle border */
        
    },
    '.cm-lineNumbers':  {
        fontSize: '0.8rem', /* Adjust font size */
        fontWeight: 'light',
        color: '#48434955', /* Pink line numbers */
    },
    ".cm-content": { 
        //     caretColor: "#ff79c6" 
        fontFamily: 'Fira Code',
        color: '#484349'
    },
    ".cm-selectionBackground": { 
        backgroundColor: "#48434910" 
    },
    ".cm-activeLine": { 
        backgroundColor: "#48434910" 
    },
});


const machineDefiniionLanguage = StreamLanguage.define({
    languageData: {
        commentTokens: { line: ";" },
    },
    token: (stream) => {
        if (stream.match(/\.DATA|\.LOGIC\b/)) return "keyword";
        if (stream.match(/\b(STACK|QUEUE|TAPE|2D_TAPE)\b/)) return "typeName";
        if (stream.match(/\b(SCAN\s*(LEFT|RIGHT)?|LEFT|RIGHT|PRINT|WRITE|READ|UP|DOWN)\b/)) return "strong";
        if (stream.match(/\([\w#/]+\s*,\s*[\w#]+\)/)) return "operator";
        if (stream.match(/;[^\n]*/)) return "comment";
        if (stream.match(/\b\w+\]/)) return "string"; // State names
        if (stream.match(/[\[\],()]/)) return "operator";
        stream.next();
        return null;
    },

})

// 📝 Define regex-based syntax highlighting

// const myLanguage = EditorState.language.of({
//         languageData: {
//             commentTokens: { line: ";" },
//         },
//         token: (stream) => {
//             if (stream.match(/\.DATA|\.LOGIC\b/)) return "keyword";
//             if (stream.match(/\b(STACK|QUEUE|TAPE|2D_TAPE)\b/)) return "typeName";
//             if (stream.match(/\b(SCAN\s*(LEFT|RIGHT)?|LEFT|RIGHT|PRINT|WRITE|READ|UP|DOWN)\b/)) return "strong";
//             if (stream.match(/\([\w#/]+\s*,\s*[\w#]+\)/)) return "operator";
//             if (stream.match(/;[^\n]*/)) return "comment";
//             if (stream.match(/\b\w+\]/)) return "string"; // State names
//             if (stream.match(/[\[\],()]/)) return "operator";
//             stream.next();
//             return null;
//         },

// })
// of({
//     languageData: {
//         commentTokens: { line: ";" },
//     },
//     token: (stream) => {
//         if (stream.match(/\.DATA|\.LOGIC\b/)) return "keyword";
//         if (stream.match(/\b(STACK|QUEUE|TAPE|2D_TAPE)\b/)) return "typeName";
//         if (stream.match(/\b(SCAN\s*(LEFT|RIGHT)?|LEFT|RIGHT|PRINT|WRITE|READ|UP|DOWN)\b/)) return "strong";
//         if (stream.match(/\([\w#/]+\s*,\s*[\w#]+\)/)) return "operator";
//         if (stream.match(/;[^\n]*/)) return "comment";
//         if (stream.match(/\b\w+\]/)) return "string"; // State names
//         if (stream.match(/[\[\],()]/)) return "operator";
//         stream.next();
//         return null;
//     },
// });

export default function MachineEditor({ value, onChange }) {
    const editorRef = useRef(null);
    const editorViewRef = useRef(null);
    // const hexLineNumbers = lineNumbers({
    //     formatNumber: n => n.toString(16)
    // });

    useEffect(() => {
        if (editorRef.current && !editorViewRef.current) {
            const state = EditorState.create({
                doc: value,
                extensions: [
                    basicSetup,
                    machineDefiniionLanguage,
                    syntaxHighlighting(myHighlightStyle),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            onChange(update.state.doc.toString());
                        }
                    }),
                    myTheme,
                    // ✅ Enables Tab key indentation
                    keymap.of([
                        {
                            key: "Tab",
                            preventDefault: true, // ✅ Stops focus from leaving the editor
                            run: insertTab,
                        }, // Allows pressing Tab to insert indentation
                        ...defaultKeymap, // Retains default shortcuts
                    ]),
                ],
            });

            editorViewRef.current = new EditorView({
                state,
                parent: editorRef.current,
            });
        }
    }, []);

    return <div style={{
        textAlign: 'left',
        fontFamily: 'Fira Code'
    }} ref={editorRef} className="editor-container"></div>;
}
