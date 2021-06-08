const validCampground = JSON.parse(campground);
console.log(validCampground);

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map", 
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: validCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(validCampground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${validCampground.title}</h3><p>${validCampground.location}</p>`
        )
    )
    .addTo(map)