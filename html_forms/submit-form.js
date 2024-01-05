import http from 'k6/http';
import { sleep, check } from 'k6';
const constants = JSON.parse(open("../constants.json"));

export const options = {
    vus: 10,
    duration: '30s',
};

export default function () {
  //Request page containing a form
  let res = http.get('https://httpbin.test.k6.io/forms/post');

  res = res.submitForm({
    formSelector: 'form',
    fields: { 
        custname: 'test', 
        custtel: 'test2', 
        custemail: 'test@test.com', 
        size: 'medium', 
        topping: ['bacon', 'cheese'], 
        delivery: '20:00', 
        comments:'Im hungry'},
    submitSelector: 'button:contains("Submit order")'
    });
    sleep(3);
    // Extract the form data from the response JSON
    let formData = res.json('form');
    console.log(JSON.stringify(formData));

    //Check the status of the response
    check(res, {
        'form submission was successful': (r) => r.status == constants.STATUS_200,
    });
}

