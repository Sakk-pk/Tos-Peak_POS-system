import axios from 'axios';

export const orderService = {
  async placeOrder(orderData) {
    const { data } = await axios.post('/orders', orderData);
    return data;
  }
};
