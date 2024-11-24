import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph';
import { useCallback } from 'react';

export const RelationshipGraph = ({ guests, relationships, onAddRelationship }) => {
  const graphRef = useRef();

  const graphData = {
    nodes: guests.map(guest => ({
      id: guest.id,
      name: guest.name,
      val: 1
    })),
    links: relationships.map(rel => ({
      source: rel.source,
      target: rel.target
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
        onAddRelationship(firstNode.id, secondNode.id);
      }
      
      firstNode.__selected = false;
      graphRef.current.selectedNode = null;
    }
    
    graphRef.current.refresh();
  }, [onAddRelationship]);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-200);
      graphRef.current.d3Force('link').distance(100);
    }
  }, []);

  return (
    <div className="h-[400px] border rounded-lg overflow-hidden bg-white">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={node => node.__selected ? '#D3A6B8' : '#4A3B52'}
        linkColor={() => '#E5C594'}
        onNodeClick={handleNodeClick}
        nodeRelSize={6}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
      />
    </div>
  );
};