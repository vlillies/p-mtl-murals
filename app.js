(function() {

  const geojsonFiles = [{name: 'neighbourhoods', path: './data/quartierssociologiques2014.geojson', geojson: ""},
                        {name: 'adminRegions', path: './data/limadmin.geojson', geojson: ""},
                        {name: 'subways', path: './data/stm.geojson', geojson: ""},
                        {name: 'murals', path: './data/murals.geojson', geojson: ""}]

  loadGeojsonFilesAndRunMain()

  function loadGeojsonFilesAndRunMain () {
    let q = d3.queue()
    for (let file of geojsonFiles){
      q.defer(d3.json, file.path)
    }
    q.awaitAll((err, files) => {
      if (err) {
        throw err
      } else {
        addFilesToGeojsonFiles(files)
        main()
      }
    })
  }

  function addFilesToGeojsonFiles(files) {
    geojsonFiles.map((file, i) => file.geojson = files[i])
  }

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

    const tooltip = d3.select('body')
      .append('div')
      .classed('tooltip', true)

    svg
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .call(responsivefy)

    function responsivefy(svg) {
      let container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

      svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);


      d3.select(window).on("resize." + container.attr("id"), resize);

      function resize() {
        let targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
      }
    }

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

    svg
      .selectAll('.mural')
      .data(geojsonFiles[3].geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .classed('mural', true)
      .on('mouseover', handleMouseOverMural)
      .on('mousemove', handleMouseMoveMural)
      .on('mouseout', handleMouseOutMural)
      .on('mousedown', handleMouseClickMural)

    function handleMouseOverMural(){
      d3.select(this)
        .moveToFront()
        .classed('active', true)
    }

    //create a method used to bring the active svg to front
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    function handleMouseMoveMural (d) {
      tooltip
        .classed('active', true)
        .style('left', d3.event.x - (tooltip.node().offsetWidth /2 ) + 'px')
        .style('top', d3.event.y - (tooltip.node().offsetHeight + 10) + 'px')
        .html(`<img id='thumbnail' style='width: 200px; height: auto'  src=${d.properties.image}>`)
    }

    function handleMouseOutMural () {
      d3.select(this)
        .classed('active', false)
      tooltip
        .classed('active', false)
    }

    function handleMouseClickMural (d) {
      d3.select('.container')
        .append('div')
        .classed('popup', true)
          .html(
            `<a id='back' class="btn btn-primary">BACK TO MAP</a>
             <img src=${d.properties.image}>
                <div>
                  <h4 style='margin-top:5px'>Created by: ${d.properties.artiste} in ${d.properties.annee}</h4>
                  <h4>Located at: ${d.properties.adresse}</h4>
                </div>
              </div>`
          )

      d3.select('#back')
        .on('click', handleBackButton)
    }

    function handleBackButton () {
      d3.select('.popup')
        .remove()
    }
  }
})()
