import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { GameServiceAPICall } from 'utils/apiCall';
import {
  ApiDataDTO,
  CallApiForClient,
  ClientApiDTO,
} from './dto/third-party.dto';

@Injectable()
export class ThirdPartyService {
  async callApiForClient(data: CallApiForClient) {
    const { apiReq, apiType, portal_id } = data;

    // Fetch Client from Domain
    const portal = await this.getClientFromDomain(portal_id);
    // console.log(client);

    if (portal.isError) return { isError: true, message: 'No Client Found!!' };

    // Renew Token if Token Not Found!!
    // let clientToken = client.data.token;
    // if (!clientToken) {
    //   let renewToken = await this.renewClientToken(client.data);

    //   if (renewToken.isError) {
    //     // Handle Error
    //     return { isError: true, message: 'Renew Token API Error!!' };
    //   } else clientToken = renewToken.newToken;
    // }

    // Fetch Client API Info by Client Id and Api Type
    const clientApi = await this.getApiInfo(portal.data.id, apiType);
    // console.log(clientApi);

    if (clientApi.isError)
      return {
        isError: true,
        message: 'Error in Getting Client API from DB',
        response: clientApi,
      };

    // const { id: client_api_id, api_endpoint, api_method } = clientApi.data;
    let headers = {
      ...apiReq.headers,
    };

    // Call API and Save Logs
    let ApiRes = await this.callApiAndSaveLog(portal.data.id, clientApi.data, {
      apiReq,
      headers,
    });
    // console.log(ApiRes);

    // Authentication Error
    let clientApiInvalidErrors = ['E-0045', 'E-0043'];
    // console.log('RENEW TOKEN OUT');
    // console.log(ApiRes);

    // if (
    //   ApiRes.isError &&
    //   clientApiInvalidErrors.includes(ApiRes.response.errorCode)
    // ) {
    //   // Client API Token is Invalid
    //   // Call Renew Token API
    //   // console.log('RENEW TOKEN IN');

    //   let tokenData = await this.renewClientToken(client.data);
    //   if (tokenData.isError)
    //     return {
    //       isError: true,
    //       message: 'Error in Renew Token API!! After Client API Response ',
    //       response: tokenData,
    //     };

    //   clientToken = tokenData.newToken;

    //   let headers = {
    //     secret_key: client.data.secret_key,
    //     ['api-token']: clientToken,
    //     ...apiReq.headers,
    //   };

    //   // Call API and Save Logs
    //   let ApiRes = await this.callApiAndSaveLog(
    //     client.data.id,
    //     clientApi.data,
    //     { apiReq, headers },
    //   );
    //   if (
    //     ApiRes.isError &&
    //     clientApiInvalidErrors.includes(ApiRes.response.errorCode)
    //   )
    //     return {
    //       isError: true,
    //       message: 'Client API Token is Still Invalid!!',
    //       response: ApiRes,
    //     };
    // }
    return {
      client_id: portal.data.id,
      response: ApiRes.response,
    };
  }

  async getClientFromDomain(portal_id: string | number) {
    // ALGO
    const portal = await global.DB.Portal.findOne({
      where: { id: portal_id },
      attributes: ['id'],
    });

    if (!portal)
      return {
        isError: true,
      };

    return {
      data: portal.toJSON(),
      isError: false,
    };
  }

  async getApiInfo(portal_id: string | number, api_type: string) {
    const clientApi = await global.DB.ClientApi.findOne({
      where: {
        portal_id,
        api_type,
        status: 'ACTIVE',
      },
      attributes: ['id', 'api_type', 'api_endpoint', 'api_method'],
    });

    if (!clientApi)
      return {
        isError: true,
      };

    return {
      data: clientApi.toJSON(),
      isError: false,
    };
  }

  async renewClientToken(client: any) {
    const { id: client_id, secret_key: client_secret_key } = client;

    // Fetch Client API Info by Client Id and Api Type
    const clientApi = await this.getApiInfo(client_id, 'RENEW_TOKEN');

    if (clientApi.isError)
      return { isError: true, message: 'No Client API Found!!' };

    // const { id: client_api_id, api_endpoint, api_method } = clientApi.data;
    const headers = {
      ['secret-key']: client_secret_key,
    };

    const ApiRes = await this.callApiAndSaveLog(client_id, clientApi.data, {
      apiReq: { body: {}, query: {} },
      headers,
    });

    if (ApiRes.isError)
      return { isError: true, message: 'Token Not Generated' };

    await global.DB.Client.update(
      { token: ApiRes.response.apiToken },
      { where: { id: client_id } },
    );

    return {
      message: 'Token Fetched Successfully!!',
      newToken: ApiRes.response.apiToken,
      isError: false,
    };
  }

  async callApiAndSaveLog(
    client_id: string,
    clientApi: ClientApiDTO,
    apiData: ApiDataDTO,
  ) {
    const { id: client_api_id, api_endpoint, api_method } = clientApi;
    const { apiReq, headers } = apiData;

    // Call API
    const ApiRes = await GameServiceAPICall(
      api_endpoint,
      '',
      api_method,
      apiReq,
      headers,
    );

    // // Saving API Log in DB
    // const apiLog = {
    //   client_id,
    //   client_api_id,
    //   req_raw_data: { ...apiReq, headers },
    //   res_raw_data: !ApiRes.serverError
    //     ? {
    //         status: ApiRes.status,
    //         response: ApiRes.response,
    //       }
    //     : {},
    //   is_error: ApiRes.isError ? '1' : '0',
    //   error_raw_data: ApiRes.serverError
    //     ? {
    //         message: ApiRes.message,
    //         error: ApiRes.error,
    //       }
    //     : {},
    // };
    // await global.DB.ThirdPartyApiLog.create(apiLog);

    return ApiRes;
  }
}
