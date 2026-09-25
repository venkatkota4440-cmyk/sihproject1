import api from './api';

export const onboardingService = {
  completeOnboarding: (data) => api.post('/onboarding/complete', data),
  updateTourStatus: (data) => api.post('/onboarding/tour-status', data),
  getOnboardingState: () => api.get('/onboarding/state')
};

export default onboardingService;
