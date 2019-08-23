import { getNodesBySearch } from "../services/datastore";

export default class Search {
  searchTerm: string;
  searchParameters: any;
  searchResults: any;

  constructor(searchTerm: string, searchParameters: any) {
    this.searchTerm = searchTerm;
    this.searchParameters = searchParameters;
  }

  get getSearchTerm() {
    return this.searchTerm
  }

  getResults() {
    return this.searchResults
  }

  runSearch() {
    return getNodesBySearch(this.searchTerm, this.searchParameters).then((response: any) => {
      if (response.data) {
        this.searchResults = response.data;
      }
    })
  }
}