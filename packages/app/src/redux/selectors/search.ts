import { RootState } from "../types";
import { createSelector } from "reselect";

const s = (state: RootState) => state.search || {};

export const isSearching = createSelector(s, (state) => state.loading);

export const searchResults = createSelector(s, (state) => state.results);

export const searchTerm = createSelector(s, (state) => state.term);
