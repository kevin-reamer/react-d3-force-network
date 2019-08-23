export default interface Node {
  [index:string]: string | number;
  id: string;
  date: string;
  type: string;
  fa: number; //fatalities
  in: number; //injuries
}