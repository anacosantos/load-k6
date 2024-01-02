import http from 'k6/http';
import { sleep, check, fail } from 'k6';

const constants = JSON.parse(open("../../constants.json"));

export const options = {
    vus: 10,
    duration: '30s',
};

export default function () {
  //testing k6 api:
  const logout = http.post(`http://${__ENV.MY_HOSTNAME}/auth/cookie/logout/`, { headers: { 'Content-Type': 'application/json', } });

  sleep(1);
  check(logout, { 'logout': (r) => r.status == constants.STATUS_200 });
  console.log(logout)
  if (!logout) {
    fail(constants.FAILED);
  }
}