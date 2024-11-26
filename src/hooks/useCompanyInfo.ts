import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CompanyFormData } from '../lib/validations';

export function useCompanyInfo() {
  const queryClient = useQueryClient();

  const companyInfo = useQuery({
    queryKey: ['company-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const updateCompanyInfo = useMutation({
    mutationFn: async (info: Partial<CompanyFormData>) => {
      const { error } = await supabase.from('company_info').upsert(info);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
    },
    onError: (error) => {
      console.error('Error updating company info:', error);
    },
  });

  // const uploadLogo = useMutation({
  //   mutationFn: async (file: File) => {
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = logo.${fileExt};

  //     const { error: uploadError } = await supabase.storage
  //       .from('company-assets')
  //       .upload(fileName, file, { upsert: true });

  //     if (uploadError) throw uploadError;

  //     const { data: { publicUrl } } = supabase.storage
  //       .from('company-assets')
  //       .getPublicUrl(fileName);

  //     await updateCompanyInfo.mutateAsync({ logo_url: publicUrl });
  //     return publicUrl;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['company-info'] });
  //   },
  //   onError: (error) => {
  //     console.error('Error uploading logo:', error);
  //   },
  // });

  return { companyInfo, updateCompanyInfo };
  // uncomment this and remove the line above when uploadLogo becomes active
  // return { companyInfo, updateCompanyInfo, uploadLogo };
}
