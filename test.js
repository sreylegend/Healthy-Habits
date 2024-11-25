const axios = require('axios');

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      name: 'Test User',
      email: 'sreylegend@gmail.com',
      password: 'testpassword123'
    });
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
  }
};

testRegistration();
