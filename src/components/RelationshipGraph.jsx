import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import { RELATIONSHIP_TYPES } from '../utils/constants';

export const RelationshipGraph = ({ guests, relationships, onAddRelationship, onRemoveRelationship }) => {
  const graphRef = useRef();
  const containerRef = useRef();

  const graphData = {
    nodes: guests.map(guest => ({
      id: guest.id,
      name: guest.name,
      val: 1
    })),
    links: relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      color: '#D3A6B8',
      type: rel.type || RELATIONSHIP_TYPES.FRIEND.value,
      label: `${guests.find(g => g.id === rel.source)?.name} ↔ ${guests.find(g => g.id === rel.target)?.name}`
    }))
  };

  const handleNodeClick = useCallback((node) => {
    if (!graphRef.current.selectedNode) {
      graphRef.current.selectedNode = node;
      node.__selected = true;
    } else {
      const firstNode = graphRef.current.selectedNode;
      const secondNode = node;
      
      if (firstNode.id !== secondNode.id) {
        // Check if relationship already exists
        const existingRelationship = relationships.find(
          rel => (rel.source === firstNode.id && rel.target === secondNode.id) ||
                (rel.source === secondNode.id && rel.target === firstNode.id)
        );

        if (existingRelationship) {
          onRemoveRelationship(firstNode.id, secondNode.id);
        } else {
          // Show relationship type selector
          const relationshipType = window.prompt(
            'Select relationship type:\n0: Significant Other\n1: Close Friend\n2: Family\n3: Friend\n4: Acquaintance',
            '3'
          );
          
          let type;
          switch (relationshipType) {
            case '0':
              type = RELATIONSHIP_TYPES.SIGNIFICANT_OTHER.value;
              break;
            case '1':
              type = RELATIONSHIP_TYPES.CLOSE_FRIEND.value;
              break;
            case '2':
              type = RELATIONSHIP_TYPES.FAMILY.value;
              break;
            case '3':
              type = RELATIONSHIP_TYPES.FRIEND.value;
              break;
            case '4':
              type = RELATIONSHIP_TYPES.ACQUAINTANCE.value;
              break;
            default:
              type = RELATIONSHIP_TYPES.FRIEND.value;
          }

          onAddRelationship(firstNode.id, secondNode.id, type);
        }
      }
      
      firstNode.__selected = false;
      graphRef.current.selectedNode = null;
    }
    
    graphRef.current.refresh();
  }, [onAddRelationship, onRemoveRelationship, relationships]);

  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;
      
      // Configure forces for better layout
      fg.d3Force('charge').strength(-300);
      fg.d3Force('link').distance(100);
      fg.d3Force('center', d3.forceCenter());

      // Center on first render
      setTimeout(() => {
        if (guests.length > 0) {
          fg.zoomToFit(400, 50);
        }
      }, 250);
    }
  }, [guests, relationships]);

  return (
    <div ref={containerRef} className="relative h-[400px] border rounded-lg overflow-hidden bg-white">
      <div className="absolute top-2 left-2 right-2 text-sm text-[#4A3B52] bg-white/90 p-2 rounded-lg shadow-sm border border-[#D3A6B8]/20 z-10">
        Click on two guests to create or remove a connection between them. Connected guests will be seated together when possible.
      </div>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={node => node.__selected ? '#D3A6B8' : '#4A3B52'}
        linkColor="color"
        onNodeClick={handleNodeClick}
        nodeRelSize={6}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        cooldownTicks={50}
        enableZoom={true}
        enablePanAndZoom={true}
        linkLabel="label"
        width={containerRef.current?.clientWidth || 800}
        height={containerRef.current?.clientHeight || 400}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={(link, ctx) => {
          const start = link.source;
          const end = link.target;
          const textPos = Object.assign({}, start);
          textPos.x = start.x + (end.x - start.x) * 0.5;
          textPos.y = start.y + (end.y - start.y) * 0.5;

          ctx.font = '10px Arial';
          ctx.fillStyle = '#4A3B52';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(link.label, textPos.x, textPos.y);
        }}
      />
    </div>
  );
};