(function() {

  const geojsonFiles = [{name: 'neighbourhoods', path: './data/quartierssociologiques2014.geojson', geojson: ""}]

  const loadFeaturesFromGeojsonFiles = () => {
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

  loadFeaturesFromGeojsonFiles()

  function main () {
  const svgWidth = 960
  const svgHeight = 600

  const projection = d3.geoMercator()
    .rotate([0, -30, 0]).fitSize([svgWidth, svgHeight], geojsonFiles[0].geojson)

  const path = d3.geoPath()
    .projection(projection)

  d3.select('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  d3.select('svg')
    .selectAll('.neighbourhood')
    .data(geojsonFiles[0].geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .classed('neighbourhood', true)
}

})()
