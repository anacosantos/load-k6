import http from 'k6/http';
import { check } from 'k6';

const constants = JSON.parse(open("../../constants.json"));

export const options = {
    vus: 1,
    iterations: 1
};

export default function setup() {

  const loginRes = http.post(`http://${__ENV.MY_HOSTNAME}/auth/token/login/`, {
    username: constants.USERNAME,
    password: constants.USERNAME,
  });

  const authToken = loginRes.json('access');

  check(authToken, { 'logged in successfully': () => authToken !== '' });
  
  return authToken;
}
//k6 run -e MY_HOSTNAME=test-api.k6.io login_api.js
