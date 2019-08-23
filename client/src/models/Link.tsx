export default interface Link {
  [index:string]: string | number;
  target: string | number;
  source: string | number;
  date: string;
  type: string;
  fa: number; //fatalities
  in: number; //injuries
}