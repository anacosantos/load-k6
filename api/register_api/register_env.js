import http from 'k6/http';
import { check } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const constants = JSON.parse(open("../../constants.json"));

export const options = {
  vus: 1,
  iterations: 1
};

const USERNAME = `${randomString(8)}@example.com`; // Set email 
const PASSWORD = constants.PASSWORD;

// Register a new user and retrieve authentication token for subsequent API requests
export default function () {
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
//when you use this kind of configuration you need to create this kind of ENV and set the command below
//http.get(`http://${__ENV.MY_HOSTNAME}/`);
//k6 run -e MY_HOSTNAME=test-api.k6.io register_env.js

