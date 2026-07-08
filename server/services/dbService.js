import { database } from '../database.js';

export const dbService = {
  getCollection: (name) => database.getCollection(name),
  saveCollection: (name, data) => database.saveCollection(name, data)
};
