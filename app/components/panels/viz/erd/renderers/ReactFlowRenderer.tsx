/**
 * ReactFlowRenderer - ERD visualization using React Flow
 *
 * Renders ERDSchema as a structured node graph with draggable entities
 * and relationship edges.
 */

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { EntityNode, type EntityNodeData } from './EntityNode'
import { RelationshipEdge, type RelationshipEdgeData } from './RelationshipEdge'
import { layoutEntities, calculateNodeHeight, LAYOUT_CONSTANTS } from '../layout/erd-layout'
import type { ERDSchema } from '@/lib/services/erd/erd-types'

// Register custom node and edge types
const nodeTypes: NodeTypes = {
  entity: EntityNode,
}

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
}

interface ReactFlowRendererProps {
  schema: ERDSchema | null
}

/**
 * Convert ERDSchema to React Flow nodes and edges
 */
function schemaToFlow(schema: ERDSchema): { nodes: Node<EntityNodeData>[]; edges: Edge<RelationshipEdgeData>[] } {
  if (!schema || schema.entities.length === 0) {
    return { nodes: [], edges: [] }
  }

  // Get positions from shared layout
  const positions = layoutEntities(schema)

  // Create nodes
  const nodes: Node<EntityNodeData>[] = schema.entities.map((entity) => {
    const pos = positions.get(entity.id)
    const height = calculateNodeHeight(entity)

    return {
      id: entity.id,
      type: 'entity',
      position: {
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
      },
      data: { entity },
      style: {
        width: LAYOUT_CONSTANTS.NODE_WIDTH,
        height,
      },
    }
  })

  // Create edges from relationships
  const edges: Edge<RelationshipEdgeData>[] = schema.relationships.map((rel) => ({
    id: rel.id,
    source: rel.from.entity,
    target: rel.to.entity,
    type: 'relationship',
    data: {
      label: rel.label,
      fromCardinality: rel.from.cardinality,
      toCardinality: rel.to.cardinality,
    },
  }))

  return { nodes, edges }
}

export function ReactFlowRenderer({ schema }: ReactFlowRendererProps) {
  // Convert schema to React Flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => schemaToFlow(schema!),
     
    [schema?.entities.length, schema?.relationships.length, schema?.parsedAt]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes/edges when schema changes
  useMemo(() => {
    if (schema) {
      const { nodes: newNodes, edges: newEdges } = schemaToFlow(schema)
      setNodes(newNodes)
      setEdges(newEdges)
    }
     
  }, [schema?.parsedAt])

  // Fit view on initial load
  const onInit = useCallback((instance: { fitView: () => void }) => {
    // Small delay to ensure nodes are rendered
    setTimeout(() => {
      instance.fitView()
    }, 100)
  }, [])

  if (!schema || schema.entities.length === 0) {
    return (
      <div className="erd-renderer erd-reactflow-renderer erd-empty">
        <p>No entities to display</p>
      </div>
    )
  }

  return (
    <div className="erd-renderer erd-reactflow-renderer">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'relationship',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const entity = (node.data as EntityNodeData)?.entity
            if (!entity) return 'var(--bg-tertiary)'
            // Color by number of relationships (more = darker)
            const relCount = entity.attributes.filter((a) => a.constraints.includes('FK')).length
            if (relCount >= 3) return 'var(--accent)'
            if (relCount >= 1) return 'var(--accent-secondary)'
            return 'var(--bg-tertiary)'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}

export default ReactFlowRenderer
