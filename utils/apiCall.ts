import * as axios from 'axios';

export async function GameServiceAPICall(
    endpoint: string,
    url: string,
    method: string,
    apiReq: any,
    headers: any,
) {
    const { body, query } = apiReq;
    let headersList = { 'Content-Type': 'application/json', ...headers };

    let bodyContent = JSON.stringify({
        ...body,
    });

    let queryStringUrl = query ? new URLSearchParams(query).toString() : null;
    let reqOptions = {
        url: `${endpoint}${url}${queryStringUrl ? `?${queryStringUrl}` : ''}`,
        method,
        headers: headersList,
        data: bodyContent,
    };
    const AX: any = axios;

    let response: any;
    try {
        response = await AX.request(reqOptions);
        return {
            status: response.status,
            response: response.data,
            isError: false,
        };
    } catch (err) {
        if (!err.response)
            return {
                message: 'No Response from Server!!',
                errorCode: '',
                error: err,
                serverError: true,
                isError: true,
            };
        return {
            errorCode: '',
            status: err.response.status,
            response: err.response.data,
            isError: true,
        };
    }
}
