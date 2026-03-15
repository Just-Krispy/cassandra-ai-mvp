/**
 * Cassandra AI - Interactive Decision Tree Visualization
 * D3.js v7 module for rendering AI-generated decision trees
 */

class DecisionTreeViz {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = {
      width: options.width || containerElement.clientWidth || 1200,
      height: options.height || containerElement.clientHeight || 800,
      nodeRadius: options.nodeRadius || 8,
      fontSize: options.fontSize || 14,
      animationDuration: options.animationDuration || 750,
      colorScheme: options.colorScheme || {
        decision: '#60a5fa', // blue
        chance: '#f59e0b', // amber
        positive: '#10b981', // green
        negative: '#ef4444', // red
        neutral: '#9ca3af', // gray
        background: '#0f172a', // dark slate
        text: '#f1f5f9', // light slate
        link: '#475569' // slate
      }
    };

    this.svg = null;
    this.root = null;
    this.treeLayout = null;
    this.zoom = null;
  }

  /**
   * Main rendering function
   * @param {Object|String} treeData - Tree data object or Claude response text
   */
  render(treeData) {
    // Clear previous content
    this.container.innerHTML = '';

    // Parse data if it's a string (Claude response)
    const parsedData = typeof treeData === 'string' 
      ? this.parseClaudeResponse(treeData) 
      : treeData;

    // Check if parsing was successful
    if (!parsedData || parsedData.fallback) {
      this.renderFallback(parsedData?.text || treeData);
      return;
    }

    // Initialize SVG
    this.initializeSVG();

    // Create tree layout
    this.root = d3.hierarchy(parsedData);
    this.treeLayout = d3.tree()
      .size([this.options.height - 100, this.options.width - 200])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

    // Collapse all children initially
    this.root.children?.forEach(child => this.collapse(child));

    // Initial update
    this.update(this.root);
  }

  /**
   * Initialize SVG with zoom and pan
   */
  initializeSVG() {
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .attr('class', 'decision-tree-svg');

    // Create zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        this.svg.select('g').attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // Create main group for tree
    const g = this.svg.append('g')
      .attr('transform', `translate(${this.options.width / 6}, ${this.options.height / 8})`);

    // Add background pattern
    const defs = this.svg.append('defs');
    
    // Gradient for links
    const gradient = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.options.colorScheme.link)
      .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.options.colorScheme.link)
      .attr('stop-opacity', 0.3);
  }

  /**
   * Update tree visualization
   */
  update(source) {
    const duration = this.options.animationDuration;
    const treeData = this.treeLayout(this.root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    // Normalize depth
    nodes.forEach(d => d.y = d.depth * 180);

    const g = this.svg.select('g');

    // Update links
    const link = g.selectAll('.link')
      .data(links, d => d.target.id || (d.target.id = ++this.nodeId));

    const linkEnter = link.enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => source.y0 || 0)
        .y(d => source.x0 || 0))
      .style('fill', 'none')
      .style('stroke', d => this.getLinkColor(d.target))
      .style('stroke-width', 2)
      .style('opacity', 0);

    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(duration)
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .style('opacity', 1);

    link.exit()
      .transition()
      .duration(duration)
      .attr('d', d3.linkHorizontal()
        .x(source.y)
        .y(source.x))
      .style('opacity', 0)
      .remove();

    // Update nodes
    const node = g.selectAll('.node')
      .data(nodes, d => d.id || (d.id = ++this.nodeId));

    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', `translate(${source.y0 || 0}, ${source.x0 || 0})`)
      .style('cursor', d => d.children || d._children ? 'pointer' : 'default')
      .on('click', (event, d) => this.handleNodeClick(event, d));

    // Add circles
    nodeEnter.append('circle')
      .attr('r', 0)
      .style('fill', d => this.getNodeColor(d))
      .style('stroke', this.options.colorScheme.text)
      .style('stroke-width', 2);

    // Add labels
    nodeEnter.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children || d._children ? -13 : 13)
      .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
      .text(d => d.data.name || d.data.label || 'Node')
      .style('fill', this.options.colorScheme.text)
      .style('font-size', `${this.options.fontSize}px`)
      .style('font-weight', '500')
      .style('opacity', 0);

    // Add probability labels on edges
    nodeEnter.filter(d => d.data.probability)
      .append('text')
      .attr('class', 'probability-label')
      .attr('dy', -10)
      .attr('x', -30)
      .text(d => d.data.probability)
      .style('fill', this.options.colorScheme.text)
      .style('font-size', `${this.options.fontSize - 2}px`)
      .style('opacity', 0);

    // Add tooltips
    nodeEnter.append('title')
      .text(d => this.getTooltipText(d));

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(duration)
      .attr('transform', d => `translate(${d.y}, ${d.x})`);

    nodeUpdate.select('circle')
      .transition()
      .duration(duration)
      .attr('r', this.options.nodeRadius)
      .style('fill', d => this.getNodeColor(d));

    nodeUpdate.select('text')
      .transition()
      .duration(duration)
      .style('opacity', 1);

    nodeUpdate.select('.probability-label')
      .transition()
      .duration(duration)
      .style('opacity', 0.7);

    node.exit()
      .transition()
      .duration(duration)
      .attr('transform', `translate(${source.y}, ${source.x})`)
      .style('opacity', 0)
      .remove();

    node.exit().select('circle')
      .transition()
      .duration(duration)
      .attr('r', 0);

    // Store old positions for transitions
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  /**
   * Handle node click (expand/collapse)
   */
  handleNodeClick(event, d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }

  /**
   * Collapse node and its children
   */
  collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(child => this.collapse(child));
      d.children = null;
    }
  }

  /**
   * Get node color based on type and outcome
   */
  getNodeColor(d) {
    const data = d.data;
    
    if (data.type === 'decision') {
      return this.options.colorScheme.decision;
    } else if (data.type === 'chance') {
      return this.options.colorScheme.chance;
    } else if (data.type === 'outcome') {
      if (data.value !== undefined) {
        return data.value > 0 
          ? this.options.colorScheme.positive 
          : data.value < 0 
            ? this.options.colorScheme.negative 
            : this.options.colorScheme.neutral;
      }
      if (data.outcome) {
        const outcome = data.outcome.toLowerCase();
        if (outcome.includes('positive') || outcome.includes('success') || outcome.includes('good')) {
          return this.options.colorScheme.positive;
        } else if (outcome.includes('negative') || outcome.includes('failure') || outcome.includes('bad')) {
          return this.options.colorScheme.negative;
        }
      }
    }
    
    return this.options.colorScheme.neutral;
  }

  /**
   * Get link color based on target node
   */
  getLinkColor(target) {
    if (target.data.probability) {
      const prob = parseFloat(target.data.probability);
      if (prob > 0.6) return this.options.colorScheme.positive;
      if (prob < 0.4) return this.options.colorScheme.negative;
    }
    return this.options.colorScheme.link;
  }

  /**
   * Generate tooltip text
   */
  getTooltipText(d) {
    const data = d.data;
    let text = data.name || data.label || 'Node';
    
    if (data.description) {
      text += `\n${data.description}`;
    }
    
    if (data.type) {
      text += `\nType: ${data.type}`;
    }
    
    if (data.probability) {
      text += `\nProbability: ${data.probability}`;
    }
    
    if (data.value !== undefined) {
      text += `\nValue: ${data.value}`;
    }
    
    if (data.outcome) {
      text += `\nOutcome: ${data.outcome}`;
    }
    
    return text;
  }

  /**
   * Parse Claude response into tree structure
   */
  parseClaudeResponse(text) {
    try {
      // Try to extract JSON if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to parse as direct JSON
      try {
        return JSON.parse(text);
      } catch (e) {
        // Continue to text parsing
      }

      // Parse structured text format
      const tree = this.parseTextToTree(text);
      if (tree && tree.name) {
        return tree;
      }

      // Fallback if parsing fails
      return { fallback: true, text };
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return { fallback: true, text };
    }
  }

  /**
   * Parse text-based decision tree into structured data
   */
  parseTextToTree(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Simple heuristic parser for tree structures
    // Format: "- Decision: [name]" or "  - Option: [name] (probability)" or "    → Outcome: [result]"
    
    const root = { name: 'Decision', type: 'decision', children: [] };
    const stack = [{ node: root, depth: 0 }];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const depth = line.search(/\S/);
      const match = trimmed.match(/^[-•→*]\s*(.+?)(?:\s*\((.+?)\))?$/);
      
      if (!match) continue;
      
      const [, content, metadata] = match;
      
      // Determine node type
      let type = 'decision';
      let name = content;
      
      if (content.toLowerCase().includes('outcome') || trimmed.startsWith('→')) {
        type = 'outcome';
        name = content.replace(/^outcome:\s*/i, '');
      } else if (metadata && metadata.includes('%')) {
        type = 'chance';
      }
      
      const node = {
        name,
        type,
        children: []
      };
      
      if (metadata) {
        if (metadata.includes('%')) {
          node.probability = metadata;
        }
        if (type === 'outcome') {
          node.outcome = metadata;
        }
      }
      
      // Find parent based on depth
      while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
        stack.pop();
      }
      
      if (stack.length > 0) {
        const parent = stack[stack.length - 1].node;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
      
      stack.push({ node, depth });
    }
    
    return root.children.length > 0 ? root : null;
  }

  /**
   * Render fallback text-based visualization
   */
  renderFallback(text) {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'decision-tree-fallback';
    fallbackDiv.innerHTML = `
      <div class="fallback-header">
        <h3>Decision Tree Analysis</h3>
        <p class="fallback-note">Interactive visualization unavailable - displaying text outline</p>
      </div>
      <div class="fallback-content">
        <pre>${this.escapeHtml(text)}</pre>
      </div>
    `;
    this.container.appendChild(fallbackDiv);
  }

  /**
   * Escape HTML for safe display
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Resize visualization to fit container
   */
  resize() {
    if (this.svg) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      
      this.options.width = width;
      this.options.height = height;
      
      this.svg
        .attr('width', width)
        .attr('height', height);
      
      if (this.root) {
        this.treeLayout.size([height - 100, width - 200]);
        this.update(this.root);
      }
    }
  }
}

// Node ID counter
DecisionTreeViz.prototype.nodeId = 0;

/**
 * Main export function for easy integration
 * @param {Object|String} treeData - Tree data or Claude response
 * @param {HTMLElement} containerElement - DOM element to render into
 * @param {Object} options - Visualization options
 */
function renderDecisionTree(treeData, containerElement, options = {}) {
  const viz = new DecisionTreeViz(containerElement, options);
  viz.render(treeData);
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => viz.resize(), 250);
  });
  
  return viz;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DecisionTreeViz, renderDecisionTree };
}

// Example tree data structure for reference:
const exampleTreeData = {
  name: "Should I invest in this startup?",
  type: "decision",
  children: [
    {
      name: "Invest $10,000",
      type: "chance",
      probability: "60%",
      children: [
        {
          name: "Startup succeeds",
          type: "outcome",
          value: 50000,
          outcome: "positive",
          probability: "30%"
        },
        {
          name: "Startup fails",
          type: "outcome",
          value: -10000,
          outcome: "negative",
          probability: "70%"
        }
      ]
    },
    {
      name: "Don't invest",
      type: "outcome",
      value: 0,
      outcome: "neutral"
    }
  ]
};
