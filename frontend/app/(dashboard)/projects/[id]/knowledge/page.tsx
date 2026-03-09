'use client';

import { useEffect, useState } from 'react';

import { KnowledgeGraph } from '@/components/knowledge/KnowledgeGraph';
import { NodeDetail } from '@/components/knowledge/NodeDetail';
import { getKnowledgeGraph } from '@/lib/api';
import { KnowledgeNode, KnowledgeRelation } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function KnowledgePage({ params }: PageProps) {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeRelation[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      try {
        const graph = await getKnowledgeGraph(params.id);
        setNodes(graph.nodes);
        setEdges(graph.edges);
      } finally {
        setLoading(false);
      }
    }

    loadGraph();
  }, [params.id]);

  return (
    <div className="space-y-4">
      <h2 className="page-title">Knowledge Graph</h2>
      {loading ? (
        <div className="card p-6 text-sm text-ink/60">图谱加载中...</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
          <KnowledgeGraph nodes={nodes} edges={edges} onNodeSelect={setSelectedNode} />
          <NodeDetail node={selectedNode} />
        </div>
      )}
    </div>
  );
}
