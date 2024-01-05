import http from 'k6/http';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  },
};

export default function () {
  http.get('https://test-api.k6.io/public/crocodiles/1/');
}
// output
// ✓ http_req_duration..............: avg=96.88ms  min=96.88ms  med=96.88ms  max=96.88ms  p(90)=96.88ms  p(95)=96.88ms
// { expected_response:true }...: avg=96.88ms  min=96.88ms  med=96.88ms  max=96.88ms  p(90)=96.88ms  p(95)=96.88ms
// ✓ http_req_failed................: 0.00%  ✓ 0        ✗ 1

//if any of the thresholds had failed, the little green checkmark ✓ 
//next to the threshold name (http_req_failed, http_req_duration) would be a red cross ✗ 
//and k6 would exit with a non-zero exit code.