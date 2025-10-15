import { useState, useEffect } from 'react';

interface DynamicFiltersState {
  showCallStatus: boolean;
  showConnectStatus: boolean;
  showNotInterestedReason: boolean;
  showTrackingStatus: boolean;
  showFollowUpDate: boolean;
  isNotInterestedReasonRequired: boolean;
  isFollowUpDateRequired: boolean;
}

export const useDynamicFilters = (
  taskType: string,
  callStatus?: string,
  connectStatus?: string
): DynamicFiltersState => {
  const [filters, setFilters] = useState<DynamicFiltersState>({
    showCallStatus: false,
    showConnectStatus: false,
    showNotInterestedReason: false,
    showTrackingStatus: false,
    showFollowUpDate: false,
    isNotInterestedReasonRequired: false,
    isFollowUpDateRequired: false,
  });

  useEffect(() => {
    const newFilters: DynamicFiltersState = {
      showCallStatus: taskType === 'Call',
      showConnectStatus: taskType === 'Call' && callStatus === 'Call Done',
      showNotInterestedReason: taskType === 'Call' && callStatus === 'Call Done' && connectStatus === 'Not Interested',
      showTrackingStatus: taskType === 'Tracking',
      showFollowUpDate: taskType === 'Call' && callStatus === 'Call Done' && connectStatus === 'Call back',
      isNotInterestedReasonRequired: taskType === 'Call' && callStatus === 'Call Done' && connectStatus === 'Not Interested',
      isFollowUpDateRequired: taskType === 'Call' && callStatus === 'Call Done' && connectStatus === 'Call back',
    };

    setFilters(newFilters);
  }, [taskType, callStatus, connectStatus]);

  return filters;
};
