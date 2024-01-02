import http from 'k6/http';
import { check, group, fail } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const constants = JSON.parse(open("../../constants.json"));

const USERNAME = `${randomString(8)}@example.com`; // Set email 
const PASSWORD = constants.PASSWORD;

export function setup() {
    const register = http.post(`http://${__ENV.MY_HOSTNAME}/user/register/`, {
    first_name: constants.FIRST_NAME,
    last_name: constants.LAST_NAME,
    username: USERNAME,
    password: PASSWORD,
  });
  check(register, { 'created user': (r) => r.status === constants.STATUS_201_CREATED });

  const loginRes = http.post(`http://${__ENV.MY_HOSTNAME}/auth/token/login/`, {
    username: USERNAME,
    password: USERNAME,
  });

  const authToken = loginRes.json('access');
  check(authToken, { 'logged in successfully': () => authToken !== '' });

  return authToken;
}

export default (authToken) => {
    // set the authorization header on the session for the subsequent requests
    const requestConfigWithTag = (tag) => ({
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
        tags: Object.assign(
            {},
            {
                name: 'PrivateCrocs',
            },
            tag
        ),
    });

    let URL = `http://${__ENV.MY_HOSTNAME}/my/crocodiles/`; 

    group('01. Create a new crocodile', () => {
        const payload = {
            name: `Name ${randomString(10)}`,
            sex: 'F',
            date_of_birth: '2023-05-11',
        };

        const res = http.post(URL, payload, requestConfigWithTag({ name: 'Create' }));
        console.log(res, "res")

        if (check(res, { 'Croc created correctly': (r) => r.status === constants.STATUS_201_CREATED })) {
            URL = `${URL}${res.json('id')}/`;
        } else {
            console.log(`Unable to create a Croc ${res.status} ${res.body}`);
            return;
        }
    });

    group('02. Fetch private crocs', () => {
        const res = http.get(`${BASE_URL}/my/crocodiles/`, requestConfigWithTag({ name: 'Fetch' }));
        check(res, { 'retrieved crocs status': (r) => r.status === 200 });
        check(res.json(), { 'retrieved crocs list': (r) => r.length > 0 });
    });

    group('03. Update the croc', () => {
        const payload = { name: 'New name' };
        const res = http.patch(URL, payload, requestConfigWithTag({ name: 'Update' }));
        const isSuccessfulUpdate = check(res, {
            'Update worked': () => res.status === 200,
            'Updated name is correct': () => res.json('name') === 'New name',
        });

        if (!isSuccessfulUpdate) {
            console.log(`Unable to update the croc ${res.status} ${res.body}`);
            return;
        }
    });

    group('04. Delete the croc', () => {
        const delRes = http.del(URL, null, requestConfigWithTag({ name: 'Delete' }));

        const isSuccessfulDelete = check(null, {
            'Croc was deleted correctly': () => delRes.status === constants.STATUS_204_NO_CONTENT,
        });

        if (!isSuccessfulDelete) {
            console.log(`Croc was not deleted properly`);
            return;
        }
    });

};

//k6 run -e MY_HOSTNAME=test-api.k6.io crud_api.js