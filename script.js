const svg = d3.select('#tree-map');
const tooltip = d3.select('#tooltip');
const legend = d3.select('#legend');

const width = 1000;
const height = 600;

function renderTreeMap(dataUrl) {
  d3.json(dataUrl).then(data => {
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemap = d3.treemap()
      .size([width, height])
      .padding(1);

    treemap(root);

    const categories = [...new Set(root.leaves().map(d => d.data.category))];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll('*').remove();
    legend.selectAll('*').remove();

    const tiles = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    tiles.append('rect')
      .attr('class', 'tile')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('fill', d => colorScale(d.data.category))
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`)
          .attr('data-value', d.data.value)
          .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    tiles.append('text')
      .selectAll('tspan')
      .data(d => d.data.name.split(/\s+/))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 12 + i * 10)
      .text(d => d);

    legend.selectAll('.legend-item')
      .data(categories)
      .enter()
      .append('div')
      .attr('class', 'legend-item')
      .html(d => `
        <svg width="20" height="20">
          <rect width="20" height="20" fill="${colorScale(d)}"></rect>
        </svg>
        <span style="margin-left: 5px;">${d}</span>
      `);
  });
}

document.querySelector('#dataset-links').addEventListener('click', event => {
  if (event.target.tagName === 'A') {
    event.preventDefault();
    const url = event.target.dataset.url;
    renderTreeMap(url);
    document.querySelector('#title').textContent = event.target.textContent;
    document.querySelector('#description').textContent = `A visualization of the ${event.target.textContent.toLowerCase()}`;
  }
});

// Load the default dataset
renderTreeMap('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json');