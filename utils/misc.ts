import { Op } from 'sequelize';

class QueryType {
  client_id?: string | number;
  portal_id?: string | number;
  user_id?: string | number;
  client_upi_id?: string | number;
}

export class Misc {
  static async createFilterFromRoles(
    user_role_name: string | number,
    req_client_id: string | number,
    req_user_id: string | number,
    query: QueryType,
  ) {
    const { client_id, portal_id, user_id, client_upi_id } = query;
    const filterObject: any = {};

    if (user_role_name === 'Master Admin') {
      if (client_id) filterObject.client_id = client_id;
      if (portal_id) filterObject.portal_id = portal_id;
    } else if (user_role_name === 'Admin') {
      filterObject.client_id = req_client_id;
      if (portal_id) filterObject.portal_id = portal_id;
    } else if (user_role_name === 'Portal Manager') {
      const userPortals = await global.DB.UserPortal.findAll({
        where: { user_id: req_user_id, ...(portal_id ? { portal_id } : {}) },
        attributes: ['id', 'portal_id'],
      });
      filterObject.client_id = req_client_id;
      filterObject.portal_id =
        userPortals.length > 0
          ? {
              [Op.in]: userPortals.map((item: any) => item.portal_id),
            }
          : 0;
    }

    return filterObject;
  }

  static RandomString(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
}
