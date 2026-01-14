// Temporary test file to check connection
import { axiosInstance } from './lib/axios.js';

async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    const response = await axiosInstance.post('/test', {
      test: 'Hello from frontend'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testConnection();