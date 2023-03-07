import axios from 'axios';

const service = axios.create({
  timeout: 30 * 1000 // request timeout
});

export default service;
