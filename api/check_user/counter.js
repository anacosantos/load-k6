import http from 'k6/http';
import { Counter } from 'k6/metrics';

const CounterErrors = new Counter('Errors');

export const options = { thresholds: { Errors: ['count<100'] } };

export default function () {
  const res = http.get(`http://${__ENV.MY_HOSTNAME}/public/crocodiles/4/`);
  const contentOK = res.json('name') === 'Solomon';
  const contentAge = res.json('age') === '29';
  console.log(contentOK)
  CounterErrors.add(!contentOK);
  CounterErrors.add(!contentAge)
}