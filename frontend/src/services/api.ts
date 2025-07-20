import axios from 'axios';
import { CoinbaseData } from '../types';

const API_BASE_URL = 'http://localhost:8080';

export const api = {
  async getPriceData(): Promise<CoinbaseData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price data:', error);
      throw error;
    }
  }
};
