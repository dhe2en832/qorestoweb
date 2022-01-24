import Config from '../../../Config';
import ApiRoute from '../../../routes/ApiRoute';

class bqo_api {
    static async getList(data) {
        try {
            const res = await fetch(ApiRoute.BQO_X, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    secretkey: Config.SESSION_KEY(),
                    sessionid: Config.SESSION_ID(),
                },
                body: JSON.stringify({ action: 'getlist', ...data }, null, 2),
            });
            const resJson = await res.json();
            return resJson;
        } catch (error) {
            return error;
        }
    }
}

export default bqo_api;