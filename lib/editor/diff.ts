import { Fragment } from 'prosemirror-model';
import type { Schema, Node } from 'prosemirror-model';
import { diff_match_patch } from 'diff-match-patch';

export enum DiffType {
  None = "none",
  Added = "added",
  Removed = "removed",
  Changed = "changed",
}

export function compareNodes(oldNode: Node, newNode: Node): DiffType {
  if (oldNode.type !== newNode.type) return DiffType.Changed;
  if (oldNode.isText && newNode.isText) {
    return oldNode.text === newNode.text ? DiffType.None : DiffType.Changed;
  }
  if (oldNode.content.size !== newNode.content.size) return DiffType.Changed;

  let hasChanges = false;
  oldNode.content.forEach((oldChild, _, i) => {
    const newChild = newNode.content.child(i);
    const childDiff = compareNodes(oldChild, newChild);
    if (childDiff !== DiffType.None) hasChanges = true;
  });

  return hasChanges ? DiffType.Changed : DiffType.None;
}

export function nodesEqual(node1: Node, node2: Node): boolean {
  if (node1.type !== node2.type) return false;
  if (node1.text !== node2.text) return false;
  
  const content1 = node1.content?.content || [];
  const content2 = node2.content?.content || [];
  
  if (content1.length !== content2.length) return false;
  
  return content1.every((child, i) => nodesEqual(child, content2[i]));
}

export function diffEditor(schema: Schema, oldDocJson: any, newDocJson: any): Node {
  const oldDoc = schema.nodeFromJSON(oldDocJson);
  const newDoc = schema.nodeFromJSON(newDocJson);
  
  const diffContent: Node[] = [];

  // Helper to create a node with a specific diff mark
  const markNode = (node: Node, type: DiffType): Node => {
    if (type === DiffType.None) return node;
    return node.mark([schema.marks.diffMark.create({ type })]);
  };

  // Process content
  const oldSize = oldDoc.content.size;
  const newSize = newDoc.content.size;
  const maxSize = Math.max(oldSize, newSize);

  for (let i = 0; i < maxSize; i++) {
    if (i >= oldSize) {
      // Added content
      diffContent.push(markNode(newDoc.content.child(i), DiffType.Added));
    } else if (i >= newSize) {
      // Removed content
      diffContent.push(markNode(oldDoc.content.child(i), DiffType.Removed));
    } else {
      const oldNode = oldDoc.content.child(i);
      const newNode = newDoc.content.child(i);
      const diffType = compareNodes(oldNode, newNode);

      if (diffType === DiffType.None) {
        diffContent.push(oldNode);
      } else {
        diffContent.push(markNode(newNode, diffType));
      }
    }
  }

  return schema.node(oldDoc.type, oldDoc.attrs, Fragment.from(diffContent));
}

function normalizeContent(doc: Node): Node[] {
  const result: Node[] = [];
  let textBuffer = '';
  
  doc.content?.forEach((node: Node) => {
    if (node.isText) {
      textBuffer += node.text || '';
    } else {
      if (textBuffer) {
        result.push(createNodeFromText(textBuffer, doc.type.schema));
        textBuffer = '';
      }
      result.push(node);
    }
  });
  
  if (textBuffer) {
    result.push(createNodeFromText(textBuffer, doc.type.schema));
  }
  
  return result;
}

function createNodeFromText(text: string, schema: Schema): Node {
  return schema.text(text);
}

function compareContent(oldContent: Node[], newContent: Node[]): DiffType[] {
  const result: DiffType[] = [];
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldContent.length || newIndex < newContent.length) {
    if (oldIndex >= oldContent.length) {
      result.push(DiffType.Added);
      newIndex++;
      continue;
    }
    
    if (newIndex >= newContent.length) {
      result.push(DiffType.Removed);
      oldIndex++;
      continue;
    }
    
    const oldNode = oldContent[oldIndex];
    const newNode = newContent[newIndex];
    
    if (nodesEqual(oldNode, newNode)) {
      result.push(DiffType.None);
      oldIndex++;
      newIndex++;
    } else {
      result.push(DiffType.Changed);
      oldIndex++;
    }
  }
  
  return result;
}

function patchDocument(doc: Node, diffResult: DiffType[], schema: Schema): Node {
  const content = doc.content?.content || [];
  const newContent: Node[] = [];
  
  content.forEach((node: Node, index: number) => {
    const diffType = diffResult[index];
    if (diffType === DiffType.None) {
      newContent.push(node);
    } else {
      const mark = schema.marks.diffMark.create({ type: diffType });
      if (node.isText) {
        newContent.push(schema.text(node.text || '', [mark]));
      } else {
        newContent.push(node.mark([mark]));
      }
    }
  });
  
  return doc.type.create(doc.attrs, Fragment.from(newContent));
}

export function patchTextNodes(schema: Schema, oldNodes: Node[], newNodes: Node[]): Node[] {
  if (oldNodes.length === 0) return newNodes;
  if (newNodes.length === 0) return [];

  const result: Node[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldNodes.length && newIndex < newNodes.length) {
    const oldNode = oldNodes[oldIndex];
    const newNode = newNodes[newIndex];

    if (nodesEqual(oldNode, newNode)) {
      result.push(newNode);
      oldIndex++;
      newIndex++;
    } else {
      result.push(newNode);
      newIndex++;
    }
  }

  // Add remaining new nodes
  while (newIndex < newNodes.length) {
    result.push(newNodes[newIndex]);
    newIndex++;
  }

  return result;
}