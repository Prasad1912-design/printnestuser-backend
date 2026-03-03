const axios = require("axios");

/**
 * Convert pincode to lat/lng using OpenStreetMap
 */
async function pincodeToLatLng(pincode) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${pincode}&countrycodes=in`;
  const res = await axios.get(url, {
    headers: { "User-Agent": "printnest-app" }
  });

  if (!res.data.length) {
    throw new Error("Invalid pincode");
  }

  return {
    lat: res.data[0].lat,
    lng: res.data[0].lon
  };
}

/**
 * Calculate road distance using OSRM
 */
async function getDistance(originPincode, destinationPincode) {
  const origin = await pincodeToLatLng(originPincode);
  const dest = await pincodeToLatLng(destinationPincode);

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`;

  const res = await axios.get(osrmUrl);

  const distanceKm = res.data.routes[0].distance / 1000;
  console.log(`Distance: ${distanceKm.toFixed(2)} km`);

  return distanceKm;
}

module.exports = getDistance;
