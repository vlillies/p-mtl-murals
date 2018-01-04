(function() {

  const geojsonFiles = [{name: 'neighbourhoods', path: './data/quartierssociologiques2014.geojson', geojson: ""},
                        {name: 'adminRegions', path: './data/limadmin.geojson', geojson: ""},
                        {name: 'subways', path: './data/stm.geojson', geojson: ""}]

  const loadGeojsonFiles = () => {
    let q = d3.queue()
    for (let file of geojsonFiles){
      q.defer(d3.json, file.path)
    }
    q.awaitAll((err, files) => {
      if (err) {
        throw err
      } else {
        geojsonFiles.map((file, i) => file.geojson = files[i])
        main()
      }
    })
  }

  loadGeojsonFiles()

  function main () {
    const svgWidth = 960
    const svgHeight = 600

    const projection = d3.geoMercator()
      .rotate([0, -30, 0]).fitSize([svgWidth, svgHeight], geojsonFiles[0].geojson)

    const path = d3.geoPath()
      .projection(projection)

    const subwayColorScale = d3.scaleOrdinal()
      .domain(['bleue', 'jaune', 'orange', 'verte'])
      .range(['blue', 'yellow', 'orange', 'green'])

    const svg = d3.select('svg')

    svg
      .attr('width', svgWidth)
      .attr('height', svgHeight)

    svg
      .selectAll('.adminRegion')
      .data(geojsonFiles[1].geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .classed('adminRegion', true)

    svg
      .selectAll('.neighbourhood')
      .data(geojsonFiles[0].geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .classed('neighbourhood', true)

    svg
      .selectAll('.subway')
      .data(geojsonFiles[2].geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', d => subwayColorScale(d.properties.route_name))
      .classed('subway', true)
  }

})()
