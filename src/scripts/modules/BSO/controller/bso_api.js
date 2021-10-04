import Config from '../../../Config';
import ApiRoute from '../../../routes/ApiRoute';

class bso_api {
  static async add(data) {
    try {
      const res = await fetch(ApiRoute.BSO_X, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          secretKey: Config.SECRET_KEY,
        },
        body: JSON.stringify({ action: 'add', ...data }, null, 2),
      });
      const resJson = await res.json();
      return resJson;
    } catch (error) {
      return error;
    }
  }
}

export default bso_api;
