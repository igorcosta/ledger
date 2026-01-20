/**
 * D3ForceRenderer - Code Graph visualization using D3 force simulation
 *
 * Renders CodeGraphSchema as a force-directed network graph where
 * nodes cluster naturally based on their connections.
 */

import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import type { CodeGraphSchema, CodeNode, CodeNodeKind, CodeEdgeKind } from '@/app/types/electron'

interface D3ForceRendererProps {
  schema: CodeGraphSchema | null
}

// D3 node with position
interface D3Node extends d3.SimulationNodeDatum {
  id: string
  data: CodeNode
}

// D3 link
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string
  kind: CodeEdgeKind
  resolved: boolean
}

/**
 * Get color for node based on category (for Laravel/Rails) or kind
 */
function getNodeColor(node: CodeNode): string {
  // Check for category first (Laravel: model/controller/service)
  const category = (node as unknown as { category?: string }).category
  if (category) {
    switch (category) {
      case 'model':
        return '#10b981' // green - data/models
      case 'controller':
        return '#3b82f6' // blue - controllers
      case 'service':
        return '#f59e0b' // amber - services
    }
  }
  
  // Fall back to kind-based coloring
  switch (node.kind) {
    case 'file':
      return '#6b7280'
    case 'class':
      return '#3b82f6'
    case 'interface':
      return '#8b5cf6'
    case 'function':
      return '#10b981'
    case 'module':
      return '#f59e0b'
    case 'trait':
      return '#ec4899'
    case 'enum':
      return '#06b6d4'
    default:
      return '#9ca3af'
  }
}

/**
 * Get color for edge kind
 */
function getEdgeColor(kind: CodeEdgeKind): string {
  switch (kind) {
    case 'imports':
      return '#9ca3af'
    case 'extends':
      return '#3b82f6'
    case 'implements':
      return '#8b5cf6'
    case 'includes':
      return '#f59e0b'
    case 'exports':
      return '#10b981'
    default:
      return '#d1d5db'
  }
}

/**
 * Get node radius based on kind
 */
function getNodeRadius(kind: CodeNodeKind): number {
  switch (kind) {
    case 'file':
      return 6
    case 'class':
      return 10
    case 'interface':
      return 8
    case 'function':
      return 6
    case 'module':
      return 12
    case 'trait':
      return 7
    default:
      return 5
  }
}

export function D3ForceRenderer({ schema }: D3ForceRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Render the graph
  const renderGraph = useCallback(() => {
    if (!containerRef.current || !schema || schema.nodes.length === 0) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Clear previous SVG
    d3.select(container).selectAll('svg').remove()

    // Create SVG
    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('class', 'codegraph-d3-svg')

    svgRef.current = svg.node()

    // Create a group for zoom/pan
    const g = svg.append('g')

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Create node map for link resolution
    const nodeMap = new Map<string, D3Node>()

    // Convert nodes
    const d3Nodes: D3Node[] = schema.nodes.map((node) => {
      const d3Node: D3Node = {
        id: node.id,
        data: node,
      }
      nodeMap.set(node.id, d3Node)
      return d3Node
    })

    // Convert edges (only where both source and target exist)
    const d3Links: D3Link[] = schema.edges
      .filter((edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target))
      .map((edge) => ({
        id: edge.id,
        source: nodeMap.get(edge.source)!,
        target: nodeMap.get(edge.target)!,
        kind: edge.kind,
        resolved: edge.resolved,
      }))

    // Create force simulation with landscape oval layout
    // Weaker X centering allows horizontal spread, stronger Y keeps it compact vertically
    const simulation = d3
      .forceSimulation<D3Node>(d3Nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(d3Links)
          .id((d) => d.id)
          .distance(120)
          .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-400).distanceMax(500))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.08))
      .force('collision', d3.forceCollide().radius(25))

    // Create arrow markers
    const defs = svg.append('defs')

    const edgeKinds: CodeEdgeKind[] = ['imports', 'extends', 'implements', 'includes', 'exports']
    edgeKinds.forEach((kind) => {
      defs
        .append('marker')
        .attr('id', `arrow-${kind}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', getEdgeColor(kind))
    })

    // Create links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(d3Links)
      .join('line')
      .attr('stroke', (d) => getEdgeColor(d.kind))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => (d.kind === 'implements' ? '5,5' : null))
      .attr('marker-end', (d) => `url(#arrow-${d.kind})`)

    // Create nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(d3Nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    // Add circles to nodes
    node
      .append('circle')
      .attr('r', (d) => getNodeRadius(d.data.kind))
      .attr('fill', (d) => getNodeColor(d.data))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)

    // Add labels
    node
      .append('text')
      .text((d) => d.data.name)
      .attr('x', (d) => getNodeRadius(d.data.kind) + 4)
      .attr('y', 4)
      .attr('font-size', 10)
      .attr('fill', 'var(--text-primary)')
      .attr('class', 'codegraph-d3-label')

    // Add title for hover
    node.append('title').text((d) => `${d.data.kind}: ${d.data.name}\n${d.data.filePath}`)

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as D3Node).x ?? 0)
        .attr('y1', (d) => (d.source as D3Node).y ?? 0)
        .attr('x2', (d) => (d.target as D3Node).x ?? 0)
        .attr('y2', (d) => (d.target as D3Node).y ?? 0)

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    // Initial zoom to fit
    setTimeout(() => {
      const bounds = g.node()?.getBBox()
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        const fullWidth = width
        const fullHeight = height
        const midX = bounds.x + bounds.width / 2
        const midY = bounds.y + bounds.height / 2
        const scale = 0.8 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight)
        const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY]

        svg
          .transition()
          .duration(500)
          .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
      }
    }, 500)

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [schema])

  // Render on mount and schema change
  useEffect(() => {
    const cleanup = renderGraph()
    return cleanup
  }, [renderGraph])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      renderGraph()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [renderGraph])

  if (!schema || schema.nodes.length === 0) {
    return (
      <div className="codegraph-renderer codegraph-d3-renderer codegraph-empty">
        <p>No nodes to display</p>
      </div>
    )
  }

  return <div ref={containerRef} className="codegraph-renderer codegraph-d3-renderer" />
}

export default D3ForceRenderer
