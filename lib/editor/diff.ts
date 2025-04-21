import { Fragment } from 'prosemirror-model';
import type { Schema, Node } from 'prosemirror-model';
import { diff_match_patch } from 'diff-match-patch';

export enum DiffType {
  Deleted = 'deleted',
  Inserted = 'inserted',
  Unchanged = 'unchanged'
}

export function compareNodes(oldNode: Node, newNode: Node): DiffType {
  if (!oldNode && !newNode) return DiffType.Unchanged;
  if (!oldNode) return DiffType.Inserted;
  if (!newNode) return DiffType.Deleted;
  return nodesEqual(oldNode, newNode) ? DiffType.Unchanged : DiffType.Deleted;
}

export function nodesEqual(node1: Node, node2: Node): boolean {
  if (node1.type !== node2.type) return false;
  if (node1.text !== node2.text) return false;
  
  const content1 = node1.content?.content || [];
  const content2 = node2.content?.content || [];
  
  if (content1.length !== content2.length) return false;
  
  return content1.every((child, i) => nodesEqual(child, content2[i]));
}

export function diffEditor(oldDoc: Node, newDoc: Node, schema: Schema): Node {
  const oldContent = normalizeContent(oldDoc);
  const newContent = normalizeContent(newDoc);
  
  const diffResult = compareContent(oldContent, newContent);
  
  return patchDocument(oldDoc, diffResult, schema);
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
      result.push(DiffType.Inserted);
      newIndex++;
      continue;
    }
    
    if (newIndex >= newContent.length) {
      result.push(DiffType.Deleted);
      oldIndex++;
      continue;
    }
    
    const oldNode = oldContent[oldIndex];
    const newNode = newContent[newIndex];
    
    if (nodesEqual(oldNode, newNode)) {
      result.push(DiffType.Unchanged);
      oldIndex++;
      newIndex++;
    } else {
      result.push(DiffType.Deleted);
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
    if (diffType === DiffType.Unchanged) {
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