import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export const RelationshipGraph = ({ guests, relationships, onAddRelationship, onRemoveRelationship }) => {
  const graphRef = useRef();

  const graphData = {
    nodes: guests.map(guest => ({
      id: guest.id,
      name: guest.name,
      val: 1
    })),
    links: relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      color: '#D3A6B8'
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
          onAddRelationship(firstNode.id, secondNode.id);
        }
      }
      
      firstNode.__selected = false;
      graphRef.current.selectedNode = null;
    }
    
    graphRef.current.refresh();
  }, [onAddRelationship, onRemoveRelationship, relationships]);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-200);
      graphRef.current.d3Force('link').distance(100);
    }
  }, []);

  return (
    <div className="relative h-[400px] border rounded-lg overflow-hidden bg-white">
      <div className="absolute top-2 left-2 right-2 text-sm text-[#4A3B52] bg-white/90 p-2 rounded-lg shadow-sm border border-[#D3A6B8]/20">
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
        d3VelocityDecay={0.1}
      />
    </div>
  );
};
