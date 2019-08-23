import TypeValue from "./TypeValue"

export default interface Bar {
  date: string;
  type: string;
  values: TypeValue[];
  emaValues: number[];
}