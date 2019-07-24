import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

export const upload = async (entity: any) => {
  const data = {
    data: entity
  };
  return await axios.post("http://localhost:3001/api/datastore/v1/upload", data)
  .then((response: AxiosResponse<any>) => {
    return response;
  })
  .catch(console.error);
}

export const getNodes = async () => {
  return await axios.get("http://localhost:3001/api/datastore/v1/getNodes")
  .then((response: AxiosResponse<any>) => {
    return response;
  })
  .catch(console.error);
}

export const getNodesBySearch = async (search: string) => {
  const config: AxiosRequestConfig = {
    params: {
      search
    }
  }
  return await axios.get("http://localhost:3001/api/datastore/v1/getNodesBySearch", config)
  .then((response: AxiosResponse<any>) => {
    return response;
  })
  .catch(console.error);
}