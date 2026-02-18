---
name: Rendering Showcase Graph
description: A graph page used to verify interactive graph rendering and side panel details.
date: 2026-02-18
---

```graph
{
  "nodes": [
    {
      "id": "input",
      "position": { "x": 120, "y": 80 },
      "data": {
        "label": "Input",
        "color": "yellow",
        "edgeColor": "p3",
        "tags": ["markdown", "source"],
        "content": "<p>Raw markdown enters the rendering pipeline.</p>",
        "createdAt": 1708200000000,
        "updatedAt": 1708203600000
      }
    },
    {
      "id": "renderer",
      "position": { "x": 360, "y": 80 },
      "data": {
        "label": "Renderer",
        "color": "blue",
        "edgeColor": "p1",
        "tags": ["pipeline", "core"],
        "content": "<p>The renderer transforms markdown into page output.</p>",
        "createdAt": 1708200000000,
        "updatedAt": 1708207200000
      }
    },
    {
      "id": "output",
      "position": { "x": 600, "y": 80 },
      "data": {
        "label": "Output",
        "color": "green",
        "edgeColor": "p4",
        "tags": ["page", "result"],
        "content": "<p>Rendered content is shown to the user.</p>",
        "createdAt": 1708200000000,
        "updatedAt": 1708210800000
      }
    }
  ],
  "edges": [
    {
      "id": "e-input-renderer",
      "source": "input",
      "target": "renderer",
      "label": "parse"
    },
    {
      "id": "e-renderer-output",
      "source": "renderer",
      "target": "output",
      "label": "render"
    }
  ]
}
```

## Rendering Checklist

1. Zoom and pan in the graph canvas.
2. Click different nodes and confirm side panel details update.
3. Toggle the minimap and verify interaction remains smooth.
4. Confirm this markdown section renders below the graph.
