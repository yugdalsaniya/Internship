// src/api.js
import axios from "axios";

const API_URL = "https://crmapi.conscor.com/api/general";
const DB_NAME = "internph";
const API_KEY = "LHCHoE0IlCOuESA4VQuJ";

export const fetchSectionData = async (params) => {
  const {
    collectionName,
    query = {},
    projection = {},
    limit = 0,
    skip = 0,
    order = -1,
    sortedBy = "createdAt",
    cacheBust, // New parameter
  } = params;

  try {
    const url = cacheBust ? `${API_URL}/mfind?_=${cacheBust}` : `${API_URL}/mfind`;
    const response = await axios.post(
      url,
      {
        dbName: DB_NAME,
        collectionName,
        query,
        projection,
        limit,
        skip,
        order,
        sortedBy,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data?.data || [];
    return raw;
  } catch (error) {
    console.error(`Error fetching data for collection '${collectionName}':`, error);
    return [];
  }
};