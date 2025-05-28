// src/api/contactService.js
import axios from 'axios';

export const sendContactRequest = (contactRequest) => {
  return axios.post('http://localhost:8080/api/contact-requests', contactRequest);
};
