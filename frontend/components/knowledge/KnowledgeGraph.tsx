'use client';

import { useEffect, useMemo, useRef } from 'react';
import cytoscape from 'cytoscape';

import { KnowledgeNode, KnowledgeRelation } from '@/types';

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeRelation[];
  onNodeSelect: (node: KnowledgeNode | null) => void;
}

export function KnowledgeGraph({ nodes, edges, onNodeSelect }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const graphElements = useMemo(() => {
    const nodeElements = nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.name,
        nodeType: node.nodeType,
      },
    }));

    const edgeElements = edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.relationType,
      },
    }));

    return [...nodeElements, ...edgeElements];
  }, [nodes, edges]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: graphElements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': '#2f5f5c',
            color: '#11213a',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': 2,
            'font-size': 10,
            width: 30,
            height: 30,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.2,
            'line-color': '#93aaa0',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#93aaa0',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
      },
    });

    cy.on('tap', 'node', (event) => {
      const target = event.target;
      const node = nodes.find((item) => item.id === target.id()) ?? null;
      onNodeSelect(node);
    });

    return () => {
      cy.destroy();
    };
  }, [graphElements, nodes, onNodeSelect]);

  return <div ref={containerRef} className="h-[560px] w-full rounded-xl border border-ink/15 bg-white/60" />;
}
