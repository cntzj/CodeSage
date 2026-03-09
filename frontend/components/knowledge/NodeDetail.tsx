import { KnowledgeNode } from '@/types';

export function NodeDetail({ node }: { node: KnowledgeNode | null }) {
  return (
    <aside className="card p-4">
      <h3 className="text-lg font-semibold">节点详情</h3>
      {!node ? (
        <p className="mt-2 text-sm text-ink/60">点击图谱节点查看详情。</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="font-medium">名称：</span>
            {node.name}
          </p>
          <p>
            <span className="font-medium">类型：</span>
            {node.nodeType}
          </p>
          <p>
            <span className="font-medium">文件：</span>
            {node.filePath}
          </p>
          <p>
            <span className="font-medium">范围：</span>
            {node.lineStart} - {node.lineEnd}
          </p>
          <p>
            <span className="font-medium">描述：</span>
            {node.description}
          </p>
        </div>
      )}
    </aside>
  );
}
