import { getAccessToken } from './local';

const baseUrl = '/memword/api';

const fetchInit = (auth, method, body) => {
    const init = { mode: 'cors' };
    if (auth) {
        init.credentials = 'include';
        init.headers = {'Authorization': `Bearer ${getAccessToken()}`};
    } else init.credentials = 'omit';
    if (method) init.method = method;
    if (body) {
        init.headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body);
    }
    return init;
}

export const login = async (email) => await (await fetch(`${baseUrl}/login?email=${email}`)).json();
export const renew = async () => await (await fetch(`${baseUrl}/renew`, fetchInit(true))).json();

export const getDictById = async (id) => await (await fetch(`${baseUrl}/v1/dict/${id}`, fetchInit())).json();
export const getDictByVertgt = async (vergt) => await (await fetch(`${baseUrl}/v1/dict?vergt=${vergt}`, fetchInit())).json();

export const getTaskById = async (id) => await (await fetch(`${baseUrl}/v1/task/${id}`, fetchInit(true))).json();
export const getTaskByLastgt = async (lastgt) => await (await fetch(`${baseUrl}/v1/task?lastgt=${lastgt}`, fetchInit(true))).json();

export const insertDict = async (dict) => await (await fetch(`${baseUrl}/v1/dict`, fetchInit(true, 'POST', dict))).json();
export const updateDict = async (dict) => await (await fetch(`${baseUrl}/v1/dict/${dict.id}`, fetchInit(true, 'PATCH', dict)));

export const updateTask = async (task) => await (await fetch(`${baseUrl}/v1/task/${task.id}`, fetchInit(true, 'PUT', task)));