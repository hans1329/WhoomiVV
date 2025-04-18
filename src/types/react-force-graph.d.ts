declare module 'react-force-graph-3d' {
  import React from 'react';
  
  interface ForceGraph3DProps {
    graphData: {
      nodes: Array<any>;
      links: Array<any>;
    };
    width?: number;
    height?: number;
    backgroundColor?: string;
    nodeColor?: string | ((node: any) => string);
    nodeLabel?: string | ((node: any) => string);
    nodeVal?: number | ((node: any) => number);
    nodeRelSize?: number;
    nodeOpacity?: number;
    nodeResolution?: number;
    nodeThreeObject?: null | ((node: any) => any);
    linkColor?: string | ((link: any) => string);
    linkWidth?: number | ((link: any) => number);
    linkOpacity?: number | ((link: any) => number);
    linkLabel?: string | ((link: any) => string);
    linkCurvature?: number | string | ((link: any) => number);
    linkDirectionalArrowLength?: number | ((link: any) => number);
    linkDirectionalArrowRelPos?: number | ((link: any) => number);
    linkDirectionalParticles?: number | ((link: any) => number);
    linkDirectionalParticleSpeed?: number | ((link: any) => number);
    linkDirectionalParticleWidth?: number | ((link: any) => number);
    onNodeClick?: (node: any, event: MouseEvent) => void;
    onNodeHover?: (node: any | null, previousNode: any | null) => void;
    onLinkClick?: (link: any, event: MouseEvent) => void;
    onLinkHover?: (link: any | null, previousLink: any | null) => void;
    cooldownTicks?: number;
    cameraPosition?: { x: number; y: number; z: number };
  }
  
  class ForceGraph3D extends React.Component<ForceGraph3DProps> {
    cameraPosition(position: { x: number; y: number; z: number }, lookAt?: any, transitionDuration?: number): void;
    nodeLabel(callback: (node: any) => string): void;
    zoomToFit(duration?: number, padding?: number): void;
    pauseAnimation(): void;
    resumeAnimation(): void;
    refresh(): void;
  }
  
  export default ForceGraph3D;
}

declare module 'react-force-graph' {
  import React from 'react';
  
  interface ForceGraphProps {
    graphData: {
      nodes: Array<any>;
      links: Array<any>;
    };
    width?: number;
    height?: number;
    backgroundColor?: string;
    nodeColor?: string | ((node: any) => string);
    nodeLabel?: string | ((node: any) => string);
    nodeVal?: number | ((node: any) => number);
    linkColor?: string | ((link: any) => string);
    linkWidth?: number | ((link: any) => number);
    linkLabel?: string | ((link: any) => string);
    linkCurvature?: number;
    linkDirectionalArrowLength?: number;
    linkDirectionalArrowRelPos?: number;
    dagMode?: string;
    dagLevelDistance?: number;
    d3AlphaDecay?: number;
    d3VelocityDecay?: number;
    warmupTicks?: number;
    cooldownTicks?: number;
    onNodeClick?: (node: any, event: MouseEvent) => void;
    onNodeHover?: (node: any | null, previousNode: any | null) => void;
    onLinkClick?: (link: any, event: MouseEvent) => void;
    onLinkHover?: (link: any | null, previousLink: any | null) => void;
  }
  
  export class ForceGraph2D extends React.Component<ForceGraphProps> {
    zoom(factor: number, duration?: number): void;
    centerAt(x: number, y: number, duration?: number): void;
    zoomToFit(duration?: number, padding?: number): void;
    pauseAnimation(): void;
    resumeAnimation(): void;
    refresh(): void;
  }
  
  export class ForceGraphVR extends React.Component<ForceGraphProps> {}
  export class ForceGraphAR extends React.Component<ForceGraphProps> {}
} 