import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://146.56.245.149:3000/',
  timeout: 5000
})

export default instance
