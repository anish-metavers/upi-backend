export class CallApiForClient {
  apiReq: any;
  portal_id: string | number;
  apiType: string;
}

export class ClientApiDTO {
  id: string;
  api_endpoint: string;
  api_method: string;
}

export class ApiDataDTO {
  apiReq: any;
  headers: any;
}
