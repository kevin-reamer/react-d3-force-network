import axios, { AxiosResponse } from "axios";

export const upload = async (entity: any) => {
  const data = {
    data: entity
  };
  //save a new form version to the Forms datastore
  return await axios.post("http://localhost:3001/api/datastore/v1/upload", data)
  .then((response: AxiosResponse<any>) => {
    return response;
  })
  .catch(console.error);
}