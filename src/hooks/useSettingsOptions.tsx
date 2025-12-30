import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getAccessToken } from "@/services/api";
import { toast } from "sonner";

// Helper to check if user is authenticated
const isAuthenticated = () => {
  return !!getAccessToken();
};

// User options type
export interface UserOptions {
  investmentTypes: string[];
  accountTypes: string[];
  commitmentTypes: string[];
  sipFrequencies: string[];
  cardNetworks: string[];
  vaultCategories: string[];
}

// Query keys
const queryKeys = {
  userOptions: ['settings', 'options'] as const,
};

export function useSettingsOptions() {
  const queryClient = useQueryClient();

  // Fetch user options
  const query = useQuery({
    queryKey: queryKeys.userOptions,
    queryFn: async () => {
      const response = await api.settings.getOptions();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch user options");
      }
      return response.data as UserOptions;
    },
    enabled: isAuthenticated(),
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user options mutation
  const updateMutation = useMutation({
    mutationFn: async (options: Partial<UserOptions>) => {
      const response = await api.settings.updateOptions(options);
      if (!response.success) {
        throw new Error(response.error || "Failed to update options");
      }
      return response.data as UserOptions;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.userOptions, data);
      toast.success("Options updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update options");
    },
  });

  return {
    options: query.data || {
      investmentTypes: [],
      accountTypes: [],
      commitmentTypes: [],
      sipFrequencies: [],
      cardNetworks: [],
      vaultCategories: [],
    },
    isLoading: query.isLoading,
    error: query.error,
    updateOptions: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

