import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createResource as createResourceRequest,
  getResources,
  getResourcesByTag,
  updateResource as updateResourceRequest,
} from '../api/methods/resource.methods';
import {
  createTag as createTagRequest,
  deleteTag as deleteTagRequest,
  getUserTags,
  type TagCreateRequest,
  type TagResponse,
} from '../api/methods/tag.methods';
import type {
  ResourceCreateRequest,
  ResourceListResponse,
  ResourceResponse,
  ResourceUpdate,
} from '../api/types/resource.types';
import toast from '../utils/toast';
import { useAuth } from './AuthContext';

interface PaginationState {
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface ResourceContextValue {
  tags: TagResponse[];
  resources: ResourceResponse[];
  pagination: PaginationState;
  selectedTag: string | null;
  currentPage: number;
  isLoadingTags: boolean;
  isLoadingResources: boolean;
  refreshTags: () => Promise<void>;
  refreshResources: (tag?: string | null, page?: number) => Promise<void>;
  selectTag: (tag: string | null) => void;
  goToPage: (page: number) => void;
  createTag: (request: TagCreateRequest) => Promise<TagResponse>;
  deleteTag: (tagId: number, tagName: string) => Promise<void>;
  createBookmark: (request: ResourceCreateRequest) => Promise<ResourceResponse>;
  updateBookmark: (
    resourceId: number,
    resourceData: ResourceUpdate
  ) => Promise<ResourceResponse>;
}

const DEFAULT_PAGINATION: PaginationState = {
  total: 0,
  page: 1,
  size: 20,
  pages: 0,
};

const ResourceContext = createContext<ResourceContextValue | undefined>(undefined);

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [resourcesResponse, setResourcesResponse] = useState<ResourceListResponse | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const tagsRequestIdRef = useRef(0);
  const resourcesRequestIdRef = useRef(0);

  const loadTags = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const requestId = ++tagsRequestIdRef.current;

