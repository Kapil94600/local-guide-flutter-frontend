import api from "./api";

export const getPhotographersByPlace = (placeId) =>
  api.get(`/photographers/get_by_place?placeId=${placeId}`);

export const getAllPhotographers = () =>
  api.get("/photographers/get_all");
