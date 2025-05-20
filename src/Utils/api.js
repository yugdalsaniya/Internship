// src/api.js
import axios from 'axios';

const API_URL = 'https://crmapi.conscor.com/api/general';
const DB_NAME = 'internph';
const API_KEY = 'LHCHoE0IlCOuESA4VQuJ';

/**
 * Fetches data from a specific collection with optional filters and controls.
 * @param {Object} params - Parameters for fetching data.
 * @param {string} params.collectionName - Name of the collection (e.g., "company").
 * @param {Object} [params.query] - Query object.
 * @param {Object} [params.projection] - Fields to include/exclude.
 * @param {number} [params.limit] - Maximum number of documents to return.
 * @param {number} [params.skip] - Number of documents to skip.
 * @param {number} [params.order] - 1 for ascending, -1 for descending.
 * @param {string} [params.sortedBy] - Field to sort by.
 * @returns {Promise<Array>} - Array of sectionData objects.
 */
export const fetchSectionData = async (params) => {
  const {
    collectionName,
    query = {},
    projection = {},
    limit = 0,
    skip = 0,
    order = -1,
    sortedBy = 'createdAt',
  } = params;

  try {
    const response = await axios.post(
      `${API_URL}/mfind`,
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
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
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