    try {
      setIsLoadingTags(true);
      const nextTags = await getUserTags();
      if (tagsRequestIdRef.current !== requestId) {
        return;
      }

      setTags(Array.isArray(nextTags) ? nextTags : []);
    } catch (error: any) {
      if (tagsRequestIdRef.current === requestId) {
        console.error('加载标签失败:', error);
        toast.error(error.message || '加载标签失败');
      }
    } finally {
      if (tagsRequestIdRef.current === requestId) {
        setIsLoadingTags(false);
      }
    }
  }, [authLoading, isAuthenticated]);

  const loadResources = useCallback(
    async (tag: string | null, page: number) => {
      if (authLoading || !isAuthenticated) {
        return;
      }

      const requestId = ++resourcesRequestIdRef.current;

      try {
        setIsLoadingResources(true);
        const nextResources = tag
          ? await getResourcesByTag(tag, page, 20)
          : await getResources(page, 20);

        if (resourcesRequestIdRef.current !== requestId) {
          return;
        }

        setResourcesResponse(nextResources);
      } catch (error: any) {
        if (resourcesRequestIdRef.current === requestId) {
          console.error('加载资源失败:', error);
          toast.error(error.message || '加载资源失败');
        }
      } finally {
        if (resourcesRequestIdRef.current === requestId) {
          setIsLoadingResources(false);
        }
      }
    },
    [authLoading, isAuthenticated]
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setTags([]);
      setResourcesResponse(null);
      setSelectedTag(null);
      setCurrentPage(1);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadTags();
    }
  }, [authLoading, isAuthenticated, loadTags]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadResources(selectedTag, currentPage);
    }
  }, [authLoading, currentPage, isAuthenticated, loadResources, selectedTag]);

  useEffect(() => {
    if (!selectedTag) {
      return;
    }

    const exists = tags.some((tag) => tag.name === selectedTag);
    if (!exists) {
      setSelectedTag(null);
      setCurrentPage(1);
    }
  }, [selectedTag, tags]);

  const pagination = resourcesResponse
    ? {
        total: resourcesResponse.total,
        page: resourcesResponse.page,
        size: resourcesResponse.size,
        pages: resourcesResponse.pages,
      }
    : DEFAULT_PAGINATION;

  const refreshTags = useCallback(async () => {
    await loadTags();
  }, [loadTags]);

  const refreshResources = useCallback(
    async (tag: string | null = selectedTag, page: number = currentPage) => {
      await loadResources(tag, page);
    },
    [currentPage, loadResources, selectedTag]
  );

  const selectTag = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.pages) {
        return;
      }

      setCurrentPage(page);
    },
    [pagination.pages]
  );

  const createTag = useCallback(
    async (request: TagCreateRequest) => {
      const createdTag = await createTagRequest(request);

      setTags((prev) => {
        if (prev.some((tag) => tag.id === createdTag.id)) {
          return prev;
        }
        return [...prev, createdTag];
      });

      void loadTags();
      return createdTag;
    },
    [loadTags]
  );

  const deleteTag = useCallback(
    async (tagId: number, tagName: string) => {
      await deleteTagRequest(tagId);

      setTags((prev) => prev.filter((tag) => tag.id !== tagId));

      if (selectedTag === tagName) {
        setSelectedTag(null);
        setCurrentPage(1);
      } else {
        void loadResources(selectedTag, currentPage);
      }

      void loadTags();
    },
    [currentPage, loadResources, loadTags, selectedTag]
  );

  const createBookmark = useCallback(
    async (request: ResourceCreateRequest) => {
      const createdResource = await createResourceRequest(request);

      setResourcesResponse((prev) => {
        const size = prev?.size ?? 20;
        const existingResources = prev?.resources ?? [];
        const alreadyExists = existingResources.some(
          (resource) => resource.id === createdResource.id
        );
        const total = (prev?.total ?? existingResources.length) + (alreadyExists ? 0 : 1);
        const nextResources = [
          createdResource,
          ...existingResources.filter((resource) => resource.id !== createdResource.id),
        ];

        return {
          resources: nextResources.slice(0, size),
          total,
          page: 1,
          size,
          pages: Math.max(1, Math.ceil(total / size)),
        };
      });

      setSelectedTag(null);
      setCurrentPage(1);
      void loadTags();

      if (selectedTag === null && currentPage === 1) {
        void loadResources(null, 1);
      }

      return createdResource;
    },
    [currentPage, loadResources, loadTags, selectedTag]
  );

  const updateBookmark = useCallback(
    async (resourceId: number, resourceData: ResourceUpdate) => {
      const updatedResource = await updateResourceRequest(resourceId, resourceData);

      setResourcesResponse((prev) => {
        if (!prev) {
          return prev;
        }

        const matchesCurrentFilter =
          selectedTag === null || updatedResource.tags.includes(selectedTag);
        const nextResources = matchesCurrentFilter
          ? prev.resources.map((resource) =>
              resource.id === updatedResource.id ? updatedResource : resource
            )
          : prev.resources.filter((resource) => resource.id !== updatedResource.id);

        return {
          ...prev,
          resources: nextResources,
        };
      });

      void loadTags();
      void loadResources(selectedTag, currentPage);
      return updatedResource;
    },
    [currentPage, loadResources, loadTags, selectedTag]
  );

  const value = useMemo<ResourceContextValue>(
    () => ({
      tags,
      resources: resourcesResponse?.resources ?? [],
      pagination,
      selectedTag,
      currentPage,
      isLoadingTags,
      isLoadingResources,
      refreshTags,
      refreshResources,
      selectTag,
      goToPage,
      createTag,
      deleteTag,
      createBookmark,
      updateBookmark,
    }),
    [
      createBookmark,
      createTag,
      currentPage,
      deleteTag,
      goToPage,
      isLoadingResources,
      isLoadingTags,
      pagination,
      refreshResources,
      refreshTags,
      resourcesResponse?.resources,
      selectedTag,
      selectTag,
      tags,
      updateBookmark,
    ]
  );

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};

export const useResources = (): ResourceContextValue => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};
