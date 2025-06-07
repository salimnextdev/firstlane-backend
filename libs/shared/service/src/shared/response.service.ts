export interface ObjectReturnType{

    message?:string,
    data?:any[]|any
    status?:boolean
}
export function serviceResponse({ message, data, status }:ObjectReturnType) {
  return {
    message,
    data,
    status,
  };
}
