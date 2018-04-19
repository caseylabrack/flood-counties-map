
{
  const margin = {top: 25, right: 25, bottom: 75, left: 25}

  const width = 800 -  margin.left - margin.right,
        height = 800 -  margin.top - margin.bottom

  var map = d3.select("#map").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  //import map data and values. nest one import function in the other. run all code in inner function
  d3.json("counties-simpled-noproj.json", function(error, mapData) {

    d3.csv("flood-data.csv", floodDataAccessor, function(error, floodData) {

        //good projection for map of the states
        let projection = d3.geoAlbersUsa().fitSize([width, height], mapData)

        //path generator for drawing geodata with our projection
        let path = d3.geoPath().projection(projection)

        //filter out Alaska and Hawaii
        mapData.features = mapData.features.filter( x => x.properties.STATEFP!="02" && x.properties.STATEFP!="15")

        //add new "balance" property from flood data to each county shape in the map data
        let gid, datum, balance
        for(let i = 0; i < mapData.features.length; i++) {

          gid = +mapData.features[i].properties.GEOID

          datum = floodData.filter( x => x.id===gid)

          if(datum[0]) {
            balance = datum[0].balance
            mapData.features[i].properties.balance = balance
          }
        }

        //draw map
        map.selectAll("path")
           .data(mapData.features)
           .enter()
           .append("path")
           .attr("d", path)
           .style("fill", d => colorScale(d.properties.balance))
           .style("stroke", "white")
           .style("stroke-width", .5)
           .on("click", function (d){
             console.log(d.properties.GEOID, d.properties.balance)
           })
    })
  })

  //when numbers are imported as strings, coerce those strings back to numbers
  function floodDataAccessor (d) {
      d.id = +d.id
      d.balance = +d.balance
      return d
  }

  function colorScale (d) {

    // color version
    if(d < -10000000) return "#06576D"
    if(d < -50000) return "#59AAB2"
    if(d > 2000000) return "#7F2969"
    if(d > 50000) return "#BA749B"
    if(d===undefined) return "#bbb"

    return "#ddd"
  }
}
