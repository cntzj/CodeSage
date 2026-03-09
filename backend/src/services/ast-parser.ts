import { parseForESLint } from '@typescript-eslint/parser';

export interface ParsedCode {
  functions: Array<{
    name: string;
    params: string[];
    returnType?: string;
    startLine: number;
    endLine: number;
  }>;
  classes: Array<{
    name: string;
    methods: string[];
    properties: string[];
    startLine: number;
    endLine: number;
  }>;
  imports: string[];
  exports: string[];
}

function asNode(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function walk(node: unknown, visitor: (node: Record<string, unknown>) => void): void {
  const typedNode = asNode(node);
  if (!typedNode) {
    return;
  }

  visitor(typedNode);

  for (const value of Object.values(typedNode)) {
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, visitor));
    } else {
      walk(value, visitor);
    }
  }
}

export class ASTParserService {
  parseCode(code: string): ParsedCode {
    const parsedResult = parseForESLint(code, {
      loc: true,
      ecmaVersion: 'latest',
      sourceType: 'module',
    }) as { ast: Record<string, unknown> };
    const ast = parsedResult.ast;

    const parsed: ParsedCode = {
      functions: [],
      classes: [],
      imports: [],
      exports: [],
    };

    walk(ast, (node) => {
      const type = node.type;
      if (type === 'FunctionDeclaration') {
        const id = asNode(node.id);
        const params = Array.isArray(node.params)
          ? node.params.map((p) => {
              const param = asNode(p);
              if (!param) {
                return 'unknown';
              }
              const nameNode = asNode(param.left);
              return String(param.name ?? nameNode?.name ?? 'unknown');
            })
          : [];

        const loc = asNode(node.loc);
        const start = asNode(loc?.start);
        const end = asNode(loc?.end);

        parsed.functions.push({
          name: String(id?.name ?? 'anonymous'),
          params,
          returnType: undefined,
          startLine: Number(start?.line ?? 0),
          endLine: Number(end?.line ?? 0),
        });
      }

      if (type === 'ClassDeclaration') {
        const body = asNode(node.body);
        const bodyItems = Array.isArray(body?.body) ? body.body : [];

        const methods = bodyItems
          .filter((item) => asNode(item)?.type === 'MethodDefinition')
          .map((item) => {
            const key = asNode(asNode(item)?.key);
            return String(key?.name ?? 'method');
          });

        const properties = bodyItems
          .filter((item) => asNode(item)?.type === 'PropertyDefinition')
          .map((item) => {
            const key = asNode(asNode(item)?.key);
            return String(key?.name ?? 'property');
          });

        const id = asNode(node.id);
        const loc = asNode(node.loc);
        const start = asNode(loc?.start);
        const end = asNode(loc?.end);

        parsed.classes.push({
          name: String(id?.name ?? 'AnonymousClass'),
          methods,
          properties,
          startLine: Number(start?.line ?? 0),
          endLine: Number(end?.line ?? 0),
        });
      }

      if (type === 'ImportDeclaration') {
        parsed.imports.push(String(node.source && asNode(node.source)?.value));
      }

      if (type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration') {
        const declaration = asNode(node.declaration);
        if (declaration?.id) {
          parsed.exports.push(String(asNode(declaration.id)?.name ?? 'default'));
        } else {
          parsed.exports.push('default');
        }
      }
    });

    return parsed;
  }
}

export const astParserService = new ASTParserService();
