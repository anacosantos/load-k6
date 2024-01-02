import http from 'k6/http';
import { check } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const constants = JSON.parse(open("../../constants.json"));

const USERNAME = `${randomString(8)}@example.com`; // Set email 
const PASSWORD = constants.PASSWORD;

export const options = {
  vus: 1,
  iterations: 1
};

export default function () {

  const register =http.post(constants.URL +'/user/register/', {
    first_name: constants.FIRST_NAME,
    last_name: constants.LAST_NAME,
    username: USERNAME,
    password: PASSWORD,
  });
  check(register, { 'created user': (r) => r.status === constants.STATUS_201_CREATED });

  const loginRes = http.post(constants.URL + '/auth/token/login/', {
    username: USERNAME,
    password: USERNAME,
  });

  const authToken = loginRes.json('access');
  console.log(authToken)
  check(authToken, { 'logged in successfully': () => authToken !== '' });

  return authToken;
}
//k6 run register_api.js