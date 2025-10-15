// Official 18-stage pipeline for lead management
export const LEAD_STAGES = [
  'Yet to Assign',
  'Cold Lead',
  'Session Scheduled',
  'Hot Lead',
  'Yet to Submit',
  'Tracking',
  'Applied',
  'Admission Granted',
  'Visa Lodged',
  'Visa Granted',
  'Enrolled',
  'Rejected',
  'Deferred',
  'Not Interested',
  'Duplicate',
  'Invalid',
  'Spam',
  'Lost'
] as const;

export type LeadStage = typeof LEAD_STAGES[number];

// Stage transition logic based on task type and status
export const getNextStageFromTask = (
  currentStage: string,
  taskType: string,
  callStatus?: string,
  connectStatus?: string,
  trackingStatus?: string
): string | null => {
  // Session Scheduled when call done and interested
  if (taskType === 'Call' && callStatus === 'Call Done' && connectStatus === 'Interested') {
    return 'Session Scheduled';
  }
  
  // Not Interested when explicitly stated
  if (taskType === 'Call' && callStatus === 'Call Done' && connectStatus === 'Not Interested') {
    return 'Not Interested';
  }
  
  // Hot Lead when session is completed
  if (taskType === 'Session' && currentStage === 'Session Scheduled') {
    return 'Hot Lead';
  }
  
  // Tracking when credentials are logged
  if (taskType === 'Tracking' && trackingStatus === 'Credentials logging') {
    return 'Tracking';
  }
  
  // Applied when application is submitted
  if (taskType === 'Tracking' && trackingStatus === 'Application Submitted') {
    return 'Applied';
  }
  
  return null;
};
