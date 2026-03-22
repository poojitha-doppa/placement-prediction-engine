import axios from 'axios';

const ML_API_URL = 'http://localhost:5000';

interface StudentData {
  cgpa: number;
  tenth: number;
  twelfth: number;
  coding: number;
  projects: number;
  internships: number;
  communication: number;
}

interface PredictionResponse {
  probability: number;
  prediction: number;
  placed: string;
}

interface SimulationResponse {
  simulations: Array<{
    probability: number;
    prediction: number;
  }>;
  mean_probability: number;
  variance: number;
  risk_level: string;
}

/**
 * Get placement prediction from ML model
 */
export const getPrediction = async (data: StudentData): Promise<PredictionResponse> => {
  try {
    const response = await axios.post(`${ML_API_URL}/predict`, data);
    return response.data;
  } catch (error: any) {
    console.error('ML Prediction Error:', error.message);
    throw new Error(`Failed to get prediction: ${error.message}`);
  }
};

/**
 * Get Monte Carlo simulation results
 */
export const getSimulation = async (data: StudentData): Promise<SimulationResponse> => {
  try {
    const response = await axios.post(`${ML_API_URL}/simulate`, data);
    return response.data;
  } catch (error: any) {
    console.error('ML Simulation Error:', error.message);
    throw new Error(`Failed to get simulation: ${error.message}`);
  }
};

/**
 * Check if ML API is running
 */
export const checkMLAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${ML_API_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch (error) {
    console.error('ML API health check failed');
    return false;
  }
};
