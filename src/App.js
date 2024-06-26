// src/DraftEditor.js
import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
  getDefaultKeyBinding
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./styles.css";


  // Custom Style Map
  const styleMap = {
    RED: {
      color: "red",
    },
    UNDERLINE: {
      textDecoration: "underline",
    },
  };


const DraftEditor = () => {
  // Editor State Initialization
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  // Load Saved Content on Mount
  // Checks localStorage for saved content and loads it if available.
  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      setEditorState(
        EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      );
    }
  }, []);

  // Handle Key Commands
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  // Custom Input Handling
  // Detects special input patterns and applies corresponding formatting
  const handleBeforeInput = (input, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const startOffset = selectionState.getStartOffset();
    const block = contentState.getBlockForKey(startKey);
    const blockText = block.getText();
    const newBlockText = blockText + input;

    if (newBlockText.startsWith("# ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selectionState.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        ""
      );
      const newState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(RichUtils.toggleBlockType(newState, "header-one"));
      return "handled";
    }

    if (newBlockText.startsWith("* ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selectionState.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        ""
      );
      const newState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(RichUtils.toggleInlineStyle(newState, "BOLD"));
      return "handled";
    }

    if (newBlockText.startsWith("** ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selectionState.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        ""
      );
      const newState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(RichUtils.toggleInlineStyle(newState, "RED"));
      return "handled";
    }

    if (newBlockText.startsWith("*** ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selectionState.merge({
          anchorOffset: 0,
          focusOffset: 4,
        }),
        ""
      );
      const newState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(RichUtils.toggleInlineStyle(newState, "UNDERLINE"));
      return "handled";
    }

    if (newBlockText.startsWith("``` ")) {
      const newContentState = Modifier.replaceText(
        contentState,
        selectionState.merge({
          anchorOffset: 0,
          focusOffset: 6,
        }),
        ""
      );
      const newState = EditorState.push(
        editorState,
        newContentState,
        "remove-range"
      );
      setEditorState(RichUtils.toggleBlockType(newState, "code-block"));
      return "handled";
    }

    return "not-handled";
  };

  //Save Content 
  // Saves the current editor content to localStorage
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    localStorage.setItem("editorContent", JSON.stringify(rawContentState));
    alert("Content saved!");
  };

  const keyBindingFn = (e) => {
    if (e.keyCode === 32) { // Checks if the space key is pressed (keyCode === 32).
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const startKey = selectionState.getStartKey();
      const block = contentState.getBlockForKey(startKey);
      const blockText = block.getText();
 
      if (blockText === '#' || blockText === '*' || blockText === '**' || blockText === '***' || blockText === '```') {
        handleBeforeInput(' ', editorState);
        return null;
      }
    }

    return getDefaultKeyBinding(e);
  };

  return (
    <div className="editor-container">

      <h2>Text Editor with DraftJs</h2>
      <div className="editor">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          onChange={setEditorState}
          keyBindingFn={keyBindingFn}
          customStyleMap={styleMap}
          placeholder="Start typing..."
        />
      </div>
      <button onClick={saveContent} className="save-button">
        Save
      </button>
      <h1>Instructions</h1>
      <ul className="instructions">
        <li>
          h1 - Type <code>#</code> as the first string in a line & press space
          for “Heading 1” format.
        </li>
        <li>
          <strong>“bold”</strong> - Type <code>*</code> as the first string in a
          line and press space should correspond to “bold” format
        </li>
        <li>
          <span style={{ color: "red" }}>Red text</span> - Type <code>**</code>
          as the first string in a line and press space and space = red line
        </li>
        <li>
          <span style={{ textDecoration: "underline" }}> Underline</span> - Type 
          <code>***</code> as the first string in a line and press space and
          space = underline
        </li>
        <li> <span>Code Block</span> - 
          Type <code>```</code> as the first string in a line and press space to
          use Code-block
        </li>
      </ul>
    </div>
  );
};

export default DraftEditor;
