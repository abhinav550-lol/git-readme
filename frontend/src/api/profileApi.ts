import { useMutation } from "@tanstack/react-query";
import { axiosPost } from "./axiosMethods";
import type { Response } from "./response";

interface GenerateIntroductionPayload {
  info: string;
  temperature: number;
}

interface GenerateIntroductionResponse extends Response<null> {
  introduction: string;
}

interface GenerateTechStackPayload {
  languages: string[];
}

interface GenerateTechStackResponse extends Response<null> {
  techStack: string;
}

interface GenerateStatsPayload {
  type: "classic" | "modern";
  theme: "dark" | "light";
}

interface GenerateStatsResponse extends Response<null> {
  statsSection: string;
}

interface GenerateSocialsPayload {
  socialLinks: {
    name: string;
    url: string;
  }[];
}

interface GenerateSocialsResponse extends Response<null> {
  socialSection: string;
}

interface GenerateReposPayload {
  repos: {
    repo: {
      name: string;
      description: string | null;
      html_url: string;
    };
    readmeContent: string;
  }[];
}

interface GenerateReposResponse extends Response<null> {
  repoSection: string;
}

interface GenerateProfilePayload {
  introduction: boolean;
  techstack: boolean;
  stats: boolean;
  repos: boolean;
  socials: boolean;
}

interface GenerateProfileResponse extends Response<string> {}

const fn = {
  generateIntroduction: async (payload: GenerateIntroductionPayload) => {
    const res = await axiosPost<
      GenerateIntroductionResponse,
      GenerateIntroductionPayload
    >(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/section/generate-introduction`,
      payload,
    );
    return res;
  },
  generateTechStack: async (payload: GenerateTechStackPayload) => {
    const res = await axiosPost<
      GenerateTechStackResponse,
      GenerateTechStackPayload
    >(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/section/generate-techstack`,
      payload,
    );
    return res;
  },
  generateStats: async (payload: GenerateStatsPayload) => {
    const res = await axiosPost<GenerateStatsResponse, GenerateStatsPayload>(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/section/generate-stats`,
      payload,
    );
    return res;
  },

  generateRepos: async (payload: GenerateReposPayload) => {
    try {
      const res = await axiosPost<GenerateReposResponse, GenerateReposPayload>(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile/section/generate-repos`,
        payload,
      );
      return res;
    } catch (err) {
      console.log("Error in generateRepos", err);
      return null;
    }
  },
  generateSocials: async (payload: GenerateSocialsPayload) => {
    const res = await axiosPost<
      GenerateSocialsResponse,
      GenerateSocialsPayload
    >(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/section/generate-socials`,
      payload,
    );
    return res;
  },
  generateProfile: async (payload: GenerateProfilePayload) => {
    const res = await axiosPost<
      GenerateProfileResponse,
      GenerateProfilePayload
    >(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/section/generate-profile`,
      payload,
    );
    return res;
  },
};

const queries = {};

const mutations = {
  useGenerateIntroduction: () => {
    return useMutation({
      mutationFn: fn.generateIntroduction,
    });
  },
  useGenerateTechStack: () => {
    return useMutation({
      mutationFn: fn.generateTechStack,
    });
  },
  useGenerateStats: () => {
    return useMutation({
      mutationFn: fn.generateStats,
    });
  },

  useGenerateRepos: () => {
    return useMutation({
      mutationFn: fn.generateRepos,
    });
  },
  useGenerateSocials: () => {
    return useMutation({
      mutationFn: fn.generateSocials,
    });
  },
  useGenerateProfile: () => {
    return useMutation({
      mutationFn: fn.generateProfile,
    });
  },
};

export { queries, mutations, fn as profileApiFn };
export type { GenerateProfilePayload };
