import Config from '../../../Config';
import ApiRoute from '../../../routes/ApiRoute';

class bqo_api {
  static async fetching(action, data) {
    try {
      const res = await fetch(ApiRoute.BQO_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          secretkey: Config.SESSION_KEY(),
          sessionid: Config.SESSION_ID(),
        },
        body: JSON.stringify({ action, ...data }, null, 2),
      });
      const resJson = await res.json();
      return resJson;
    } catch (error) {
      return error;
    }
  }

  static getList(data) {
    return this.fetching('getList', data);
  }

  static add(data) {
    return this.fetching('add', data);
  }
}

export default bqo_api;
