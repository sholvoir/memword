const _db = {};

export const setAccessToken = (token) => localStorage.setItem('access-token', token);
export const getAccessToken = () => localStorage.getItem('access-token');
export const removeAccessToken = () => localStorage.removeItem('access-token');

export const setLastStudyTime = (studyTime) => localStorage.setItem('last-study-time', `${studyTime}`);
export const getLastStudyTime = () => localStorage.getItem('last-study-time');

export const setDictVersion = (version) => localStorage.setItem('dict-version', version);
export const getDictVersion = () => localStorage.getItem('dict-version');

const openDictDatabase = () => new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('dict', 1);
    openRequest.onerror = () => reject(`Database Error: ${openRequest.error}`);
    openRequest.onsuccess = () => resolve(openRequest.result);
    openRequest.onupgradeneeded = () => {
        const dictStore = openRequest.result.createObjectStore('dict', { keyPath: 'id' });
        dictStore.createIndex('word', 'word', { unique: true });
    };
});

const openTaskDatabase = (userId) => new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(userId, 1);
    openRequest.onerror = () => reject(`Database Error: ${openRequest.error}`);
    openRequest.onsuccess = () => resolve(openRequest.result);
    openRequest.onupgradeneeded = () => {
        const taskStore = openRequest.result.createObjectStore('task', { keyPath: 'id' });
        taskStore.createIndex('last', 'last');
        taskStore.createIndex('next', 'next');
    };
});

export const openDatabase = async (email) => {
    const onError = (err) => console.error(`Database Error: ${err}.`);
    _db.dict = await openDictDatabase();
    _db.dict.onerror = onError;
    _db.task = await openTaskDatabase(email);
    _db.task.onerror = onError;
};

export const putDict = (dict) => new Promise((resolve, reject) => {
    const request = _db.dict.transaction('dict', 'readwrite').objectStore('dict').put(dict);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = error => reject(error);
});

export const getDict = (id) => new Promise((resolve, reject) => {
    const request = _db.dict.transaction('dict').objectStore('dict').get(id);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = error => reject(error);
});

export const putTask = (task) => new Promise((resolve, reject) => {
    const request = _db.task.transaction('task', 'readwrite').objectStore('task').put(task);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = error => reject(error);
});

export const getTask = (id) => new Promise((resolve, reject) => {
    const request = _db.task.transaction('task').objectStore('task').get(id);
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = error => reject(error);
});

export const traversingTask = (each, finish, indexName, keyRange, direction) => new Promise((resolve, reject) => {
    const request = indexName ?
        _db.task.transaction('task').objectStore('task').index(indexName).openCursor(keyRange, direction) :
        _db.task.transaction('task').objectStore('task').openCursor(keyRange, direction);
    request.onerror = error => reject(error);
    request.onsuccess = ({ target: { result: cursor } }) => (cursor && each(cursor.value)) ? cursor.continue() : resolve(finish());
});